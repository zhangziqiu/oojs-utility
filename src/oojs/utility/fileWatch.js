require('node-oojs');

define && define({
    name: 'fileWatch',
    namespace: 'oojs.utility',
    deps: {
        fileSync: 'oojs.utility.fileSync'
    },
    $fileWatch: function () {
        this.fs = require('fs');
        this.path = require('path');
    },

    watch: function (filePath, option, callback) {
        //只传递了两个参数, 则忽略option
        if (!callback) {            
            callback = option;
            option = {};
        }

        //persistent表示监控到一次事件发生后, 是否继续监控
        option = option || {};
        option.persistent = typeof option.persistent === 'undefined' ? true : option.persistent;
        
        filePath = this.path.resolve(filePath);
        var fileStat = this.fs.statSync(filePath);

        //处理文件
        if (fileStat.isFile()) {
            this.fs.watch(filePath, option, callback);
        }
        else if (fileStat.isDirectory()) {
            //处理文件夹
            var directoryList = this.fileSync.getDirectoryListSync(filePath);
            for (var i = 0, count = directoryList.length; i < count; i++) {
                var directoryPath = directoryList[i];
                this.fs.watch(directoryPath, option, callback);
            }
        }
        return true;
    }
});