'use strict';

const AbstractError = require('@sap/odata-commons').errors.AbstractError;

class ConflictError extends AbstractError {

    constructor(message) {
        super(AbstractError.ErrorNames.CONFLICT, message || 'Conflict');
    }
}

module.exports = ConflictError;
