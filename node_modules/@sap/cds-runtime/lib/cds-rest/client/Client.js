const executeHttpRequest = require('@sap-cloud-sdk/core').executeHttpRequest
const cqnToQuery = require('../cqnToQuery')

const findServiceName = (model, ds, options) => {
  const modelServices = Object.values(model.services)

  if (options.credentials && options.credentials.service) {
    if (!modelServices.find(srv => srv.name === options.credentials.service)) {
      throw new Error(`Service "${options.credentials.service}" not found in provided model`)
    }

    return options.credentials.service
  }

  return ds
}

const createDestinationObject = (name, credentials) => {
  if (!credentials) {
    throw new Error(`No credentials configured for "${name}"`)
  }

  if (!credentials.url) {
    throw new Error(`No url configured in credentials for "${name}"`)
  }

  return { name, ...credentials }
}

const getKind = options => {
  const kind = (options.credentials && options.credentials.kind) || options.kind
  if (typeof kind === 'object') {
    return Object.keys(kind).find(key => key === 'odata' || key === 'rest')
  }

  return kind
}

/**
 * Rest Client
 */
class RestClient {
  /**
   * @param {Object} options - provided options
   * @param {String} [options.destination] - destination name. Optional in local development mode (automatic lookup will be done)
   * @param {String} options.model - reflected CSN model of the target service.
   * @param {String} options.kind - kind of service (odata/rest).
   * @param {Number} [options.requestTimeout] - number of ms until request timeout. 0 ms means no timeout. Default: 60000
   */

  constructor (options = {}) {
    this.options = options
    this.destination = options.credentials && options.credentials.destination
    this.name = options.datasource
    this.requestTimeout = options.credentials && options.credentials.requestTimeout
    this.kind = getKind(options)

    if (!this.destination && process.env.NODE_ENV === 'production') {
      throw new Error('In production mode it is required to set `options.destination`')
    }

    if (this.requestTimeout === null || this.requestTimeout === undefined) {
      // Default request timeout
      this.requestTimeout = 60000
    }
  }

  /**
   * Method to be overwritten by other clients to provide options for query interpretation.
   */
  get _cqnToQueryOptions () {
    const generateKeyPath = require(`../cqnToQuery/generate${this.kind === 'odata' ? 'OData' : 'Rest'}KeyPath`)
    Object.defineProperty(this, '_cqnToQueryOptions', { value: { generateKeyPath } })
    return { generateKeyPath }
  }

  /**
   * Normalizes server path.
   *
   * Adds / in the beginning of the path if not exists.
   * Removes / in the end of the path if exists.
   * @param {*} path - to be normalized
   */
  static _formatPath (path) {
    let formattedPath = path
    if (!path.startsWith('/')) {
      formattedPath = `/${formattedPath}`
    }

    if (path.endsWith('/')) {
      formattedPath = formattedPath.substring(0, formattedPath.length - 1)
    }

    return formattedPath
  }

  /**
   * Dummy .connect function for pool
   */
  connect () {
    return Promise.resolve(this)
  }

  /**
   * Dummy .isValid function for pool
   */
  isValid () {
    return true
  }

  /**
   * Dummy .end function for pool
   */
  end () {
    return Promise.resolve()
  }

  /**
   * Alias for .execute
   */
  run (...args) {
    if (!this.destination) {
      this.destination = createDestinationObject(
        findServiceName(this._csn, this.name, this.options),
        this.options.credentials
      )
    }

    return this.execute(...args)
  }

