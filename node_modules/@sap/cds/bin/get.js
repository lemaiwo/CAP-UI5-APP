module.exports = Object.assign(get, {
  help: `
# SYNOPSIS

    *cds get* <module>

# EXPLANATION

    Loads the given module and dumps it's source on stdout.

`})

const path = require('path')
const fs = require('fs')

function get ([name='@sap/cds']) {
  if (name.startsWith('./'))  name = path.resolve (process.cwd(), name)
  for (let suffix of ['', '.cds']) try {
    const file = require.resolve (name+suffix)
    console.warn ('source of:', file, '...')
    return fs.createReadStream (file) .pipe (process.stdout)
  } catch(e){/*ignore*/}
  console.error (`Didn't find a resource for ${name}`)
}

/* eslint no-console:0 */
