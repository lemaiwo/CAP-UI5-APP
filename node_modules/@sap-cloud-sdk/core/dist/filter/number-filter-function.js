"use strict";
/* Copyright (c) 2020 SAP SE or an SAP affiliate company. All rights reserved. */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var filter_1 = require("./filter");
var filter_function_1 = require("./filter-function");
/**
 * Representation of a filter function, that returns a value of type number. This supports int, double and decimal values.
 */
var NumberFilterFunction = /** @class */ (function (_super) {
    __extends(NumberFilterFunction, _super);
    /**
     * Creates an instance of NumberFilterFunction.
     * @param functionName - Name of the function that returns a numeric value
     * @param parameters - Representation of the parameters passed to the filter function
     * @param edmType - Type of the returned numeric value. This influences the formatting of the returned value.
     */
    function NumberFilterFunction(functionName, parameters, edmType) {
        var _this = _super.call(this, functionName, parameters) || this;
        _this.edmType = edmType;
        return _this;
    }
    /**
     * Creates an instance of Filter for this filter function and the given value using the operator 'gt', i.e. `>`.
     *
     * @param value - Value to be used in the filter
     * @param edmType - EdmType of the field to filter on
     * @returns The resulting filter
     */
    NumberFilterFunction.prototype.greaterThan = function (value) {
        return new filter_1.Filter(this, 'gt', value, this.edmType);
    };
    /**
     * Creates an instance of Filter for this filter function and the given value using the operator 'ge', i.e. `>=`.
     *
     * @param value - Value to be used in the filter
     * @param edmType - EdmType of the field to filter on
     * @returns The resulting filter
     */
    NumberFilterFunction.prototype.greaterOrEqual = function (value) {
        return new filter_1.Filter(this, 'ge', value, this.edmType);
    };
    /**
     * Creates an instance of Filter for this filter function and the given value using the operator 'lt', i.e. `<`.
     *
     * @param value - Value to be used in the filter
     * @param edmType - EdmType of the field to filter on
     * @returns The resulting filter
     */
    NumberFilterFunction.prototype.lessThan = function (value) {
        return new filter_1.Filter(this, 'lt', value, this.edmType);
    };
    /**
     * Creates an instance of Filter for this filter function and the given value using the operator 'le', i.e. `<=`.
     *
     * @param value - Value to be used in the filter
     * @param edmType - EdmType of the field to filter on
     * @returns The resulting filter
     */
    NumberFilterFunction.prototype.lessOrEqual = function (value) {
        return new filter_1.Filter(this, 'le', value, this.edmType);
    };
    return NumberFilterFunction;
}(filter_function_1.FilterFunction));
exports.NumberFilterFunction = NumberFilterFunction;
//# sourceMappingURL=number-filter-function.js.map