  /**
   * Executes the query.
   * If provided as CQN, it will be translated to a string query.
   * Automatically, adds headers if needed.
   *
   * Usage:
   * .execute(CQN)
   * .execute('GET Entity')
   * .execute('GET /Entity?$queryparam')
   * .execute('POST Entity', body)
   * ...
   * @param {*} query - CQN or string query
   * @param {*} [data] - optional request body for string queries
   */
  execute (query, data) {
    const reqOptions = {
      timeout: this.requestTimeout
    }

    if (typeof query === 'object') {
      try {
        const queryObject = cqnToQuery(query, {
          ...this._cqnToQueryOptions,
          model: this._csn,
          kind: this.kind
        })
        reqOptions.method = queryObject.method
        reqOptions.url = encodeURI(
          queryObject.path
            // ugly workaround for Okra not allowing spaces in ( x eq 1 )
            .replace(/\( /g, '(')
            .replace(/ \)/g, ')')
        )
        reqOptions.data = queryObject.body
      } catch (err) {
        return Promise.reject(err)
      }
    }

    if (typeof query === 'string') {
      query = query.trim()
      const blankIndex = query.substring(0, 8).indexOf(' ')
      reqOptions.method = query.substring(0, blankIndex).toUpperCase()
      reqOptions.url = encodeURI(RestClient._formatPath(query.substring(blankIndex, query.length).trim()))
      reqOptions.data = data
    }

    reqOptions.headers = { accept: 'application/json' }

    if (reqOptions.data) {
      reqOptions.headers['content-type'] = 'application/json'
      reqOptions.headers['content-length'] = Buffer.byteLength(JSON.stringify(reqOptions.data))
    }

    if (this.kind === 'odata' && reqOptions.method === 'GET') {
      const format = reqOptions.url.includes('?$') ? '&$format=json' : '?$format=json'
      reqOptions.url = `${reqOptions.url}${format}`
    }

    return this._run(reqOptions).then(result => {
      this._handleAliasInResult(query, result)
      return typeof query === 'object' && query.SELECT && query.SELECT.one ? result[0] : result
    })
  }

  _createPostProcessor (query) {
    if (query && query.SELECT && query.SELECT.columns) {
      let postProcessor
      for (const col of query.SELECT.columns) {
        if (col.as) {
          ;(postProcessor || (postProcessor = new Map())) && postProcessor.set(col.ref[col.ref.length - 1], col.as)
        }
      }

      return postProcessor
    }
  }

  _handleAliasInResult (query, result) {
    const postProcessor = this._createPostProcessor(query)
    const resultArray = Array.isArray(result) ? result : [result]
    if (postProcessor) {
      for (const row of resultArray) {
        for (const col in row) {
          if (postProcessor.get(col) && postProcessor.get(col) !== col) {
            row[postProcessor.get(col)] = row[col]
            delete row[col]
          }
        }
      }
    }
  }

  _run (reqOptions) {
    const destination =
      typeof this.destination === 'string' ? { destinationName: this.destination, jwt: this._jwt } : this.destination

    return executeHttpRequest(destination, reqOptions).then(response => {
      return this.kind === 'odata' ? this._getPurgedODataResponse(response) : response.data
    })
  }

  _purgeODataV2 (data) {
    const purgedResponse = data.results || data
    if (Array.isArray(purgedResponse)) {
      for (const row of purgedResponse) {
        delete row.__metadata
      }

      return purgedResponse
    }

    delete purgedResponse.__metadata
    return purgedResponse
  }

  _purgeODataV4 (data) {
    const purgedResponse = data.value || data
    for (const key of Object.keys(purgedResponse)) {
      if (key.startsWith('@odata.')) {
        delete purgedResponse[key]
      }
    }
    return purgedResponse
  }

  _getPurgedODataResponse (response) {
    if (typeof response.data !== 'object') {
      return response.data
    }

    if (response.data && response.data.d) {
      return this._purgeODataV2(response.data.d)
    }
    return this._purgeODataV4(response.data)
  }

  /**
   * Not supported .stream function
   *
   * @throws Error
   */
  stream () {
    return Promise.reject(new Error('This feature is not supported'))
  }

  /**
   * Not supported .foreach function
   *
   * @throws Error
   */
  foreach () {
    return Promise.reject(new Error('This feature is not supported'))
  }

  /**
   * Not supported .deploy function
   *
   * @throws Error
   */
  deploy () {
    return Promise.reject(new Error('This feature is not supported'))
  }

  /**
   * Dummy .setUser function
   */
  setUser () {}

  /**
   * Dummy .setLocale function
   */
  setLocale () {}

  /**
   * Dummy .setCSN function
   */
  setCSN (csn) {
    this._csn = csn
  }

  /**
   * Dummy .setContext function to be used for token forwarding
   */
  setContext (context) {
    if (context && context.attr && context.attr.token) {
      this._jwt = context.attr.token
    }
  }

  /**
   * Dummy .begin function
   */
  begin () {
    return Promise.resolve()
  }

  /**
   * Dummy .commit function to be used for token deletion
   */
  commit () {
    delete this._jwt
  }

  /**
   * Dummy .rollback function to be used for token deletion
   */
  rollback () {
    delete this._jwt
  }
}

module.exports = RestClient
