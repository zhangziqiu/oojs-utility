require('node-oojs');
var  assert = require('assert');
var  url = oojs.using('oojs.utility.url');

var  testCase = require('./testCase');
console.log('testing......');
for (var  i = 0, count = testCase.length; i < count; i++) {
    var  item = testCase[i];
    var  result = url.parse(item.url);
    if (item.protocol) {
        assert.equal(result.protocol, item.protocol);
    }
    if (item.host) {
        assert.equal(result.host, item.host);
    }
    if (item.port) {
        assert.equal(result.port, item.port);
    }
    if (item.path && item.path.length > 0) {
        assert.deepEqual(result.path, item.path);
    }
    if (item.query) {
        assert.deepEqual(result.query, item.query);
    }
    if (item.anchor) {
        assert.equal(result.anchor, item.anchor);
    }
}
console.log('test successful');