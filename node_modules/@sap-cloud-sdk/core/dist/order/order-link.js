"use strict";
/* Copyright (c) 2020 SAP SE or an SAP affiliate company. All rights reserved. */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Link to represent an order by on a linked entity.
 *
 * @typeparam EntityT - Type of the entity to link from
 * @typeparam LinkedEntityT - Type of the entity to link to
 */
var OrderLink = /** @class */ (function () {
    /**
     * Creates an instance of OrderLink.
     *
     * @param link - Link to the entity to order by
     * @param orderBy - A list of orderables based on the linked entity
     */
    function OrderLink(link, orderBy) {
        this.link = link;
        this.orderBy = orderBy;
    }
    return OrderLink;
}());
exports.OrderLink = OrderLink;
//# sourceMappingURL=order-link.js.map