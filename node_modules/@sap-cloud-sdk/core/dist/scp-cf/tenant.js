"use strict";
/* Copyright (c) 2020 SAP SE or an SAP affiliate company. All rights reserved. */
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("../util");
/**
 * Mapping between key name in the Tenant and key name in decoded JWT and the
 */
exports.mapping = {
    id: { keyInJwt: 'zid', extractorFunction: util_1.tenantId },
    name: { keyInJwt: 'zdn', extractorFunction: util_1.tenantName }
};
/**
 * Creates a tenant object from the decoded JWT.
 *
 * @param decodedJWT - Decoded JWT token
 * @returns Representation of the tenant.
 * @exception Error Raised if no id is found in the decoded JWT.
 */
function tenantFromJwt(decodedJWT) {
    util_1.checkMandatoryValue('id', exports.mapping, decodedJWT);
    return {
        id: util_1.tenantId(decodedJWT),
        name: util_1.tenantName(decodedJWT)
    };
}
exports.tenantFromJwt = tenantFromJwt;
//# sourceMappingURL=tenant.js.map