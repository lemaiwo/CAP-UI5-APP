"use strict";
/* Copyright (c) 2020 SAP SE or an SAP affiliate company. All rights reserved. */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @deprecated Since v1.0.1.
 *
 * Represents the origin of a destination in a multi-tenant setup on SAP Cloud Platform.
 *
 * In a multi-tenant application on SAP Cloud Platform, destinations can be defined both on provider account level ("PaaS tenant") as well as on the level of each subscriber account ("SaaS tenant").
 */
var DestinationOrigin;
(function (DestinationOrigin) {
    DestinationOrigin["Subscriber"] = "subscriber";
    DestinationOrigin["Provider"] = "provider";
})(DestinationOrigin = exports.DestinationOrigin || (exports.DestinationOrigin = {}));
function isDestinationNameAndJwt(destination) {
    return destination.destinationName !== undefined;
}
exports.isDestinationNameAndJwt = isDestinationNameAndJwt;
function isDestination(destination) {
    return destination.url !== undefined;
}
exports.isDestination = isDestination;
//# sourceMappingURL=destination-service-types.js.map