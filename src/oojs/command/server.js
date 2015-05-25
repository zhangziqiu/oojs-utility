oojs.define({
    name: 'server',
    namespace: 'oojs.command',

    deps: {
        httpServer: 'oojs.utility.httpServer',
    },

    server: function (args) {
        this.server = this.httpServer.createServer();
    },

    run: function () {
        this.server.listen(8888);
		console.log('http server start at port: 8888');
    }
});