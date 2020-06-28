"use strict";
/* Copyright (c) 2020 SAP SE or an SAP affiliate company. All rights reserved. */
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("../util");
var cache_1 = require("./cache");
var DestinationCache = function (cache) { return ({
    retrieveDestinationFromCache: function (decodedJwt, name, isolation) {
        return cache.get(getDestinationCacheKey(decodedJwt, name, isolation));
    },
    cacheRetrievedDestinations: function (decodedJwt, retrievedDestinations, isolation) {
        __spreadArrays(retrievedDestinations.instance, retrievedDestinations.subaccount).forEach(function (destination) {
            if (!destination.name) {
                throw new Error('The destination name is undefined.');
            }
            var key = getDestinationCacheKey(decodedJwt, destination.name, isolation);
            cache.set(key, destination);
        });
    },
    clear: function () {
        cache.clear();
    },
    getCacheInstance: function () { return cache; }
}); };
/**
 * Calculates a cache key based on the jwt and destination name for the given isolation strategy.
 * Cache keys for strategies are non-overlapping, i.e. using a cache key for strategy [[IsolationStrategy.Tenant]]
 * will not result in a cache hit for a destination that has been cached with strategy [[IsolationStrategy.Tenant_User]].
 *
 * @param decodedJwt - The decoded JWT of the current request.
 * @param destinationName - The name of the destination.
 * @param isolationStrategy - The strategy used to isolate cache entries.
 * @returns The cache key.
 * @hidden
 */
function getDestinationCacheKey(decodedJwt, destinationName, isolationStrategy) {
    switch (isolationStrategy) {
        case cache_1.IsolationStrategy.No_Isolation:
            return "::" + destinationName;
        case cache_1.IsolationStrategy.Tenant_User:
            return util_1.tenantId(decodedJwt) + ":" + util_1.userId(decodedJwt) + ":" + destinationName;
        case cache_1.IsolationStrategy.User:
            return ":" + util_1.userId(decodedJwt) + ":" + destinationName;
        default:
            return util_1.tenantId(decodedJwt) + "::" + destinationName;
    }
}
exports.getDestinationCacheKey = getDestinationCacheKey;
exports.destinationCache = DestinationCache(new cache_1.Cache({ hours: 0, minutes: 5, seconds: 0 }));
//# sourceMappingURL=destination-cache.js.map