const cds = require('../cds')
const {xpr:_pred} = cds.parse.expr (`$now in (validFrom,validTo)`)

///////////////////////////////////////////////////////////
//   cds-compiler part
//

// Rewrites DDL output of 2sql
const unfold = function _unfold_temporal_entities_in (csn) { // NOSONAR
    const m = cds.linked (csn)
    const services = RegExp (Object.keys (m.services).map(n => '^'+n+'\\.').join('|'))
    for (let each of m.each('entity')) {
        if (each.own('abstract'))  continue
        if (!each.query) continue
        const {SELECT:q} = each.query
        const inService = services.test (each.name)
        if (inService && _is_temporal (each)) {
            if (q.where)  q.where .push ('and', ..._pred)
            else  q.where = _pred
        }
        if (q) {
            _unfold_temporal_predicates_in (q.where)
        }
    }
    delete csn._xsn
    // console.warn (csn._xsn)
    return csn
}


function _unfold_temporal_predicates_in (xpr) {
    if (xpr) for (let i=0; i<=xpr.length; ++i) {
        let x = xpr[i]
        if (x && x.ref && x.ref[0] == '$now') {
            if (xpr[i+1] == 'in' && xpr[i+2] == '(' && xpr[i+6] == ')') {
                const pred = _temporal_predicate (xpr[i+3], xpr[i+5])
                xpr.splice (i,6, ...pred)
                i += 7
            }
        }
        else if (x && x.ref && x.ref[0] && x.ref[0].where) {
            _unfold_temporal_predicates_in (x.ref[0].where)
        }
    }
}

function _temporal_predicate (from, to) {
    return [ from, '<=', {ref:'current_timestamp'}, 'and', {ref:'current_timestamp'}, '<', to ]
}


///////////////////////////////////////////////////////////
//   shared
//

function _is_temporal (d) {
    return d['@cds.temporal.valid.from'] && d['@cds.temporal.valid.to']
}


module.exports = cds.env.features.temporal
? { unfold }
: { unfold: x=>x }
