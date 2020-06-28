const proxy = require("@sap/cds-odata-v2-adapter-proxy")
// const express = require("express")
const cds = require("@sap/cds")

const port = process.env.PORT || 4004;

module.exports = async (options) => {
    const express = require('express')
    const app = cds.app = options.app || express()
    cds.emit('bootstrap',app) // hook for project-local server.js

    // mount static resources and common middlewares...
    app.use (express.static (cds.env.folders.app))  //> defaults to ./app
    app.get ('/',(_,res) => res.send (index.html))  //> if none in ./app
    app.use ('/favicon.ico', express.static (__dirname+'/etc/favicon.ico', {maxAge:'14d'}))
    // app.use (options.logger||logger)  //> basic request logging

    // load specified models or all in project
    const model = cds.model = await cds.load (options.from)

    // bootstrap --in-memory db if requested
    if (options.in_memory) cds.db = await cds.deploy (model,options)

    // connect to primary database if required
    else if (cds.requires.db) cds.db = await cds.connect.to('db')

    // construct and mount modelled services
    const services = await cds.serve (options) .from (model) .in (app)
    // const services = await cds.serve("all").in(app)
    cds.emit ('served', services)

    app.use(proxy({ path: "v2", port: port }))

    return app.listen(port, () => console.info(`server listening on http:\/\/localhost:${port}`))
};
// -------------------------------------------------------------------------
// helpers...
try {
    var {index:index1} = require ('./node_modules/@sap/cds/lib/utils/app/index_html')
} catch (error) {
    var {index:index2} = require ('../node_modules/@sap/cds/lib/utils/app/index_html')
}
const index = index1 || index2;
// const {index} = require ('../node_modules/@sap/cds/lib/utils/app/index_html')
const DEBUG = cds.debug('server')
const logger = (req,_,next) => { /* eslint-disable no-console */
    console.log (req.method, decodeURI(req.url))
    if (/\$batch/.test(req.url))  req.on ('dispatch', (req) => {
        console.log ('>', req.event, req._.path, req._.query)
        if (DEBUG && req.query) console.debug (req.query)
    })
    next()
}


// // -------------------------------------------------------------------------
if (!module.parent)  module.exports (process.argv[2])