'use strict';

var xssec = require('./xssec');
var passportStrategy = require('./strategies/passport-jwt');

exports.createSecurityContextCC = xssec.createSecurityContextCC;
exports.createSecurityContext = xssec.createSecurityContext;
exports.constants = require('./constants');
exports.JWTStrategy = passportStrategy.JWTStrategy;
