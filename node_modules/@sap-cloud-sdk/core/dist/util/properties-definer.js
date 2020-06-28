"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* Copyright (c) 2020 SAP SE or an SAP affiliate company. All rights reserved. */
exports.nonEnumerable = function (target, propertyKey) {
    var descriptor = Object.getOwnPropertyDescriptor(target, propertyKey) || {};
    if (descriptor.enumerable !== false) {
        descriptor.enumerable = false;
        descriptor.writable = true;
        Object.defineProperty(target, propertyKey, descriptor);
    }
};
//# sourceMappingURL=properties-definer.js.map