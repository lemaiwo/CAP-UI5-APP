'use strict';

const AbstractError = require('@sap/odata-commons').errors.AbstractError;

class PreconditionRequiredError extends AbstractError {

    constructor(message) {
        super(AbstractError.ErrorNames.PRECONDITION_REQUIRED_ERROR, message || 'Precondition required');
    }
}

module.exports = PreconditionRequiredError;
