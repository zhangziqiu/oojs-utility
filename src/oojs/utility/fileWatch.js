require('node-oojs');

oojs.define({
    name: 'fileWatch',
    namespace: 'oojs.utility',
    deps: {
        fs: require('fs'),
        path: require('path'),
        fileSync: 'oojs.utility.fileSync',
        util: 'oojs.utility.util'
    },

    //参数默认值
    option: {
        /*
        回调函数, 签名为: callback([{eventName:eventName, fileName:fileName, filePath:filePath}]);
        其中eventName表示事件名称, 目前不稳定, 不可用.
        fileName表示文件名, 如果是删除文件, 会添加两条记录, 其中一条的fileName为 null, 另一条是文件夹名. 
        如果是新增文件, 会添加两条记录, 其中一条的fileName为 文件名, 另一条是文件夹名.     
        filePath表示去除了fileName后剩余的文件路径部分. 当fileName为null或者文件的时候, filePath表示文件所在路径. 
        当fileName为文件夹名的时候, filePath表示不包含fileName文件夹的父文件夹路径. 
        */
        callback: null, 
        recursion: 10,  //递归监控的层次数. 默认为10层.
        persistent: true, //表示监控到一次事件发生后, 是否继续监控. true表示继续监控.
        delayTime: 200 //延迟时间, 当在延迟时间内多次发生文件变化时, 会合并成一次请求发送给回调函数        
    },

    /**
    事件代理函数, 主要解决原生的文件监控多次触发的问题
    context: 上下文对象
    */
    onChange: function (eventName, fileName, filePath, context) {
        context.fileArray = context.fileArray || [];
        context.fileRecording = context.fileRecording || {};
        var fileFullName = filePath + '/' + fileName;
        if (!context.fileRecording[fileFullName]) {
            context.fileRecording[fileFullName] = true;
            context.fileArray.push({
                eventName: eventName,
                fileName: fileName,
                filePath: filePath
            });
        }

        if (context.timerId) {
            clearTimeout(context.timerId);
            context.timerId = null;
        }

        context.timerId = setTimeout(this.onChangeHandler, 1000, context);
    },

    /**
    事件最后的处理函数
    context: 上下文对象
    */
    onChangeHandler: function (context) {
        if (context.fileArray && context.callback) {
            context.callback(context.fileArray);
        }
        context.timerId = null;
        context.fileArray = null;
        context.fileRecording = null;
    },
    
    /**
    监控函数
    filePath: 监控的文件路径
    option: 参数对象. 参见类的this.option属性.
    */
    watch: function (filePath, option) {
        //处理参数, 添加默认值
        this.util.merge(option, this.option);
        
        //必须传递回调函数
        if( !option.callback ){
            throw new Error(' option.callback is required!');
        }

        //判断文件或者文件夹是否存在
        filePath = this.path.resolve(filePath);
        if (!this.fileSync.existsSync(filePath)) {
            throw new Error('watch filePath do not exist:' + filePath);
            return false;
        }

        //node自带的监控函数, 在文件改变一次时可能被触发多次. 使用代理函数解决此问题.
        var  context = {};
        context.callback = option.callback;
        var  fileStat = this.fileSync.statSync(filePath);

        //处理文件
        var  directoryPath;
        if (fileStat.isFile()) {
            directoryPath = this.path.dirname(filePath);
            this.fs.watch(filePath, option, this.onChange.proxy(this, directoryPath, context));
        }
        else if (fileStat.isDirectory()) {
            //监控主文件夹
            this.fs.watch(filePath, option, this.onChange.proxy(this, filePath, context));

            //递归监控子文件夹
            var  directoryList = this.fileSync.getDirectoryListSync(filePath, option);
            for (var  i = 0, count = directoryList.length; i < count; i++) {
                directoryPath = directoryList[i];
                this.fs.watch(directoryPath, option, this.onChange.proxy(this, directoryPath, context));
            }
        }
        return true;
    }
});