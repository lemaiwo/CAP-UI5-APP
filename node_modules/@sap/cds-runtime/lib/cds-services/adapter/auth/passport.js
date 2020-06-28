const getError = require('../../util/getError')
const hasPackage = require('../utils/hasPackage')
const getAnnotations = require('../utils/getAnnotations')

const _getBasicAuthHandler = credentials => {
  return function (user, password, done) {
    if (credentials[user] === password) {
      return done(null, { id: user })
    }

    // use this.fail() instead of done bacause of multiple strategies
    return this.fail(getError(401))
  }
}

const _basic = credentials => {
  const { BasicStrategy } = require('passport-http')
  return new BasicStrategy(_getBasicAuthHandler(credentials))
}

const _hasMoreThanAny = annotations => {
  const keys = Object.keys(annotations)
  return (
    keys.length > 0 &&
    keys.some(k => annotations[k].some(anno => anno.where || (anno.to && anno.to.some(role => role !== 'any'))))
  )
}

const _isMultiTenant = () => {
  return global.cds.env.requires && global.cds.env.requires.db && global.cds.env.requires.db.multiTenant
}

const _hasSecurity = (model, serviceName) => {
  const annotations = [getAnnotations(model.definitions[serviceName])]
  if (model.childrenOf && typeof model.childrenOf === 'function') {
    const definitions = model.childrenOf(serviceName)
    for (const k in definitions) {
      annotations.push(getAnnotations(definitions[k]))
    }
  }
  return annotations.some(_hasMoreThanAny)
}

const _jwt = uaa => {
  const JWTStrategy = require('@sap/xssec').JWTStrategy
  if (uaa && uaa.credentials) {
    return new JWTStrategy(uaa.credentials)
  }

  return new JWTStrategy(require('../../util/xsenv')('xsuaa', uaa))
}

const _mock = users => {
  const Mock = require('./Mock')
  return new Mock(users)
}

const getStrategyByName = (strategy, options, iterator) => {
  switch (strategy) {
    case 'basic':
      return _basic(
        Array.isArray(options.passport.credentials)
          ? options.passport.credentials[iterator.credentials++]
          : options.passport.credentials
      )
    case 'JWT':
      return _jwt(Array.isArray(options.uaa) ? options.uaa[iterator.uaa++] : options.uaa)
    case 'mock':
      return _mock(
        Array.isArray(options.passport.users) ? options.passport.users[iterator.users++] : options.passport.users
      )
    case 'dummy':
      return false
  }

  setImmediate(() => {
    throw new Error(`Invalid authentication strategy provided: ${JSON.stringify(options.passport.strategy)}`)
  })
}

const _getOneStrategyByName = options => {
  switch (options.passport.strategy) {
    case 'basic':
      return Array.isArray(options.passport.credentials)
        ? options.passport.credentials.map(crd => _basic(crd))
        : [_basic(options.passport.credentials)]
    case 'JWT':
      return Array.isArray(options.uaa) ? options.uaa.map(uaa => _jwt(uaa)) : [_jwt(options.uaa)]
    case 'mock':
      return Array.isArray(options.passport.users)
        ? options.passport.users.map(usr => _mock(usr))
        : [_mock(options.passport.users)]
    case 'dummy':
      return false
  }

  setImmediate(() => {
    throw new Error(`Invalid authentication strategy provided: ${JSON.stringify(options.passport.strategy)}`)
  })
}

const _getStrategy = options => {
  if (typeof options.passport.strategy === 'object' && options.passport.strategy.authenticate) {
    return [options.passport.strategy]
  }
  if (Array.isArray(options.passport.strategy)) {
    const iterator = {
      credentials: 0,
      uaa: 0,
      users: 0
    }
    const strategies = []
    for (const stg of options.passport.strategy) {
      if (stg.authenticate) {
        strategies.push(stg)
      } else {
        strategies.push(getStrategyByName(stg, options, iterator))
      }
    }

    return strategies
  }

  return _getOneStrategyByName(options)
}

const _extendOptionsFromCdsEnv = options => {
  if (global.cds.env.auth && global.cds.env.auth.passport) {
    options.passport = global.cds.env.auth.passport
  }

  if (!options.uaa && global.cds.env.requires && global.cds.env.requires.uaa) {
    options.uaa = global.cds.env.requires.uaa
  }
}

