const _isAssocOrComposition = (entity, col) => {
  return entity.elements[col].type === 'cds.Association' || entity.elements[col].type === 'cds.Composition'
}

/**
 * Add odata select to a CQN object.
 *
 * @param {string} select - odata select string
 * @param {array} keys - array of primary keys
 * @param {object} entity - csn entity targeted by the request
 * @private
 */
const selectToCQN = (select, keys, entity) => {
  const elements = new Set()
  const columns = select.split(',')
  if (columns.indexOf('*') !== -1) {
    return []
  }

  for (const col of columns) {
    if (!_isAssocOrComposition(entity, col)) {
      elements.add(col)
    }
  }

  for (const key of keys) {
    // add key, as odata-v4 always expects the key here.
    if (key && !elements.has(key)) {
      elements.add(key)
    }
  }

  for (const col of Object.keys(entity.elements)) {
    if (entity.elements[col]['@odata.etag'] && !elements.has(col)) {
      elements.add(col)
    }
  }

  return Array.from(elements)
}

module.exports = selectToCQN
