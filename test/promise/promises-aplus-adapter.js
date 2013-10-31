var P = require('../src/promise')
P.onerror = null

exports.resolved = P.resolve
exports.rejected = P.reject
exports.deferred = P.defer
