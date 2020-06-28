const expressionMap = new Map()
  .set('select', (key, value) => {
    return new SelectExpression(key, value)
  })
  .set('delete', (key, value) => {
    return new DeleteExpression(key, value)
  })
  .set('update', (key, value) => {
    return new UpdateExpression(key, value)
  })
  .set('insert', (key, value) => {
    return new InsertExpression(key, value)
  })
  .set('into', (key, value) => {
    return new IntoExpression(key, value)
  })
  .set('entity', (key, value) => {
    return new EntityExpression(key, value)
  })
  .set('from', (key, value) => {
    return new FromExpression(key, value)
  })
  .set('columns', (key, value) => {
    return new ColumnsExpression(key, value)
  })
  .set('entries', (key, value) => {
    return new EntriesExpression(key, value)
  })
  .set('orderby', (key, value) => {
    return new OrderbyExpression(key, value)
  })
  .set('sort', (key, value) => {
    return new SortExpression(key, value)
  })
  .set('limit', (key, value) => {
    return new LimitExpression(key, value)
  })
  .set('data', (key, value) => {
    return new DataExpression(key, value)
  })
  .set('with', (key, value) => {
    return new DataExpression(key, value)
  })
  .set('ref', (key, value) => {
    return new RefExpression(key, value)
  })
  .set('where', (key, value) => {
    return new WhereExpression(key, value)
  })
  .set('val', (key, value) => {
    return new ValueExpression(key, value)
  })
  .set('one', (key, value) => {
    return new OneExpression(key, value)
  })

const getOdataOperator = cqnOperator => {
  switch (cqnOperator.toLowerCase()) {
    case '=':
      return 'eq'
    case '<>':
      return 'ne'
    case '>=':
      return 'ge'
    case '<=':
      return 'le'
    case '<':
      return 'lt'
    case '>':
      return 'gt'
    default:
      return cqnOperator.toLowerCase()
  }
}

const splitByAndGetValueByIndex = (value, split = '.', offset = 0) => {
  const parts = value.split(split)
  return parts[parts.length - 1 - offset]
}

class Expression {
  constructor (key, value) {
    this.key = key
    this.value = value
    this.children = []
  }
}

class RootExpression extends Expression {
  interpret (options) {
    return this.children[0].interpret(options)
  }
}

class OneExpression extends Expression {
  interpret () {
    return 1
  }
}

class FromExpression extends Expression {
  interpret (options) {
    let result
    if (typeof this.value === 'string') {
      result = this.value
    } else {
      const target = this.children.map(child => child.interpret(options))
      result = target.join('')
    }

    return result
  }
}

class ColumnsExpression extends Expression {
  interpret (options) {
    return this.children.map(child => child.interpret(options)).join(',')
  }
}

class OrderbyExpression extends Expression {
  interpret (options) {
    const output = []
    let currentVals = {}
    for (const childIdx in this.children) {
      const child = this.children[childIdx]
      if (child instanceof RefExpression) {
        const val = child.interpret(options)
        currentVals.ref = val
      }
      if (child instanceof SortExpression) {
        const val = child.interpret(options)
        currentVals.sort = val
      }
      if (childIdx % 2 === 1) {
        output.push(`${currentVals.ref} ${currentVals.sort}`)
        currentVals = {}
      }
    }
    return output.join(',')
  }
}

class RefExpression extends Expression {
  interpret () {
    return this.value[this.value.length - 1]
  }
}

class SortExpression extends Expression {
  interpret () {
    return this.value || 'asc'
  }
}

// Not interpreted because currently only used in WhereExpression
class ValueExpression extends Expression {}

class DataExpression extends Expression {
  interpret () {
    const value = this.value
    // only works on flat structures
    const result = {}
    for (const property in value) {
      result[property] =
        value[property] && typeof value[property] === 'object' && 'val' in value[property]
          ? value[property].val
          : value[property]
    }

    return result
  }
}

class EntriesExpression extends Expression {
  interpret () {
    return Array.isArray(this.value) && this.value.length === 1 ? this.value[0] : this.value
  }
}

class LimitExpression extends Expression {
  interpret () {
    return this.value
  }
}

// Not interpreted because currently only used in WhereExpression
class TerminalExpression extends Expression {}

class StringOrRefExpression extends Expression {
  interpret (options) {
    let result
    if (typeof this.value === 'string') {
      result = this.value
    } else {
      this.children.forEach(child => {
        if (child.constructor.name === 'RefExpression') {
          result = child.interpret(options)
        }
      })
    }

    return splitByAndGetValueByIndex(result)
  }
}

class EntityExpression extends StringOrRefExpression {}

class IntoExpression extends StringOrRefExpression {}

