define && define({
    name: 'analyse',
    namespace: 'oojs.utility',
    deps: {
    },
    $analyse: function () {
        this.fs = require('fs');
        this.path = require('path');
    },

    /**
     * 分析指定路径文件的deps
     **/
    analyzeDeps: function (path) {
        // 缓存源代码，供拼接时使用
        this.codeRecordMap = this.codeRecordMap || {};

        var classDescription = {};

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
                        //&& pNode.key === 'deps'
                    ) {
                        switch (pNode.key) {
                            default :
                                classDescription[pNode.key] = pNode.value.value;
                                break;
                            case 'deps':
                                var depsClassList = pNode.value.properties;
                                var count = depsClassList.length;
                                for (var j = 0; j < count; j++) {
                                    var objectPropertyNode = depsClassList[j];
                                    if (objectPropertyNode instanceof ujs.AST_ObjectProperty) {
                                        var depsClassFullName = objectPropertyNode.value.value;
                                        depsList.push(depsClassFullName);
                                    }
                                }
                                classDescription.deps = depsList;
                                break;
                        }

                        //break;
                    }
                    else {
                        console.log(pNode);
                        console.log('--------------------');
                    }
                }
            }
        }));

        return classDescription;
    },

    /**
     * 递归加载所有的类的依赖
     *
     * @return {Array} depsRecordList 按依赖顺序加载的代码数组
     **/
    loadAllDeps: function (depsList) {
        this.depsRecordMap = this.depsRecordMap || {};

        for (var i = 0, count = depsList.length; i < count; i++) {
            var depsClassFullName = depsList[i];
            if (!this.depsRecordMap.hasOwnProperty(depsClassFullName)) {
                var depsClassFilePath = oojs.getClassPath(depsClassFullName);
                var classData = this.analyzeDeps(depsClassFilePath);
                this.depsRecordMap[depsClassFullName] = classData;
                if (classData.deps) {
                    this.loadAllDeps(classData.deps);
                }
            }
        }
    },

    /**
     * 检查循环依赖
     *
     * @return {boolean} 是否存在循环引用
     */
    checkDepsCircle: function (className, lastClsName, currentClsName, recordMap) {
        recordMap = recordMap || {};
        //console.log(className + ' --- ' + currentClsName);
        if (className === currentClsName) {
            console.log(className + ' 存在依赖循环');
            return true;
        }

        var classDes = this.depsRecordMap[currentClsName || className];
        if (!classDes) {
            return false;
        }
        recordMap[currentClsName] = 1;

        var deps = classDes.deps;
        if (deps && deps.length > 0) {
            for (var i = 0, len = deps.length; i < len; i++) {
                var depsClassName = deps[i];
                if (recordMap.hasOwnProperty(depsClassName) && recordMap[depsClassName] === 1) {
                    continue;
                }

                var result = this.checkDepsCircle(className, currentClsName, depsClassName, recordMap);
                // 递归的结果
                if (result === true) {
                    return true;
                } else {
                    //console.log('---------一条分支结束---------');
                }
            }
        }

        return false;
    },

    sortDeps: function (list) {
        list = list || [];

        var count = 0;
        for (var key in this.depsRecordMap) {
            if (key && this.depsRecordMap.hasOwnProperty(key) && this.depsRecordMap[key]) {
                var classDes = this.depsRecordMap[key];
                // 出度为0
                //console.log(classDes);
                if (
                    !classDes.hasOwnProperty('deps')
                    || classDes.deps.length === 0
                ) {
                    list.push(key);
                    this.clearDep(key);
                    this.depsRecordMap[key] = undefined;
                } else {
                    count++;
                }
            }
        }

        if (count > 0) {
            this.sortDeps(list);
        }

        return list;
    },

    clearDep: function (dep) {
        for (var key in this.depsRecordMap) {
            if (key && this.depsRecordMap.hasOwnProperty(key) && this.depsRecordMap[key]) {
                var classDes = this.depsRecordMap[key];
                if (classDes && classDes.hasOwnProperty('deps')) {
                    for (var j = 0, count = classDes.deps.length; j < count; j++) {
                        if (classDes.deps[j] === dep) {

                            //console.log(classDes.name + '   ' + dep + ' is deleted');

                            classDes.deps.splice(j, 1);
                            break;
                        }
                    }

                }
            }
        }

    },

    /**
     * 获得排序后的先后关系列表
     * @returns {*}
     */
    parseSortedDepsList: function (depsList) {
        // 按依赖关系分析出用到的所有类
        this.loadAllDeps(depsList);

        // 检查是否存在循环依赖
        var isCircle = false;
        var badSnakeList = [];
        for (var clsName in this.depsRecordMap) {
            var result = this.checkDepsCircle(clsName);
            if (result) {
                isCircle = true;
                badSnakeList.push(clsName);
            }
            //console.log(clsName + '  ' + result);
        }

        if (isCircle) {
            console.log('存在循环依赖，请解环');
            console.log(badSnakeList);
            return;
        }

        // 依赖关系排序
        return this.sortDeps();
    }

});
