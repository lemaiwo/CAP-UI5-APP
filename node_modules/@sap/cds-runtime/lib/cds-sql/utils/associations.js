const isAssociation = element => {
  return element.type === 'cds.Association'
}

const isComplex = element => {
  return !element.type && element.elements
}

const resolveAssociation = element => {
  if (element.keys) {
    return element.keys.map(key => {
      // TODO do this in all places where we calculate the field name
      /*
      if (key['$generatedFieldName']) {
        return key['$generatedFieldName']
      }
      */
      return `${element.name}_${key.ref[0]}`
    })
  }

  return []
}

module.exports = {
  isAssociation,
  isComplex,
  resolveAssociation
}
