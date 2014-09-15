require('node-oojs');

var gzip = oojs.using('oojs.utility.gzip');
var sourceFilePath = __dirname+'/gzip.test.source.js';
var toFilePath = __dirname+'/gzip.test.source.js.gz';
gzip.zipFileSync(sourceFilePath, toFilePath);
console.log('========== gzip finished! ==========');


var sourceString = 'eJzT0yMAAGTvBe8=';
var toFilePath = __dirname+'/gzip.test2.source.js.gz';
console.log('========== zipStringToFileSync start ==========');
gzip.zipStringToFileSync(toFilePath, sourceString);
console.log('========== zipStringToFileSync end ==========');