/**
 * In case there are security annotions and xssec is installed, auto configuration.
 * @param {Object} options
 * @param {Object} model
 * @param {String} serviceName
 * @private
 */
const _autoDetectStrategy = (options, model, serviceName) => {
  if (!_hasSecurity(model, serviceName) && (!_isMultiTenant() || process.env.NODE_ENV !== 'production')) {
    if (_isMultiTenant()) {
      console.warn(`[auth] - ${serviceName} - authentication needed for multi tenancy in production`)
    }
    return
  }

  if (!hasPackage('passport')) {
    return false
  }

  _extendOptionsFromCdsEnv(options)

  if (!options.passport) {
    if (hasPackage('@sap/xssec')) {
      options.passport = { strategy: 'JWT' }
    } else if (hasPackage('passport-http')) {
      options.passport = { strategy: 'basic', credentials: {} }
    } else if (process.env.NODE_ENV !== 'production') {
      options.passport = { strategy: 'mock' }
    } else {
      options.passport = { strategy: 'dummy' }
      console.error(
        `[auth] - ${serviceName} - authentication strategy cannot be detected. Authentication is required to enforce the modelled authorization restrictions. To enable the 'JWT' strategy (as recommended in production mode) ensure that passport, @sap/xssec and @sap/audit-logging are installed.`
      )
    }
  }

  return _getStrategy(options)
}

const _getAuthDebugMessage = (isAutoDetected, serviceName, strategies) => {
  const strategx = strategies.length === 1 ? 'strategy' : 'strategies'
  const getStrategyName = strategy => {
    return typeof strategy === 'object' ? strategy.name : strategy
  }
  const strategiesList = strategies
    .map(strategy => {
      return `'${getStrategyName(strategy)}'`
    })
    .join(', ')
  const reason = (() => {
    switch (getStrategyName(strategies[0])) {
      case 'JWT':
        return 'passport and @sap/xssec are installed'
      case 'basic':
        return 'passport and passport-http are installed'
      case 'mock':
        return '@sap/xssec and passport-http are not installed'
    }
  })()
  const details = isAutoDetected
    ? `(auto-detected because ${reason})`
    : '(as configured or defined in the serve options)'
  return `[auth] - ${serviceName} - applying authentication ${strategx} ${strategiesList} ${details}.`
}

/**
 *
 * @param {Object} options
 * @param {Object} model
 * @param {String} serviceName
 * @return {Authenticator|Passport}
 */
const _getAuthConfig = (options, model, serviceName) => {
  const usingAutoDetect = !options.passport
  const strategies = usingAutoDetect ? _autoDetectStrategy(options, model, serviceName) : _getStrategy(options)

  if (!strategies) {
    return strategies
  }

  if (strategies.length === 0) {
    return undefined
  }

  if (/\b(y|all|true|auth)\b/.test(process.env.DEBUG)) {
    console.log(_getAuthDebugMessage(usingAutoDetect, serviceName, strategies))
  }

  const passport = require('passport')
  const names = []
  for (let i = 0; i < strategies.length; i++) {
    const name = `${serviceName}_${i}`
    names.push(name)
    passport.use(name, strategies[i])
  }

  return { passport, names }
}

const _errorHandler = (err, req, res, next) => {
  if (err) {
    // err.status is http error code from passport
    res.status(err.statusCode || err.status || 500)
    res.send({
      error: {
        code: err.code,
        message: err.message
      }
    })

    return
  }

  next()
}

const passport = (service, app, auditLogger, options) => {
  // continue with a shallow copy to not set options.passport and/or options.uaa for other services
  const _options = Object.assign({}, options)

  const authConfig = _getAuthConfig(_options, service.model, service.name)

  if (typeof authConfig === 'object') {
    app.use(service.path, authConfig.passport.initialize())
    app.use(service.path, require('./passportAuthenticateCallback')(authConfig.passport, authConfig.names, auditLogger))
    app.use(service.path, require('./serviceAuth')(service.model.definitions[service.name], auditLogger))
  } else if (authConfig === false) {
    // Security annotations, but no passport
    app.use(service.path, require('./serviceAuth')(service.model.definitions[service.name], auditLogger))
  }

  app.use(service.path, _errorHandler)
}

module.exports = passport
