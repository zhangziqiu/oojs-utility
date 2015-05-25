oojs.define({
    name: 'httpServer',
    namespace: 'oojs.utility',
    deps: {
        net: require('net'),
        http: require('http'),
        urlparser: 'oojs.utility.url',
        fileSync: 'oojs.utility.fileSync',
        util: 'oojs.utility.util',
        staticController: 'oojs.controller.static'
    },

    //默认参数
    option: {
        namespace: ''
    },

    //controller路径
    path: {},

    createServer: function (option) {
        //处理参数和默认值
        this.util.merge(option, this.option);
        this.option.controllerNamespace = this.option.namespace ? this.option.namespace + '.controller' : 'controller';
        this.option.viewNamespace = this.option.namespace ? this.option.namespace + '.view' : 'view';

        //获取controller所在目录  
        var  controllerPath = oojs.getClassPath(this.option.controllerNamespace).replace('.js', '');
        var  controllerFileList = this.fileSync.getFileListSync(controllerPath);

        for (var  i = 0, count = controllerFileList.length; i < count; i++) {
            var  controller = require(controllerFileList[i]);
            this.registerController(controller);
        }

        //设置根controller
        var  staticController = oojs.using('oojs.controller.static');
        this.registerController(staticController, '/');

        //创建node自带的http对象
        var  server = this.http.createServer(this.onRequest.proxy(this));
        return server;
    },

    registerController: function (controller, namespace) {
        var  node = this.path;

        if (!namespace) {
            namespace = controller.namespace + '.' + controller.name;
            namespace = namespace.toLowerCase();
            namespace = namespace.replace(this.option.controllerNamespace + '.', '');
            var  namespaceArray = namespace.split('.');
            for (var  i = 0, count = namespaceArray.length; i < count; i++) {
                var  currentName = namespaceArray[i].toLowerCase();
                node[currentName] = node[currentName] || {};
                node = node[currentName];
            }
        }
        else if (namespace === '/') {
            //如果传递'/', 表示设置根controller
            namespace = '';
        }

        node.controller = controller;
    },

    OnRequestEnd: function (context) {
        var  controller = context.controller;
        var  urlPath = context.url.path;
        if (controller.type === 'rewrite' && controller.query) {
            for (var  key in controller.query) {
                if (key && controller.query.hasOwnProperty(key)) {
                    var  queryItem = controller.query[key];
                    if (queryItem.index > -1) {
                        var  tempIndex = queryItem.index + context.controllerPathIndex;
                        var  tempValue = urlPath[tempIndex];
                        //从url路径中获取参数
                        if (tempIndex === urlPath.length - 1) {
                            //去掉"page.html"中的".html"
                            var  tempValueIndex = tempValue.indexOf('.');
                            if (tempValueIndex > 0) {
                                tempValue = tempValue.slice(0, tempValueIndex);
                            }
                        }
                        context.query[key] = tempValue;
                    }
                }
            }
        }
        controller.render.proxy(controller, context)();
    },

    onRequest: function (request, response) {
        var  method = request.method.toLowerCase();
        var  querystring = require('querystring');

        //每个请求有一个context对象, 保存和当前请求所有相关的上下文信息.
        var  context = {};
        context.request = request;
        context.response = response;
        context.data = [];

        //解析url, 获取controller和url参数
        var  url = request.url;
        var  urlObj = this.urlparser.parse(url, true, true);
        if (!urlObj.path || urlObj.path.length < 1) {
            urlObj.path = ['index'];
        }
        context.url = urlObj;

        //根据url路径获取controller        
        var  node = this.path;
        var  nodeIndex = 0;
        for (var  i = 0, count = urlObj.path.length; i < count; i++) {
            var  pathName = urlObj.path[i].toLowerCase();
            if (node[pathName]) {
                node = node[pathName];
            }
            else {
                nodeIndex = i;
                break;
            }
        }
        context.controller = node.controller;
        context.controllerPathIndex = nodeIndex;

        //根据method不同, 获取query参数, 执行后续流程 OnRequestEnd
        if (method === 'post') {
            request.on('data', function (chunk) {
                context.data.push(chunk);
            }.proxy(this, context));

            request.on('end', function (context) {
                context.data = context.data.join('');
                context.query = querystring.parse(context.data);
                this.OnRequestEnd(context);
            }.proxy(this, context));
        }
        else if (method === 'get') {
            context.query = urlObj.query || {};
        }
        this.OnRequestEnd(context);
    }
});