/**
 * Validates the where expression.
 * Supports only expressions in format: key = 1
 *
 * @param {*} whereExpr - where expression in compiled format
 * @throws Error
 */
const generateKeyPath = whereExpr => {
  // If we would have access to service.entities here, we could validate if refExpr is actually the key.
  if (whereExpr.children.length !== 3) {
    throw new Error("Feature not supported: complex where of fluent API (not in format 'a = 1')")
  }
  if (whereExpr.children[1].value !== '=') {
    throw new Error("Feature not supported: complex where of fluent API (operator not '=')")
  }

  const refExpr = whereExpr.children.find(child => child.constructor.name === 'RefExpression')
  const valueExpr = whereExpr.children.find(child => child.constructor.name === 'ValueExpression')
  if (refExpr && valueExpr) {
    return `(${valueExpr.value})`
  }

  throw new Error("Feature not supported: complex where of fluent API (not in format 'a = 1')")
}

module.exports = generateKeyPath
