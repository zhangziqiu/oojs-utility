oojs.define({
    name: 'rs',
    namespace: 'oojs.command',
    deps: {
        httpServer: 'oojs.utility.httpServer',
    },
    $server: function (context) {
        console.log('========== create server start ==========');
        var  a = require(process.cwd() + "/master.js");
        console.log('========== create server end ==========');
        setTimeout(this.sendRequest, 1000);


        this.server = this.httpServer.createServer();
        this.server.listen(8080);
    },

    sendRequest: function () {
        oojs.setPath({
            'test': process.cwd()
        });
        var  builder = oojs.using('test.request.builder');
        try {
            var  requestInfoArray = builder.getAllRequest();
        }
        catch (ex) {
            console.log(ex);
        }
        var  requestInfoArray = builder.getAllRequest();
        console.log(requestInfoArray);
        //serverAddress表示服务器地址, 默认为'127.0.0.1'
        //serverPort表示服务器端口, 默认为8124
        //cacheRequestInfo表示缓存客户端requestInfo
        var  clientOptions = {
            serverAddress: '127.0.0.1',
            snappy: true,
            showResult: false,
            saveHtml: false,
            cacheRequestInfo: true
        };

        //遍历每个模版的requestInfo
        for (var  i = 0, count = requestInfoArray.length; i < count; i++) {
            //j表示每个requestInfo启动多少个客户端
            for (var  j = 0; j < 1; j++) {
                var  requestInfo = requestInfoArray[i];
                var  client = oojs.create('test.request.client', clientOptions);
                client.requestInfo = requestInfo;
                client.connect(function () {
                    setInterval(function () {
                        this.write(this.requestInfo);
                    }.proxy(this), 2000); //20表示每20ms发送一次请求
                }.proxy(client));
            }
        }
        return;
    }
});