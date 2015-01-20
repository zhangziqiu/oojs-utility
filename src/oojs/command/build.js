define && define({
    name: 'build',
    namespace: 'oojs.command',
    deps: {
        fileSync: 'oojs.utility.fileSync',
        jsHelper: 'oojs.utility.jsHelper',
        gzip: 'oojs.utility.gzip'
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

    /**
     * 分析指定路径文件的deps
     **/
    analyzeDeps: function (path) {
        var depsList = [];
        var ujs = require('uglify-js');
        var fs = require('fs');
        var code = fs.readFileSync(path, 'utf-8');
        var ast = ujs.parse(code);
        ast.figure_out_scope();
        ast.walk(new ujs.TreeWalker(function (node) {
            if (node instanceof ujs.AST_Call 
                && node.expression.property === 'define'
                && node.args.length === 1
                && node.args[0] instanceof ujs.AST_Object
            ) {
                var pList = node.args[0].properties;
                for (var i = 0, len = pList.length; i < len; i++) {
                    var pNode = pList[i];
                    if (pNode instanceof ujs.AST_ObjectProperty
                        && pNode.key === 'deps'
                    ) {
                        var depsClassList = pNode.value.properties;
                        var count = depsClassList.length;
                        for (var j = 0; j < count; j++) {
                            var objectPropertyNode = depsClassList[j];
                            if (objectPropertyNode instanceof ujs.AST_ObjectProperty) {
                                var depsClassFullName = objectPropertyNode.value.value;
                                depsList.push(depsClassFullName);
                            }
                        }
                        break;
                    }
                }
            }
        }));

        return { 
            deps: depsList, 
            code: code
        };
    },

    /**
     * 递归加载所有的类的依赖
     *
     * @return {Array} depsRecordList 按依赖顺序加载的代码数组
     **/
    loadAllDeps: function (depsList, depsRecordMap, depsRecordList) {
        depsRecordMap = depsRecordMap || {};
        depsRecordList = depsRecordList || [];
        for (var i = 0, count = depsList.length; i < count; i++) {
            var depsClassFullName = depsList[i];
            if (!depsRecordMap.hasOwnProperty(depsClassFullName)) {
                var depsClassFilePath = oojs.getClassPath(depsClassFullName);
                var classData = this.analyzeDeps(depsClassFilePath);
                
                depsRecordMap[depsClassFullName] = true;
                depsRecordList.push(classData.code);
                this.loadAllDeps(classData.deps, depsRecordMap, depsRecordList);
            }
        }

        return depsRecordList;
    },

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
        var packageObj = require(this.configPath);
        var buildObj = packageObj.build;
        if (this.target) {
            this.buildItem(buildObj[this.target]);
            return;
        }
        for (var key in buildObj) {
            if (key && buildObj[key] && buildObj.hasOwnProperty(key)) {
                this.buildItem(buildObj[key]);
            }
        }
    },

    buildItem: function (item) {
        var buildTemplate = item.template;

        var templateSource = this.fileSync.readFileSync(buildTemplate);
        var importRegexp = /\$import\((\S+)\)\s*;/gi;
        var importWithDepsRegexp = /\$importAll\((\S+)\)\s*;/gi;
        var importMatch;

        // 处理import命令, 只引用当前类
        var sourceFileString = templateSource.replace(importRegexp, function () {
            var result = "";
            var importFilePath = arguments[1];
            importFilePath = importFilePath.replace(/\'/gi, "").replace(/\"/gi, "");

            //处理 module 引用
            if (importFilePath && importFilePath.indexOf('oojs') > -1) {
                importFilePath = "./node_modules/node-oojs/src/" + importFilePath.replace('oojs.', "") + ".js";
            }
            else {
                importFilePath = oojs.getClassPath(importFilePath);
            }

            result = this.fileSync.readFileSync(importFilePath);
            return result;
        }.proxy(this));

        // 处理importWithDeps命令, 加载当前类以及所有依赖的类
        sourceFileString = sourceFileString.replace(importWithDepsRegexp, function () {
            var result = [];
            var importFilePath = arguments[1];
            importFilePath = importFilePath.replace(/\'/gi, "").replace(/\"/gi, "");

            var allDepsList = this.loadAllDeps([importFilePath]);
            // 倒序一下，让被依赖的文件尽量前置
            allDepsList.reverse();

            return allDepsList.join("");
        }.proxy(this));


        //处理source文件
        var sourceFileArray = item.sourceFile;
        for (var i = 0, count = sourceFileArray.length; i < count; i++) {
            var tempSourceFilePath = sourceFileArray[i];
            this.fs.writeFileSync(tempSourceFilePath, sourceFileString);
        }


        //处理format文件
        var formatFileString = this.jsHelper.formatSync(sourceFileString, {
            comments: false
        });
        var formatFileArray = item.formatFile;
        for (var i = 0, count = formatFileArray.length; i < count; i++) {
            var tempFormatFilePath = formatFileArray[i];
            this.fs.writeFileSync(tempFormatFilePath, formatFileString);
        }


        //处理compress文件
        var compressFileString = this.jsHelper.compressSync(sourceFileString);
        var compressFileArray = item.compressFile;
        for (var i = 0, count = compressFileArray.length; i < count; i++) {
            var tempCompressFilePath = compressFileArray[i];
            this.fs.writeFileSync(tempCompressFilePath, compressFileString);
        }

        //处理gzip文件
        var gzipFileArray = item.gzipFile;
        for (var i = 0, count = gzipFileArray.length; i < count; i++) {
            var tempGzipFilePath = gzipFileArray[i];
            this.gzip.zipStringToFileSync(tempGzipFilePath, compressFileString);
        }
    }

});
