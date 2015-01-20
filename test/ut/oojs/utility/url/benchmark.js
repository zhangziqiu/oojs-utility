require('node-oojs');

var coreUrl = require('url')
var urlparser = require('./urlparser.js');
var url = oojs.using('oojs.utility.url');


var n = 25 * 200;
var testCase = require('./testCase');

console.log("parseQueryString:false");
benchmark('node-core-url parse()', coreUrl.parse, false);
benchmark('urlparser parse()', urlparser.parse, false);
benchmark('oojs-utility-url parse()', url.parse, false);
console.log("parseQueryString:true");
benchmark('node-core-url parse()', coreUrl.parse, true);
benchmark('urlparser parse()', urlparser.parse, true);
benchmark('oojs-utility-url parse()', url.parse, true);

function benchmark(name, fun, parseQueryString) {

  var timestamp = process.hrtime();
  for (var i = 0; i < n; ++i) {
    for (var j = 0, k = testCase.length; j < k; ++j) fun(testCase[j].url, parseQueryString);
  }
  timestamp = process.hrtime(timestamp);

  var seconds = timestamp[0];
  var nanos = timestamp[1];
  var time = seconds + nanos / 1e9;
  var rate = n / time;

  console.log('misc/url.js %s: %s  qps/second', name, parseInt(rate.toPrecision(7)));
}
