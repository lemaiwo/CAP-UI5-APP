const ExpressionToCQN = require('./ExpressionToCQN')
const { getFeatureNotSupportedError } = require('../../../util/errors')
const odata = require('@sap/odata-server')
const {
  QueryOptions: { ORDERBY }
} = odata
const ExpressionKind = odata.uri.Expression.ExpressionKind
const DRAFT_COLUMNS = ['IsActiveEntity', 'HasDraftEntity', 'HasActiveEntity']

const _buildNavRef = pathSegment => {
  return pathSegment.getProperty() ? pathSegment.getProperty().getName() : pathSegment.getNavigationProperty().getName()
}

const _orderExpression = order => {
  if (order.getExpression().getKind() === ExpressionKind.MEMBER) {
    let ref = []
    for (let i = 0; i < order.getExpression().getPathSegments().length; i++) {
      ref.push(_buildNavRef(order.getExpression().getPathSegments()[i]))
    }

    return {
      ref,
      sort: order.isDescending() ? 'desc' : 'asc'
    }
  }

  if (order.getExpression().getKind() === ExpressionKind.METHOD) {
    let ref = new ExpressionToCQN().parse(order.getExpression())
    ref.sort = order.isDescending() ? 'desc' : 'asc'
    return ref
  }

  throw getFeatureNotSupportedError(`Query option "${ORDERBY}" with kind "${order.getExpression().getKind()}"`)
}

const _defaultOrders = entity => {
  const defaultOrders = entity['@cds.default.order'] || entity['@odata.default.order'] || []

  const additionalKeyOrders = Object.keys(entity.elements)
    .filter(
      keyName =>
        entity.elements[keyName].key &&
        !entity.elements[keyName].is2one &&
        !DRAFT_COLUMNS.includes(keyName) &&
        !defaultOrders.some(o => o.by['='] === keyName)
    )
    .map(keyName => ({ by: { '=': keyName } }))

  return [...defaultOrders, ...additionalKeyOrders]
}

const orderbyToCQN = (reflectedEntity, cqnPartial, orderBy) => {
  if (orderBy) {
    cqnPartial.orderBy = cqnPartial.orderBy || []
    for (const order of orderBy) {
      cqnPartial.orderBy.push(_orderExpression(order))
    }
  }

  const defaultOrders = _defaultOrders(reflectedEntity)

  cqnPartial.orderBy = cqnPartial.orderBy || []
  for (const defaultOrder of defaultOrders) {
    if (
      !cqnPartial.orderBy.some(orderBy => {
        return orderBy.ref && orderBy.ref.length === 1 && orderBy.ref[0] === defaultOrder.by['=']
      })
    ) {
      const orderByItem = { ref: [defaultOrder.by['=']], sort: defaultOrder.desc ? 'desc' : 'asc' }
      cqnPartial.orderBy.push(orderByItem)
    }
  }
}

module.exports = orderbyToCQN
