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
        this.md5 = require('md5');
        // 所有模块源码缓存
        this.cache = {};
        // 总控依赖的所有模块（有序）
        this.allDepsList = [];
        // 所有模块的依赖信息
        // this.depsMap
        
        // 所有painter打包需要的模块
        this.painterDepsList = {}
    },

    build: function (args) {
        // this.config = args.config || './package.json';
        this.config = args? (args.config || './package.json'): './package.json';
        this.configPath = this.path.resolve(this.config);
        this.target = args? args.target: undefined;
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
        this.buildObj = buildObj;
        if (this.target) {
            this.buildItem(buildObj[this.target]);
            return;
        }
        for (var key in buildObj) {
            // 根据名称里有没有`painter`决定是打包总控还是painter
            if (key.toLowerCase().indexOf('painter') < 0) {
                if (key && buildObj[key] && buildObj.hasOwnProperty(key)) {
                    this.buildItem(buildObj[key]);
                }
            } else {
                this.buildPainter(buildObj[key]);
            }
        }
    },
    pathMap2ModuleName: function (path) {
        path = path.split("/");
        path.splice(0, path.indexOf('dup'));
        path = path.join('.').replace('.js', '');
        return path;
    },    
    buildPainter: function (painerObj, onWatch) {
        var filePath = painerObj.template;
        var sourceFilePath = painerObj.sourceFile;
        var formatFilePath = painerObj.formatFile;
        var compressFilePath = painerObj.compressFile;
        var gzipFilePath = painerObj.gzipFile;

        var moduleName = this.pathMap2ModuleName(filePath);
        // 找到该模块所依赖所有模块（有序, 包括子孙的依赖）
        var moduleDeps = this.analyse.parseSortedDepsList([moduleName]);
        // 获取所有模块的直接依赖
        var directDeps = this.analyse.getCloneDeps();


        // 剔除已经打包在总控中的模块
        for (var i = 0; i < moduleDeps.length; i++) {
            if (this.allDepsList.indexOf(moduleDeps[i]) > -1) {
                moduleDeps.splice(i--, 1);
            }
        }

        this.painterDepsList[moduleName] = moduleDeps;

        // 如果所有的模块以及打包在总控中，则不需要进行接下来的打包工作
        if (!moduleDeps.length) {
            console.log("Warning:", moduleName, 'already build in ssp.js');
            return;
        }

        var sourceStr = '';
        var formatStr = '';

        for (var i = 0; i < moduleDeps.length; i++) {
            var name = moduleDeps[i];
            // 新增总控中未打包进的模块的依赖
            this.depsMap[name] = directDeps[name]

            if (!this.cache[name]) {
                var path = oojs.getClassPath(name);

                var source = this.fileSync.readFileSync(path);
                var sourceMd5Val = this.md5(source);

                this.cache[name] = {
                    'source': source,
                    'md5': sourceMd5Val,
                    'format': this.jsHelper.formatSync(source, {
                        comments: false
                    })
                }
            }
            else {
                // console.log(name, 'already been cached');
            }

            sourceStr += this.cache[name].source;
            formatStr += this.cache[name].format;
        }

        for (var i = 0; i < sourceFilePath.length; i++) {
            this.fs.writeFileSync(sourceFilePath[i], ';(function(oojs) {' + sourceStr + '})(_dup_global.oojs);');
        }        
        console.log(moduleName, 'source build successfully');
        
        for (var i = 0; i < formatFilePath.length; i++) {
            this.fs.writeFileSync(formatFilePath[i], ';(function(oojs) {' + formatStr + '})(_dup_global.oojs);');
        }
        console.log(moduleName, 'format build successfully');

        // 如果处于开发模式，则不进行压缩和gzip压缩
        if (onWatch) {
            return false;
        }
        
        for (var i = 0; i < compressFilePath.length; i++) {
            var compressStr = this.jsHelper.compressSync(formatStr);
            this.fs.writeFileSync(compressFilePath[i], ';(function(oojs) {' + compressStr + '})(_dup_global.oojs);');
        }
        console.log(moduleName, 'compress build successfully');

        for (var  i = 0; i < gzipFilePath.length; i++) {
            this.gzip.zipStringToFileSync(gzipFilePath[i], compressStr);
        }        
        console.log(moduleName, 'gzip build successfully');
    
    },
    compareDeps: function (oldDeps, newDeps) {
        var result = {
            adds:[],
            dels:[]
        };

        if ((!oldDeps || !oldDeps.length) && (newDeps && newDeps.length)) {
            result.adds = newDeps;
            return result;
        }

        if ((!newDeps || !newDeps.length) && (oldDeps && oldDeps.length)) {
            result.dels = oldDeps;
            return result;
        }

        for (var i = 0; i < newDeps.length; i++) {
            var temp = newDeps[i];
            if (oldDeps.indexOf(temp) < 0) {
                result.adds.push(temp);
            }
        }

        for (var i = 0; i < oldDeps.length; i++) {
            var temp = oldDeps[i];
            if (newDeps.indexOf(temp) < 0) {
                result.dels.push(temp);
            }
        }

        return result;
    },
    deepCopyArray: function (targetArr) {
        var arr = [];
        for (var i = 0; i < targetArr.length; i++) {
            arr[i] = targetArr[i];
        }
        return arr;
    },
    deepCopyObject: function (sourceObj) {
        var targetObj = {};

        var isObject = function (testSubject) {
            return Object.prototype.toString.call(testSubject) == '[object Object]'? true: false;
        }

        var isArray = function (testSubject) {
            return Object.prototype.toString.call(testSubject) == '[object Array]'? true: false;
        }

        for (var key in sourceObj) {
            
            var value = sourceObj[key];
            
            if (isObject(value)) {
                targetObj[key] = this.deepCopyObject(value);
            } 
            else if (isArray(value)) {
                targetObj[key] = this.deepCopyArray(value);
            } 
            else {
                targetObj[key] = value;
            }
        }
        return targetObj;
    },
    checkModuleIsReferenced: function (moduleName) {
        for (var className in this.depsMap) {
            var module = this.depsMap[className];
            var deps = module.deps;
            if (deps && deps.length) {
                for (var i = 0; i < deps.length; i++) {
                    if (deps[i].indexOf(moduleName) > -1) {
                        return true;
                    }
                }
            }
        }
        return false;
    },
    updateSingleCache: function (className, moduleFilePath, test) {
        var oldDeps = this.depsMap[className]['deps'];
        var source;

        if (moduleFilePath) {
            var source = this.fileSync.readFileSync(moduleFilePath);
            var originSourceMd5Val = this.cache[className]['md5'];
            var currentSourceMd5Val = this.md5(source);

            if (originSourceMd5Val === currentSourceMd5Val) {
                return 1;
            }

            // 更新md5
            // 为了解决下面所说analyzeDeps修改导致文件被修改的问题
            this.cache[className]['md5'] = currentSourceMd5Val 

            var isEmptyObj = function (obj) {
                for (var key in obj) {
                    return false;
                }
                return true;
            }

            /*
                analyzeDeps函数有几个bug
                1. 会导致文件被修改（所以需要上面一步的md5校验）
                2. 分析结果会出错，返回为空对象
             */
            var analyseResult = this.analyse.analyzeDeps(moduleFilePath);
            // 检测analyzeDeps返回是否出错
            if (isEmptyObj(analyseResult)) {
                return 2;
            }

            var newDeps = analyseResult.deps;          
            var compareDepsResult = this.compareDeps(oldDeps, newDeps);

            // 如果修改后的模块依赖发生更改
            // 重新计算打包依赖的所有模块
            if (compareDepsResult.dels.length || compareDepsResult.adds.length) {
                // 更新单个模块额缓存代码
                this.cache[className]['source'] = source;
                // 更新该模块的依赖
                this.depsMap[className]['deps'] = this.deepCopyArray(newDeps);         
                // 重新计算所有模块的依赖，以防止有循环依赖
                this.reCalculateAllDeps();                
            }


            // // 如果仅仅是有依赖被删除，无新依赖增加
            // // 则模块的入度出度可能发生变化
            // // 调整模块排序即可
            // if (compareDepsResult.dels.length && !compareDepsResult.adds.length) {
            //     var deepCopyDepsMap = this.deepCopyObject(this.depsMap);
            //     this.allDepsList = this.analyse.sortDeps([], deepCopyDepsMap);
            // }
            // // 如果有新的依赖加入或者同时有依赖模块被删除
            // // 模块的入度和出度可能发生变化
            // // 可能出现循环依赖的情况
            // // 所以需要重新计算依赖
            // else if (compareDepsResult.adds.length) {   
            //     // 为了保证在下一步中计算依赖时能够直接从缓存中读取
            //     // 并且是最新代码
            //     // 需要在这里提前将source赋值
            //     this.reCalculateAllDeps();
            // }

        }

        var singleCache = this.cache[className];
        singleCache.source = source || singleCache.source;
        singleCache.format = this.jsHelper.formatSync(singleCache.source, {
            comments: false
        });  
        return true;                        
    },
    rebuild: function () {
        for (var  key in this.buildObj) {
            if (key && this.buildObj[key] && this.buildObj.hasOwnProperty(key)) {
                if (key.toLowerCase().indexOf('painter') > -1) {
                    this.buildPainter(this.buildObj[key], true);
                } else {
                    this.build4watch(this.buildObj[key]);
                }
            }
        }
    },
    reCalculateAllDeps: function () {
        var  importWithDepsRegexp = /\$importAll\((\S+)\)\s*;/gi;

        // 总控
        this.originSourceFileString.replace(importWithDepsRegexp, function () {
            var  result = [];
            var  importFilePath = arguments[1];
            importFilePath = importFilePath.replace(/\'/gi, "").replace(/\"/gi, "");
            this.allDepsList = this.analyse.parseSortedDepsList([importFilePath]);
            // 缓存所有模块的依赖信息
            this.depsMap = this.analyse.getCloneDeps();
            if (this.allDepsList) {
                for (var i = 0, len = this.allDepsList.length; i < len; i++) {
                    var clsName = this.allDepsList[i];
                    // 如果有新模块加入
                    if (!this.cache[clsName]) {
                        var clsFilePath = oojs.getClassPath(clsName);
                        var code = this.fileSync.readFileSync(clsFilePath, 'utf-8');
                        // 更新代码缓存
                        var singleCache = (this.cache[clsName] = this.cache[clsName] || {});
                        singleCache['source'] = code;
                        singleCache['md5'] = this.md5(code);
                    }
                }
            }
        }.proxy(this));

        // painter:
        for (var moduleName in this.painterDepsList) {
            var moduleDeps = this.analyse.parseSortedDepsList([moduleName]);            
            this.painterDepsList[moduleName] = moduleDeps;
            for (var i = 0; i < moduleDeps.length; i++) {
                var clsName = moduleDeps[i];
                // 如果有新模块加入
                if (!this.cache[clsName]) {
                    var clsFilePath = oojs.getClassPath(clsName);
                    var code = this.fileSync.readFileSync(clsFilePath, 'utf-8');
                    // 更新代码缓存
                    var singleCache = (this.cache[clsName] = this.cache[clsName] || {});
                    singleCache['source'] = code;
                    singleCache['md5'] = this.md5(code);
                }                                
            }
        }

    },
    build4watch: function (item) {
        //处理source文件
        this.buildSourceFile(item.sourceFile)

        //处理format文件
        var formatString = this.buildFormatFile(item.formatFile);
    },
    buildTotally: function (item) {

        //处理source文件
        this.buildSourceFile(item.sourceFile)

        //处理format文件
        var formatString = this.buildFormatFile(item.formatFile);

        // 处理compress文件
        var compressStr = this.buildCompressFile(item.compressFile, formatString);

        // 处理gzip文件
        this.buildGzipFile(item.gzipFile, compressStr);
    },
    _build: function (filePathArr,format) {
        var totalStr = '';
        var  importWithDepsRegexp = /\$importAll\((\S+)\)\s*;/gi;

        totalStr = this.originSourceFileString.replace(importWithDepsRegexp, function () {
            var  sourceCode = '';
            for (var j = 0; j < this.allDepsList.length;j++) {
                var clsName = this.allDepsList[j];
                var singleCache = this.cache[clsName];
                sourceCode += singleCache[format];
            }
            return sourceCode;
        }.proxy(this));  

        for (var  i = 0, count = filePathArr.length; i < count; i++) {
            var  tempFilePath = filePathArr[i];
            this.fs.writeFileSync(tempFilePath, totalStr);
        }

        return totalStr;
    },
    buildSourceFile: function (filePathArr) {
        return this._build(filePathArr, 'source');
    },
    buildFormatFile: function (filePathArr) {
        return this._build(filePathArr, 'format');
    },
    buildCompressFile: function (filePathArr, unCompressStr) {
        var compressStr = this.jsHelper.compressSync(unCompressStr);
        for (var  i = 0, count = filePathArr.length; i < count; i++) {
            var  tempFilePath = filePathArr[i];
            this.fs.writeFileSync(tempFilePath, compressStr);
        }
        return compressStr;
    },
    buildGzipFile: function (filePathArr, compressStr) {
        for (var  i = 0, count = filePathArr.length; i < count; i++) {
            var  tempGzipFilePath = filePathArr[i];
            this.gzip.zipStringToFileSync(tempGzipFilePath, compressStr);
        }
    },

    buildItem: function (item) {
        var buildItemStartTimestamp = +new Date;
        var buildTemplate = item.template;
        var _this = this;

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

        this.originSourceFileString = sourceFileString;

        // 处理importWithDeps命令, 加载当前类以及所有依赖的类
        sourceFileString = sourceFileString.replace(importWithDepsRegexp, function () {
            var  result = [];
            var  importFilePath = arguments[1];
            importFilePath = importFilePath.replace(/\'/gi, "").replace(/\"/gi, "");
            var sourceCode = '';
            this.allDepsList = this.analyse.parseSortedDepsList([importFilePath]);
            // console.log("------>", importFilePath);
            // console.log("------>", this.allDepsList);

            // 缓存所有模块的依赖信息
            this.depsMap = this.analyse.getCloneDeps();
            if (this.allDepsList) {
                for (var i = 0, len = this.allDepsList.length; i < len; i++) {
                    var clsName = this.allDepsList[i];
                    var clsFilePath = oojs.getClassPath(clsName);
                    var code = this.fileSync.readFileSync(clsFilePath, 'utf-8');
                    // 更新代码缓存
                    var singleCache = (this.cache[clsName] = this.cache[clsName] || {});
                    singleCache['source'] = code;
                    singleCache['md5'] = this.md5(code);
                    sourceCode += code;
                }
            }
            return sourceCode;
        }.proxy(this));

        //更新cache
        for (var i = 0; i < this.allDepsList.length; i++) {
            var clsName = this.allDepsList[i];
            this.updateSingleCache(clsName);
        }

        this.buildTotally(item);

        console.log('First ssp.js build totally cost', +new Date - buildItemStartTimestamp, 'ms');
    } 

});
