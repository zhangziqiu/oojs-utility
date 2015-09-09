// npm install node-oojs-utility -g
oojs.define({
    name: 'build',
    namespace: 'oojs.command',
    deps: {
        fileSync: 'oojs.utility.fileSync',
        jsHelper: 'oojs.utility.jsHelper',
        gzip: 'oojs.utility.gzip',
        analyse: 'oojs.utility.analyse'
    },
    $build: function () {
        this.fs = require('fs');
        this.path = require('path');
    },

    build: function (args) {
        this.config = args.config || './package.json';
        this.configPath = this.path.resolve(this.config);
        this.target = args.target;
    },

    recording: {},
    //所有类的名字集合
    classNameArray: [],
    //待加载类的集合
    prepareloadArray: [],
    //待加载的依赖类集合
    prepareDepsArray: [],

    /*
    "build": {
        unionInlay: {
            template: './entry/unionInlay.js',
            sourceFile: ['./test/asset/c.source.js'],
            formatFile: ['./test/asset/c.js'],
            compressFile: ['./asset/c.js'],
            gzipFile: ['./asset/c.js.gz']
        }
    }
    */
    run: function () {
        var  packageObj = require(this.configPath);
        var  buildObj = packageObj.build;
        if (this.target) {
            this.buildItem(buildObj[this.target]);
            return;
        }
        for (var  key in buildObj) {
            if (key && buildObj[key] && buildObj.hasOwnProperty(key)) {
                this.buildItem(buildObj[key]);
            }
        }
    },

    buildItem: function (item) {
        var t6 = +new Date;
        var  buildTemplate = item.template;

        var  templateSource = this.fileSync.readFileSync(buildTemplate);
        var  importRegexp = /\$import\((\S+)\)\s*;/gi;
        var  importWithDepsRegexp = /\$importAll\((\S+)\)\s*;/gi;
        var  importMatch;

        // 处理import命令, 只引用当前类
        var  sourceFileString = templateSource.replace(importRegexp, function () {
            var  result = "";
            var  importFilePath = arguments[1];
            importFilePath = importFilePath.replace(/\'/gi, "").replace(/\"/gi, "");

            //处理 module 引用
            if (importFilePath && importFilePath.indexOf('oojs') > -1) {
                importFilePath = "./node_modules/node-oojs/bin/" + importFilePath + ".js";
            }
            else {
                importFilePath = oojs.getClassPath(importFilePath);
            }

            result = this.fileSync.readFileSync(importFilePath);
            return result;
        }.proxy(this));
        // 处理importWithDeps命令, 加载当前类以及所有依赖的类
        sourceFileString = sourceFileString.replace(importWithDepsRegexp, function () {
            var  result = [];
            var  importFilePath = arguments[1];
            importFilePath = importFilePath.replace(/\'/gi, "").replace(/\"/gi, "");
            // console.log('importFilePath--->', importFilePath);
            var sourceCode = '';
            var t9 = +new Date;
            var  allDepsList = this.analyse.parseSortedDepsList([importFilePath]);
            console.log(allDepsList);
            console.log('t9 analyse', +new Date - t9);
            var t5 = +new Date;
            if (allDepsList) {
                for (var i = 0, len = allDepsList.length; i < len; i++) {
                    var clsName = allDepsList[i];
                    var clsFilePath = oojs.getClassPath(clsName);
                    var code = this.fileSync.readFileSync(clsFilePath, 'utf-8');
                    sourceCode += code;
                }
            }
            console.log('t5 readFileSync', +new Date - t5);

            return sourceCode;
        }.proxy(this));

        //处理source文件
        var  sourceFileArray = item.sourceFile;
        var t1 = +new Date;
        for (var  i = 0, count = sourceFileArray.length; i < count; i++) {
            var  tempSourceFilePath = sourceFileArray[i];
            this.fs.writeFileSync(tempSourceFilePath, sourceFileString);
        }
        console.log('t1 writeFileSync', +new Date - t1);


        //处理format文件
        var t7 = +new Date;
        var  formatFileString = this.jsHelper.formatSync(sourceFileString, {
            comments: false
        });
        console.log('t7 formatSync', +new Date - t7);
        var  formatFileArray = item.formatFile;
        var t2 = +new Date;
        for (var  i = 0, count = formatFileArray.length; i < count; i++) {
            var  tempFormatFilePath = formatFileArray[i];
            this.fs.writeFileSync(tempFormatFilePath, formatFileString);
        }
        console.log('t2 writeFileSync', +new Date - t2)


        //处理compress文件
        var t8 = +new Date;
        var  compressFileString = this.jsHelper.compressSync(sourceFileString);
        console.log('t8 compressSync', +new Date - t8)
        var  compressFileArray = item.compressFile;
        var t3 = +new Date;
        for (var  i = 0, count = compressFileArray.length; i < count; i++) {
            var  tempCompressFilePath = compressFileArray[i];
            this.fs.writeFileSync(tempCompressFilePath, compressFileString);
        }
        console.log('t3 writeFileSync', +new Date - t3);

        //处理gzip文件
        var  gzipFileArray = item.gzipFile;
        var t4 = +new Date;
        for (var  i = 0, count = gzipFileArray.length; i < count; i++) {
            var  tempGzipFilePath = gzipFileArray[i];
            this.gzip.zipStringToFileSync(tempGzipFilePath, compressFileString);
        }
        console.log('t4 zipStringToFileSync', +new Date - t4);
        console.log('t6', +new Date - t6);
    }

});
