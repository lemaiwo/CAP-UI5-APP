"use strict";
/* Copyright (c) 2020 SAP SE or an SAP affiliate company. All rights reserved. */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
function createComplexType(json, converters) {
    return Object.entries(json).reduce(function (complexTypeInstance, _a) {
        var jsonKey = _a[0], jsonValue = _a[1];
        return (__assign(__assign({}, complexTypeInstance), converters[jsonKey](jsonValue)));
    }, {});
}
exports.createComplexType = createComplexType;
//# sourceMappingURL=create-complex-type.js.map