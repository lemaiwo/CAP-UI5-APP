"use strict";
/* Copyright (c) 2020 SAP SE or an SAP affiliate company. All rights reserved. */
/* eslint-disable valid-jsdoc */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @hidden
 */
function removeSlashes(path) {
    path = removeLeadingSlashes(path);
    path = removeTrailingSlashes(path);
    return path;
}
exports.removeSlashes = removeSlashes;
/**
 * @hidden
 */
function removeTrailingSlashes(path) {
    return path.endsWith('/') ? path.slice(0, -1) : path;
}
exports.removeTrailingSlashes = removeTrailingSlashes;
/**
 * @hidden
 */
function removeLeadingSlashes(path) {
    return path.startsWith('/') ? path.slice(1) : path;
}
exports.removeLeadingSlashes = removeLeadingSlashes;
//# sourceMappingURL=remove-slashes.js.map