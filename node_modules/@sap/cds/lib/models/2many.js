const cds = require('../cds')
const { newCsn } = cds.env.cdsc || {}

module.exports = function _unfold_to_many (csn) {

  const m = cds.linked (csn),  xsn = csn._xsn
  m.forall (a => a.is2many && !a.on,
    xsn ? _unfold_materialized_csn_xsn : _unfold_plain_csn
  )

  // It could be so easy if we had just one(!) csn and even more important:
  // if we would adhere to the pretty old practive of late materialization ...
  function _unfold_plain_csn (a, entity) {
    const back = m.all (e => e._target === entity, /*in:*/ a._target.elements)
    if (back.length === 1) {
        a.on = [{ref: [a.name, back[0].name]}, '=', {ref: ['$self']}]
    }
  }

  // ... and that's what we've to do today, to get through all these statically
  // and redundantly materialized xsns.
  function _unfold_materialized_csn_xsn (a, entity) {

    if (a.origin) {
      const b = xsn.definitions [entity.name] .elements [a.name]
      const _e = csn.definitions [b.origin.absolute]
      const _a = _e.elements [b.origin.element]
      const _b = _unfold_materialized_csn_xsn (_a,[_e])
      if (_b) {
        delete a.keys; delete b.keys
        delete a.foreignKeys; delete b.foreignKeys
        delete b._foreignKeysIndexNo
        b.on = _b.on; b.onCond = Object.assign ({$inferred:'prop'}, _b.onCond)
        a.on = _a.on; a.onCond = _a.onCond
      }
      return b
    }

    const back = m.all (e => e._target === entity, /*in:*/ a._target.elements)
    if (back.length === 1) {

      const name = a.name, backlink = back[0].name
      if (newCsn) {
        a.on = [{ref: [name, backlink]}, '=', {ref: ['$self']}]
        delete a.keys
        delete a.foreignKeys
        delete a._foreignKeysIndexNo
      } else {
        a.onCond = {op: '=', args: [{'=': `${name}.${backlink}`}, {'=': '$self'}]}
        a.on = `${name}.${backlink} = $self`
        delete a.foreignKeys
        delete a._foreignKeysIndexNo
      }

      const _source = xsn.definitions [entity.name]
      const _target = xsn.definitions [a.target]
      const _a = _source.elements [a.name]
      const _b = _target.elements [backlink]
      _a.onCond = {op: {val:'='}, args: [
        $({
          path:[
            $({ id:name }, _a),
            $({ id:backlink },  _b),
          ],
          absolute: a.target,
          element: backlink
        }, _b),
        $({
          path:[
            $({ id:'$self' },  _source)
          ],
          absolute: entity.name
        }, _source)
      ]}
      _a.on = `${name}.${backlink} = $self`
      delete _a.keys; delete _a.foreignKeys; delete _a.implicitForeignKeys
      delete _a._foreignKeysIndexNo
      return _a
    }
  }

}

const $ = (o,a) => Object.defineProperty(o,'_artifact',{value:a})