'use strict';

const AbstractError = require('@sap/odata-commons').errors.AbstractError;

/**
 * Client error: the request is not well-formed.
 * @extends AbstractError
 */
class BadRequestError extends AbstractError {
    /**
     * Creates an instance of BadRequestError.
     * If an error message is not provided, the default message would be 'Bad request'.
     * @param {string} message The error message
     * @param {Error} rootCause the root cause
     */
    constructor(message = 'Bad request', rootCause) {
        super(AbstractError.ErrorNames.BAD_REQUEST, message, rootCause);
    }
}

module.exports = BadRequestError;
