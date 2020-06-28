"use strict";
/* Copyright (c) 2020 SAP SE or an SAP affiliate company. All rights reserved. */
Object.defineProperty(exports, "__esModule", { value: true });
var filter_list_1 = require("./filter-list");
/**
 * Create a [[FilterList]] by combining [[Filterable]]s with logical `and`.
 *
 * Example:
 * ```ts
 * Entity.requestBuilder()
 *  .getAll()
 *  .filter(and(filterExp1, filterExp2));
 * ```
 *
 * Note that the [[GetAllRequestBuilder.filter]] method takes a rest parameter and thereby an array of filter expressions that are then combined conjunctively. As a consequence following is equivalent to the example above:
 * ```ts
 * Entity.requestBuilder()
 *  .getAll()
 *  .filter(filterExp1, filterExp2);
 * ```
 *
 * @typeparam EntityT - Type of the entity to be filtered on
 * @param expressions - Filterables to be combined with logical `and`
 * @returns The newly created FilterList
 */
function and() {
    var expressions = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        expressions[_i] = arguments[_i];
    }
    return new filter_list_1.FilterList(expressions);
}
exports.and = and;
/**
 * Create a [[FilterList]] by combining [[Filterable]]s with logical `or`.
 *
 * Example:
 * ```ts
 * Entity.requestBuilder()
 *  .getAll()
 *  .filter(or(filterExp1, filterExp2));
 * ```
 *
 * @typeparam EntityT - Type of the entity to be filtered on
 * @param expressions - Filterables to be combined with logical `or`
 * @returns The newly created FilterList
 */
function or() {
    var expressions = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        expressions[_i] = arguments[_i];
    }
    return new filter_list_1.FilterList([], expressions);
}
exports.or = or;
// TODO:
// Export function not<EntityT extends Entity>(expression: Filterable<EntityT>): Filterable<EntityT> {
//   Return new FilterList([], expressions);
// }
//# sourceMappingURL=filterable.js.map