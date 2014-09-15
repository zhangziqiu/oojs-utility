require('node-oojs');

var jsHelper = oojs.using('oojs.utility.jsHelper');
var fs = require('fs');
var jsSource = fs.readFileSync(__dirname+'/jsHelper.test.source.js', 'utf-8');
var resultWithComment = jsHelper.formatSync(jsSource);
var resultWithoutComment = jsHelper.formatSync(jsSource, {comments:false});
var resultCompress = jsHelper.compressSync(jsSource);

console.log('========== source: ==========');
console.log(jsSource);
console.log('========== result: with comment ==========');
console.log(resultWithComment);
console.log('========== result: without comment ==========');
console.log(resultWithoutComment);
console.log('========== result: compress ==========');
console.log(resultCompress);