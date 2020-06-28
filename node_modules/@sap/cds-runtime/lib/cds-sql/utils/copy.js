const deepCopyArray = arr => {
  if (!arr) return arr
  const clone = []
  for (const item of arr) {
    clone.push(deepCopy(item))
  }
  return clone
}

const deepCopy = obj => {
  if (!obj) return obj
  const clone = {}
  for (const key of Object.keys(obj)) {
    const prop = obj[key]
    if (Array.isArray(prop)) {
      clone[key] = deepCopyArray(prop)
    } else {
      clone[key] = typeof prop === 'object' ? deepCopy(prop) : prop
    }
  }
  return clone
}

module.exports = {
  deepCopy,
  deepCopyArray
}
