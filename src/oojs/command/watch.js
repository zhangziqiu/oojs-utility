// npm install node-oojs-utility -g
oojs.define({
    name: 'watch',
    namespace: 'oojs.command',
    deps: {
        build: 'oojs.command.build',
        fileSync: 'oojs.utility.fileSync'
    },
    pathMap2ModuleName: function (path) {
        path = path.split('\\');
        path.splice(0, 1);
        return path.join('.').replace('.js', '');
    },
    $watch: function () {

        this.build.$build();
        this.build.build();
        this.build.run();

        var watchArr = ['entry', 'src'];
        var ignoredArr = ['node_modules', '.gitignore', '.git', ];
        var _this = this;

        require('chokidar')
        .watch(watchArr, {
            ignored: ignoredArr,
            ignoreInitial: true
        })
        .on('all', function(event, path) {
            var watchEvent = ['add', 'addDir', 'unlink', 'unlinkDir', 'change'];
            var kindOfEvent = watchEvent.indexOf(event);

            // 目前不考虑文件夹添加/删除的情况
            if (kindOfEvent === 1 || kindOfEvent === 3) {
                
                if (kindOfEvent === 1) {
                    console.log("File added, but ignored");
                }

                if (kindOfEvent === 3) {
                    conosle.log('File deleted, but ignored');
                }

                return;
            }

            // 有新文件加入
            // 则先不做任何操作
            // 参考reference count算法，新文件加入无害
            // 但是如果从回收站还原的文件不算做新文件加入
            if (kindOfEvent == 0) {
                return;
            }

            // 有文件被删除
            if (kindOfEvent == 2) {
                var moduleName = _this.pathMap2ModuleName(path);
                // 如果该模块被其他模块引用
                // 则终止构建
                if (_this.build.checkModuleIsReferenced(moduleName)) {
                    return false;
                }
                console.log('------>', event, path, '<------');
                var t1 = +new Date;
                _this.build.rebuild();
                console.log('Rebuild totally cost ' + (+new Date - t1) + ' ms');
                return;
            }

            // 如果有文件被修改
            // 或者从回收站还原
            if (kindOfEvent == 4) {
                // 1.根据路径映射为模块名称
                var moduleName = _this.pathMap2ModuleName(path);
                // 2.重新从磁盘中读取源文件
                var moduleFilePath = oojs.getClassPath(moduleName);
                // 3.更新单个模块缓存

                // 如果更新结果返回非true(可能返回字符串，供调试用)
                // 则表示该文件更改由uglify引起bug
                // 终止构建
                var isBool = function (t) {
                    return Object.prototype.toString.call(t) === "[object Boolean]"? true:false;
                }

                // 这一步极有可能出错
                // 所以最多尝试3次
                var tryCount = 3;
                while (tryCount) {
                    /*
                        analyzeDeps函数有几个bug
                        1. 会导致文件被修改
                        2. 分析结果会出错，返回为空对象
                     */
                    var updateResult = _this.build.updateSingleCache(moduleName, moduleFilePath, true);
                    if (isBool(updateResult) && updateResult) {
                        // tryCount =3;
                        break;
                    } else if (updateResult === 2){
                        console.log('"analyzeDeps" function return empty object, try again');
                        tryCount--;
                    }
                }

                if (!tryCount) {
                    // tryCount = 3;
                    return;
                }

                console.log('------>', event, path, '<------');
                // 4.重新执行压缩
                var t1 = +new Date;
                _this.build.rebuild();
                console.log('Rebuild totally cost ' + (+new Date - t1) + ' ms');                
            }

        });
    },

    run: function () {

    }
});
 