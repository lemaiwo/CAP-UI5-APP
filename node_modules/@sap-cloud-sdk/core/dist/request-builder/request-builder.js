"use strict";
/* Copyright (c) 2020 SAP SE or an SAP affiliate company. All rights reserved. */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @hidden
 */
var RequestBuilder = /** @class */ (function () {
    function RequestBuilder() {
    }
    RequestBuilder.forEntity = function (entity) {
        return entity.requestBuilder();
    };
    return RequestBuilder;
}());
exports.RequestBuilder = RequestBuilder;
//# sourceMappingURL=request-builder.js.map