const _format = (value, type) => {
  switch (type) {
    case 'cds.String':
      return `'${value}'`
    case 'cds.DateTime':
    case 'cds.Date':
    case 'cds.Timestamp':
      return process.env.T19 ? `'${value}'` : value // TODO: improve
    default:
      return value
  }
}

const _between = (output, options, entity, x, /* between */ a, /* and */ b) => {
  const y = x.interpret(options)
  const { type } = options.model.definitions[entity].elements[y]
  a = _format(a.value, type)
  b = _format(b.value, type)
  output.push('(', y, 'gt', a, 'and', y, 'lt', b, ')')
}

const _in = (output, options, entity, x, /* in */ values) => {
  if (!values.value.length) return
  output[output.length] = '('
  const y = x.interpret(options)
  const { type } = options.model.definitions[entity].elements[y]
  for (const each of values.value) output.push(y, 'eq', _format(each, type), 'or')
  output[output.length - 1] = ')'
}

class WhereExpression extends Expression {
  interpret (options, entity, key = true) {
    if (key) {
      return options.generateKeyPath(this)
    }

    const output = []
    const children = this.children
    for (let i = 0; i < children.length; i++) {
      const child = children[i]
      const next = children[i + 1]
      const op = next && typeof next.value === 'string' && next.value.toLowerCase()
      if (op === 'between') {
        _between(output, options, entity, child, children[i + 2], children[(i += 4)])
      } else if (op === 'in') {
        _in(output, options, entity, child, children[(i += 2)])
      } else if (child.constructor.name === 'TerminalExpression') {
        output.push(getOdataOperator(child.value))
      } else if (child.constructor.name === 'ValueExpression') {
        output.push(`${typeof child.value === 'string' ? `'${child.value}'` : child.value}`)
      } else {
        output.push(child.interpret(options))
      }
    }

    return output.join(' ')
  }
}

class SelectExpression extends Expression {
  interpret (options) {
    let entity, key
    const pathSegments = []
    const queryOptions = []

    this.children.forEach(child => {
      switch (child.constructor.name) {
        case 'FromExpression':
          entity = child.interpret(options)
          break
        case 'ColumnsExpression':
          queryOptions.push(`$select=${child.interpret(options)}`)
          break
        case 'LimitExpression':
          const value = child.interpret() // eslint-disable-line no-case-declarations
          queryOptions.push(`$top=${value.rows.val}`)

          if (value.offset) {
            queryOptions.push(`$skip=${value.offset.val}`)
          }
          break
        case 'OrderbyExpression':
          const val = child.interpret()
          queryOptions.push(`$orderby=${val}`)
          break
        case 'OneExpression':
          queryOptions.push(`$top=${child.interpret()}`)
          break
        case 'WhereExpression':
          if (options.kind === 'rest') {
            key = child.interpret(options, entity)
          } else {
            queryOptions.push(`$filter=${child.interpret(options, entity, false)}`)
          }
      }
    })

    pathSegments.push(`/${splitByAndGetValueByIndex(entity)}`)

    if (key) {
      pathSegments.push(key)
    }

    if (queryOptions.length > 0) {
      pathSegments.push(`?${queryOptions.join('&')}`)
    }
    return { path: pathSegments.join(''), method: 'GET' }
  }
}

class InsertExpression extends Expression {
  interpret (options) {
    let entity, body
    this.children.forEach(child => {
      if (child.constructor.name === 'IntoExpression') {
        entity = child.interpret(options)
      }

      if (child.constructor.name === 'EntriesExpression') {
        body = child.interpret(options)
      }
    })

    return { path: `/${entity}`, body, method: 'POST' }
  }
}

class UpdateExpression extends Expression {
  interpret (options) {
    let entity
    let key
    let body = {}
    this.children.forEach(child => {
      if (child.constructor.name === 'EntityExpression') {
        entity = child.interpret(options)
      }
      if (child.constructor.name === 'WhereExpression') {
        key = child.interpret(options, entity)
      }
      if (child.constructor.name === 'DataExpression') {
        Object.assign(body, child.interpret(options))
      }
    })

    return { path: `/${entity}${key}`, body, method: 'PATCH' }
  }
}

class DeleteExpression extends Expression {
  interpret (options) {
    let entity, key

    this.children.forEach(child => {
      if (child.constructor.name === 'FromExpression') {
        entity = child.interpret(options)
      }
      if (child.constructor.name === 'WhereExpression') {
        key = child.interpret(options, entity)
      }
    })

    return { path: `/${splitByAndGetValueByIndex(entity)}${key}`, method: 'DELETE' }
  }
}

module.exports = { expressionMap, RootExpression, TerminalExpression }
