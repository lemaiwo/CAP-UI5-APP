const {
  Components: { DATA_CREATE_HANDLER, DATA_DELETE_HANDLER, DATA_READ_HANDLER, DATA_UPDATE_HANDLER }
} = require('@sap/odata-server')
const boundToCQN = require('./boundToCQN')
const readToCQN = require('./readToCQN')
const updateToCQN = require('./updateToCQN')
const createToCQN = require('./createToCQN')
const deleteToCQN = require('./deleteToCQN')

/**
 * This method transforms an odata request into a CQN object.
 * @param {string} component - Component name.
 * @param {Object} service - Service, which will process this request.
 * @param context - Contains request information and utility methods like statements.
 * @param req - An odata request.
 */
const odataToCQN = (component, service, context, req) => {
  switch (component) {
    case DATA_CREATE_HANDLER:
      return createToCQN(context, req)
    case DATA_DELETE_HANDLER:
      return deleteToCQN(context, req)
    case DATA_READ_HANDLER:
      return readToCQN(service, context, req)
    case DATA_UPDATE_HANDLER:
      return updateToCQN(context, req)
    case 'BOUND.ACTION':
    case 'BOUND.FUNCTION':
      return boundToCQN(service, context, req)
    default:
      return {}
  }
}

module.exports = odataToCQN
