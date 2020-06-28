"use strict";
/* Copyright (c) 2020 SAP SE or an SAP affiliate company. All rights reserved. */
Object.defineProperty(exports, "__esModule", { value: true });
var cache_1 = require("./cache");
var xsuaa_service_1 = require("./xsuaa-service");
var ClientCredentialsTokenCache = function (cache) { return ({
    // TODO: this method name can be shortened
    getGrantTokenFromCache: function (url, credentials) {
        return cache.get(getGrantTokenCacheKey(url, credentials));
    },
    // TODO: this method name can be shortened
    cacheRetrievedToken: function (url, credentials, token) {
        cache.set(getGrantTokenCacheKey(url, credentials), token, token.expires_in);
    },
    clear: function () {
        cache.clear();
    },
    getCacheInstance: function () { return cache; }
}); };
function getGrantTokenCacheKey(url, credentials) {
    return [url, xsuaa_service_1.headerForClientCredentials(credentials).substring(6)].join(':');
}
exports.getGrantTokenCacheKey = getGrantTokenCacheKey;
exports.clientCredentialsTokenCache = ClientCredentialsTokenCache(new cache_1.Cache());
//# sourceMappingURL=client-credentials-token-cache.js.map