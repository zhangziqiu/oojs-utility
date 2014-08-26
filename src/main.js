require('node-oojs');
define && define({
    name: 'main',
    $main: function () {
        this.fs = require('fs');
        this.path = require('path');

        var fileList = this.getFileListSync(__dirname);
        for (var i = 0, count = fileList.length; i < count; i++) {
            var file = fileList[i];
            if (file && file.indexOf &&  file.indexOf('main.js')<0 ) {
                require(fileList[i]);
            }
        }
    },

    getFileListSync: function (filePath, filter) {
        var result = [];
        filePath = filePath || './'; //默认为当前目录
        var basePath = this.path.resolve(filePath);
        var basePathFiles = this.fs.readdirSync(basePath);

        //开始遍历文件名
        for (var i = 0, count = basePathFiles.length; i < count; i++) {
            var fileName = basePathFiles[i];
            var filePath = basePath + '/' + fileName;
            var fileStat = this.fs.statSync(filePath);

            if (filter && !filter(fileName, filePath)) {
                continue;
            }

            //处理文件
            if (fileStat.isFile()) {
                result.push(filePath);
            }

            //处理文件夹
            if (fileStat.isDirectory()) {
                result = result.concat(this.getFileListSync(filePath));
            }
        }

        return result;
    }
});