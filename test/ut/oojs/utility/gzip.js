require('node-oojs');

var gzip = oojs.using('oojs.utility.gzip');
var sourceFilePath = __dirname+'/gzip.test.source.js';
var toFilePath = __dirname+'/gzip.test.source.js.gz';
gzip.zipSync(sourceFilePath, toFilePath);
console.log('========== gzip finished! ==========');
