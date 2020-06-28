const util = require('util')
const os = require('os')

/**
 * Adds a custom inspect function for console.log, repl, eval and the like
 */
module.exports.install = (obj, multiResult=true) => {

  if (!obj || typeof obj.next !== 'function')  return obj  // only format our generators

  let result = '' // need to be idempotent, and our generators cannot be called twice, so cache result
  function inspect(depth, options = {}) {
    if (result.length > 0) return result
    const {write} = require('../../lib/utils/fs')
    write(this).to ({
      log:(...args) => {
        if (!multiResult && /----/.test(args[0]))  return
        const strings = args.map(arg => typeof arg !== 'string' ? util.inspect(arg, options) : arg)
        result += strings.join(' ') + os.EOL
      }
    })
    return result.trim()
  }
  obj[util.inspect.custom] = obj.toString = inspect
  return obj
}
