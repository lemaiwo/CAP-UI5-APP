'use strict';

const AbstractError = require('@sap/odata-commons').errors.AbstractError;

/**
 * @extends AbstractError
 */
class UnauthorizedError extends AbstractError {
    /**
     * @param {string} [message] the error message
     */
    constructor(message) {
        super(AbstractError.ErrorNames.NOT_AUTHORIZED, message || 'Unauthorized');
    }
}

module.exports = UnauthorizedError;
