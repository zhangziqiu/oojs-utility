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

            var sourceCode = '';
            var  allDepsList = this.analyse.parseSortedDepsList([importFilePath]);
            if (allDepsList) {
                for (var i = 0, len = allDepsList.length; i < len; i++) {
                    var clsName = allDepsList[i];
                    var clsFilePath = oojs.getClassPath(clsName);
                    var code = this.fileSync.readFileSync(clsFilePath, 'utf-8');
                    sourceCode += code;
                }
            }

            return sourceCode;
        }.proxy(this));


        //处理source文件
        var  sourceFileArray = item.sourceFile;
        for (var  i = 0, count = sourceFileArray.length; i < count; i++) {
            var  tempSourceFilePath = sourceFileArray[i];
            this.fs.writeFileSync(tempSourceFilePath, sourceFileString);
        }


        //处理format文件
        var  formatFileString = this.jsHelper.formatSync(sourceFileString, {
            comments: false
        });
        var  formatFileArray = item.formatFile;
        for (var  i = 0, count = formatFileArray.length; i < count; i++) {
            var  tempFormatFilePath = formatFileArray[i];
            this.fs.writeFileSync(tempFormatFilePath, formatFileString);
        }


        //处理compress文件
        var  compressFileString = this.jsHelper.compressSync(sourceFileString);
        var  compressFileArray = item.compressFile;
        for (var  i = 0, count = compressFileArray.length; i < count; i++) {
            var  tempCompressFilePath = compressFileArray[i];
            this.fs.writeFileSync(tempCompressFilePath, compressFileString);
        }

        //处理gzip文件
        var  gzipFileArray = item.gzipFile;
        for (var  i = 0, count = gzipFileArray.length; i < count; i++) {
            var  tempGzipFilePath = gzipFileArray[i];
            this.gzip.zipStringToFileSync(tempGzipFilePath, compressFileString);
        }
    }

});
