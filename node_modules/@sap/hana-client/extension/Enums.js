'use strict';

module.exports = {
    // Data type
    A_INVALID_TYPE: 0,  // Invalid data type.
    A_BINARY: 1,        // Binary data.
    A_STRING: 2,        // String data.
    A_DOUBLE: 3,        // Double data.
    A_VAL64: 4,         // 64-bit integer.
    A_UVAL64: 5,        // 64-bit unsigned integer.
    A_VAL32: 6,         // 32-bit integer.
    A_UVAL32: 7,        // 32-bit unsigned integer.
    A_VAL16: 8,         // 16-bit integer.
    A_UVAL16: 9,        // 16-bit unsigned integer.
    A_VAL8: 10,         // 8-bit integer.
    A_UVAL8: 11,        // 8-bit unsigned integer.
    A_FLOAT: 12,        // Float precision data.

    // Data direction
    DD_INVALID: 0,      // Invalid data direction.
    DD_INPUT: 1,        // Input-only host variables.
    DD_OUTPUT: 2,       // Output-only host variables.
    DD_INPUT_OUTPUT: 3, // Input and output host variables.

    // Row status
    RS_EXECUTE_SUCCEEDED: 1, // Execute of this row succeeded.
    RS_EXECUTE_FAILED: -2,   // Execute of this row failed.

    // Isolation level
    READ_UNCOMMITTED: 0,
    READ_COMMITTED: 1,
    REPEATABLE_READ: 2,
    SERIALIZABLE: 3
};