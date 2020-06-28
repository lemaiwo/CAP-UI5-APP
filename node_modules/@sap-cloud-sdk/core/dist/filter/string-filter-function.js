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
var filter_function_1 = require("./filter-function");
/**
 * Representation of a filter function, that returns a value of type string.
 */
var StringFilterFunction = /** @class */ (function (_super) {
    __extends(StringFilterFunction, _super);
    /**
     * Creates an instance of StringFilterFunction.
     * @param functionName - Name of the function that returns a string value
     * @param parameters - Representation of the parameters passed to the filter function
     */
    function StringFilterFunction(functionName, parameters) {
        var _this = _super.call(this, functionName, parameters) || this;
        _this.edmType = 'Edm.String';
        return _this;
    }
    return StringFilterFunction;
}(filter_function_1.FilterFunction));
exports.StringFilterFunction = StringFilterFunction;
//# sourceMappingURL=string-filter-function.js.map