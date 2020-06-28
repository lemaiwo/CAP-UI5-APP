const {
  uri: {
    UriResource: {
      ResourceKind: { NAVIGATION_TO_MANY }
    }
  }
} = require('@sap/odata-server')

const { skipToken } = require('../utils/request')
const { addLimit } = require('./utils')

const _getPageSizes = uriInfo => {
  // REVISIT: how not to use internal property _configuration?
  const target =
    uriInfo.getLastSegment().getKind() === NAVIGATION_TO_MANY
      ? uriInfo.getLastSegment().getTarget()
      : uriInfo.getLastSegment().getEntitySet() || {}

  // target === null if view with parameters
  const { defaultPageSize, maxPageSize } = (target && target._configuration) || {}
  return { defaultPageSize, maxPageSize }
}

const _getOffset = (offset, incomingSkipToken) => {
  return (offset || 0) + incomingSkipToken
}

const _getMaxRows = (rows, maxPageSize, incomingSkipToken) => {
  if (incomingSkipToken > 0) {
    const tooMuch = rows - maxPageSize

    if (tooMuch < 1) {
      return rows
    }

    if (tooMuch > maxPageSize) {
      return maxPageSize
    }

    return tooMuch
  }

  if (rows > maxPageSize) {
    return maxPageSize
  }

  return rows || 0
}

/**
 * Add pagination params to cqn
 * @param {Object} uriInfo - odata-v4 URI request
 * @param {Object} cqn - CQN Object
 */
const topSkipWithPaginationToCQN = (uriInfo, cqn) => {
  const { defaultPageSize, maxPageSize } = _getPageSizes(uriInfo)

  const incomingSkipToken = skipToken(uriInfo)
  const limit = cqn.SELECT.limit

  if (limit) {
    const rows = maxPageSize && _getMaxRows(limit.rows ? limit.rows.val : undefined, maxPageSize, incomingSkipToken)
    const offset = _getOffset(limit.offset ? limit.offset.val : undefined, incomingSkipToken)
    addLimit(cqn.SELECT, rows, offset)
  } else {
    addLimit(cqn.SELECT, defaultPageSize, incomingSkipToken)
  }
}

module.exports = topSkipWithPaginationToCQN
