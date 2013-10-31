var Benchmark = require('benchmark')
  , P = require('../../src/promise')
  , when = require('when')

var suite = new Benchmark.Suite;

var value = {}

// add tests
suite.add('Promise.resolve()', function() {
  return P.resolve(value)
})
.add('when.resolve()', function() {
  return when.resolve(value)
})

// add listeners
.on('cycle', function(event) {
  console.log(String(event.target));
})
.on('complete', function() {
  console.log('Fastest is ' + this.filter('fastest').pluck('name'));
})

// run async
.run({ 'async': true });
