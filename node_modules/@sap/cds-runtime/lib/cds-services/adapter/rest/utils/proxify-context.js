const { checkComplexType } = require('../../../util/assert')

const _isPrimitiveProperty = ([key, value], elements) => {
  return elements[key] && !['cds.Composition', 'cds.Association'].includes(elements[key].type)
}

const _addPrimitiveProperty = (filteredEntry, [key, value]) => {
  filteredEntry[key] = value
}

const _addComplexProperty = (filteredEntry, [key, value], elements) => {
  // Limited to depth 1, same as for checkComplexType
  const nestedObj = {}
  for (const [childKey, childValue] of Object.entries(value)) {
    if (elements[`${key}_${childKey}`]) {
      nestedObj[childKey] = childValue
    }
  }
  filteredEntry[key] = nestedObj
}

const _isCompositionProperty = ([key, value], elements) => {
  return elements[key] && elements[key].type === 'cds.Composition' && value
}

const _addCompositionProperty = (filteredEntry, [key, value], elements) => {
  const target = elements[key]._target

  if (Array.isArray(value)) {
    filteredEntry[key] = []
    for (const child of value) {
      const filteredChild = {}
      _filterDeep(filteredChild, [child], target)
      filteredEntry[key].push(filteredChild)
    }
  } else {
    filteredEntry[key] = {}
    _filterDeep(filteredEntry[key], [value], target)
  }
}

const _filterDeep = (filteredData, data, entity) => {
  if (!Array.isArray(data)) {
    _filterDeep(filteredData, [data], entity)
    return
  }

  data.forEach(dataEntry => {
    let filteredEntry
    if (Array.isArray(filteredData)) {
      filteredEntry = {}
      filteredData.push(filteredEntry)
    } else {
      filteredEntry = filteredData
    }

    for (const prop of Object.entries(dataEntry)) {
      const elements = entity.elements

      if (_isPrimitiveProperty(prop, elements)) {
        _addPrimitiveProperty(filteredEntry, prop)
      } else if (checkComplexType(prop, elements, false)) {
        _addComplexProperty(filteredEntry, prop, elements)
      } else if (_isCompositionProperty(prop, elements)) {
        _addCompositionProperty(filteredEntry, prop, elements)
      }
    }
  })
}

const proxifyContext = context => {
  const filterData = () => {
    const filteredData = Array.isArray(context.data) ? [] : {}
    _filterDeep(filteredData, context.data, context.target)

    return filteredData
  }

  const dataProxyHandler = {
    get: (obj, prop) => (prop === 'data' ? filterData() : obj[prop])
  }
  return new Proxy(context, dataProxyHandler)
}

module.exports = proxifyContext
