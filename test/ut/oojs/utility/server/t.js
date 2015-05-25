require('node-oojs');
var  server = oojs.using('oojs.utility.server');
var  http = require('http');
http.createServer( server.onRequest.proxy(server) ).listen(8080);