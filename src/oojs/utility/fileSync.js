require('node-oojs');

define && define({
    name: 'fileSync',
	namespace: 'oojs.utility',
    $fileSync: function () {
		this.fs = require('fs');
        this.path = require('path');
    },

    copyDirectorySync: function (sourceDirPath, toDirPath, filter) {

        sourceDirPath = this.path.resolve(sourceDirPath);
        toDirPath = this.path.resolve(toDirPath);

        var fileList = this.getFileListSync(sourceDirPath, filter);
        var sourcePath = this.path.resolve(sourceDirPath);
        var toPath = this.path.resolve(toDirPath);


        for (var i = 0, count = fileList.length; i < count; i++) {
            var sourceFilePath = fileList[i];
            var toFilePath = sourceFilePath.replace(sourceDirPath, toDirPath);
            this.copyFileSync(sourceFilePath, toFilePath);
        }

        return this;
    },

    copyFileSync: function (sourceFilePath, toFilePath) {
        var dirPath = this.path.dirname(toFilePath);
        this.mkdirSync(dirPath);
        this.fs.createReadStream(sourceFilePath).pipe(this.fs.createWriteStream(toFilePath));
        //console.log('copy file finished, source:' + sourceFilePath + ',to:' + toFilePath);
        return this;
    },

    mkdirSync: function (filePath, mode) {
        var filePath = this.path.resolve(filePath);
        mode = mode || 0777;

        //已经存在, 不需要创建
        if (this.fs.existsSync(filePath)) {
            return this;
        }

        //判断分隔符号
        var splitChar = '/';
        if (filePath.indexOf('/') === -1) {
            splitChar = '\\';
        }

        filePathArray = filePath.split(splitChar);

        var currentDir;
        var currentPath;
        var previousPath = '';

        for (var i = 0, count = filePathArray.length; i < count; i++) {
            //获取当前的文件夹名和完成的目录地址
            currentDir = filePathArray[i];

            //处理盘符
            if (i === 0) {
                previousPath = currentDir;
                continue;
            }

            currentPath = previousPath + '/' + currentDir;
            previousPath = currentPath;

            if (!this.fs.existsSync(currentPath)) {
                this.fs.mkdirSync(currentPath, mode);
            }
        }

        return this;
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
                result = result.concat(this.getFileListSync(filePath, filter));
            }
        }

        return result;
    }

});