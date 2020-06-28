'use strict';

var fs = require('fs');
var path = require('path');
var os = require('os');

const debug = require('debug')('@sap/hana-client:index');
const name = 'index.js';

debug('Starting %s', name);

var extensions = {
    'darwin': 'dylib',
    'linux': 'so',
    'win32': 'dll'
};

var db = null;

// Look for prebuilt binary and DBCAPI based on platform
var pb_subdir = null;
if (process.platform === 'linux') {
    if (process.arch === 'x64') {
        pb_subdir = 'linuxx86_64-gcc48';
    } else if (process.arch.toLowerCase().indexOf('ppc') != -1 && os.endianness() === 'LE') {
        pb_subdir = 'linuxppc64le-gcc48';
    } else {
        pb_subdir = 'linuxppc64-gcc48';
    }
} else if (process.platform === 'win32') {
    pb_subdir = 'ntamd64-msvc2010';
} else if (process.platform === 'darwin') {
    pb_subdir = 'darwinintel64-xcode7';
}

var modpath = path.dirname(__dirname);
var pb_path = path.join(modpath, 'prebuilt', pb_subdir);
var dbcapi = process.env['DBCAPI_API_DLL'] || path.join(pb_path, 'libdbcapiHDB.' + extensions[process.platform]);
try {
    fs.statSync(dbcapi);
} catch (ex) {
    // No binary!
    debug(ex.message);
    debug("No DBCAPI interface driver found for platform: '" +
        process.platform + "', arch: '" + process.arch +
        "', endianness: '" + os.endianness() + "' for Node version: '" +
        process.version + "'");
    debug("You need to set the DBCAPI_API_DLL environment variable to point to " +
        'libdbcapiHDB.' + extensions[process.platform] + " for this platform.");
    throw new Error('`' + dbcapi + '` is missing.');
}

// Found dbcapi
process.env['DBCAPI_API_DLL'] = dbcapi;

// Now find driver
var default_driver_file = 'hana-client';
var driver_file = default_driver_file;

// Check if there is a node-version-specific driver
// Fall back on hana-client.node
var v = process.version;
var match = v.match(/v([0-9]+)\.([0-9]+)\.[0-9]+/);
driver_file += '_v' + match[1];
if (match[1] + 0 == 0) {
    driver_file += '_' + match[2];
}
var driver_path = path.join(pb_path, driver_file + '.node');
try {
    debug("Checking for existence of "+driver_path);
    fs.statSync(driver_path);
} catch (ex) {
    debug("Did not find "+driver_path);
    driver_path = path.join(pb_path, default_driver_file + '.node');
    try {
        debug("Checking for existence of "+driver_path);
        fs.statSync(driver_path);
    } catch (ex) {
        debug("No prebuilt node driver found for platform: '" +
            process.platform + "', arch: '" + process.arch +
            "', endianness: '" + os.endianness() + "' for Node version: '" +
            process.version + "'");
    }
}

// Try loading
// 1. User's build
// 2. Prebuilt

debug('Attempting to load Hana node-hdbcapi driver');

var userbld_driver_path = path.join(modpath, 'build', 'Release', 'hana-client.node');
debug('... Trying user-built copy...');
try {
    debug('... Looking for user-built copy in ' + userbld_driver_path + ' ... ');
    fs.statSync(userbld_driver_path);
    debug('Found.');
    try {
        debug('... Attempting to load user-built copy... ');
        db = require(userbld_driver_path);
        debug('Loaded.');
    } catch (ex) {
        debug(ex.message);
        debug('Could not load: User-built copy did not satisfy requirements.');
        throw ex;
    }
} catch (ex) {
    debug('Not found.');
}

if (db === null) {
    debug('... Trying prebuilt copy...');
    try {
        debug('... Looking for prebuilt copy in ' + driver_path + ' ... ');
        db = require(driver_path);
        debug('Loaded.');
    } catch (ex) {
        debug(ex.message);
        debug('Could not load: Prebuilt copy did not satisfy requirements.');
        debug("Could not load modules for Platform: '" +
            process.platform + "', Process Arch: '" + process.arch +
            "', and Version: '" + process.version + "'");
        throw ex;
    }
}

if (db !== null) {
    debug('Success.');
}
module.exports = db;
