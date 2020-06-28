const readHandler = require('./handlers/read')
const createHandler = require('./handlers/create')
const deleteHandler = require('./handlers/delete')
const updateHandler = require('./handlers/update')

class Rest {
  constructor (cdsService) {
    this._cdsService = cdsService
    this._createRouter()
    this._addDispatcher()
  }

  get _express () {
    const express = require('express')
    Object.defineProperty(this, '_express', { value: express })
    return express
  }

  _createRouter () {
    this.router = this._express.Router()
    this.router.use(this._express.json())
  }

  _addDispatcher () {
    this.router.get('/*', readHandler(this._cdsService))
    this.router.post('/*', createHandler(this._cdsService))
    this.router.delete('/*', deleteHandler(this._cdsService))
    this.router.put('/*', updateHandler(this._cdsService))
    this.router.patch('/*', updateHandler(this._cdsService))
    /*
    this._router.head()
    */
  }
}

module.exports = Rest
