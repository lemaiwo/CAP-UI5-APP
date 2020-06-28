'use strict';

const AbstractError = require('@sap/odata-commons').errors.AbstractError;

class PreconditionFailedError extends AbstractError {

    constructor(message) {
        super(AbstractError.ErrorNames.PRECONDITION_FAILED_ERROR, message || 'Precondition failed');
    }
}

module.exports = PreconditionFailedError;
