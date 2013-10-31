var Benchmark = require('benchmark')
  , P = require('../../src/promise')
  , when = require('when')

var suite = new Benchmark.Suite;

// add tests
suite.add('Promise.defer()', function() {
  return P.defer()
})
.add('when.defer()', function() {
  return when.defer()
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
