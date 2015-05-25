/**
@class fileSync
@classdesc 文件操作同步类. 提供node缺失的目录递归创建和目录copy功能.
@example

//引入oojs和oojs-utility
require('node-oojs');
require('node-oojs-utility');

//创建类引用. fileSync类都是静态方法所以不需要创建实例. 直接通过类调用即可.
var  fileSync = oojs.using('oojs.utility.fileSync');

//拷贝文件夹, 如果目标文件夹不存在, 会自动递归创建目标文件夹
fileSync.copyDirectorySync('./a', './b/c/d/e');

//拷贝的时候, 可以使用filter, 比如下面的例子过滤掉所有"."开头的文件(svn相关文件都是以'.'开头的):
fileSync.copyDirectorySync('./a', './b/c/d/e', function(fileName, filePath){
    if (fileName.indexOf('.') === 0) {
        return false;
    }
    return true;
});


//获取某一个文件夹下面所有的文件. 返回的是一个数组, 里面包含的是一个文件的完整磁盘路径
fileSync.getFileListSync('./a');

//同样可以使用filter过滤:
var  filter = function(fileName, filePath){
    if (fileName.indexOf('.') === 0) {
        return false;
    }
    return true;
};

fileSync.getFileListSync('./a', {filter:filter});
*/
oojs.define({
    name: 'fileSync',
    namespace: 'oojs.utility',
    deps:{
        fs: require('fs'),
        path: require('path'),
        util: 'oojs.utility.util'
    },
    option:{
        //文件编码
        encoding : 'utf8',        
        //递归查找的层次数        
        recursion: 10,
        //过滤器,签名为filter(fileName, filePath), 其中fileName为文件名, filePath为文件路径. 
        //可以根据fileName和filePath判断当前文件是否需要被过滤.返回true则表示过滤当前文件或文件夹.
        filter: null        
    },
    
    /**
    Test whether or not the given path exists by checking with the file system. 
    @function fileSync.existsSync
    @static
    @param {string} filePath a path of file which will be check.
    @return {boolean} true if exists
    */
    existsSync: function(filePath){
        return this.fs.existsSync(filePath);
    },
    
    /**
    get the information of a file. return a node fs.Status obejct.
    @function fileSync.statSync
    @static
    @param {string} filePath a path of file which will be check.
    @return {Obejct} node fs.Status obejct
    */
    statSync: function(filePath){
        return this.fs.statSync(filePath);
    },
    
    /**
    读取一个文件, 默认为utf8编码.
    @function fileSync.readFileSync
    @static
    @param {string} sourceDirPath 待读取的文件路径.
    @param {Object} option 设置项. 目前仅支持option.encoding参数.默认为utf8编码.
    @return {string} 文件内容
    */
    readFileSync: function (sourceDirPath, option) {
        var  encoding = option && option.encoding ? option.encoding : 'utf8'
        return this.fs.readFileSync(sourceDirPath, encoding);
    },

    /**
    拷贝目录, 会自动递归创建目标文件夹
    @function fileSync.copyDirectorySync
    @static
    @param {string} sourceDirPath 源文件夹
    @param {string} toDirPath 目标文件夹
    @param {function} filter 过滤器,签名为filter(fileName, filePath), 其中fileName为文件名, filePath为文件路径. 
    可以根据fileName和filePath判断当前文件是否需要被过滤.返回false则表示过滤当前文件或文件夹.
    */
    copyDirectorySync: function (sourceDirPath, toDirPath, filter) {

        sourceDirPath = this.path.resolve(sourceDirPath);
        toDirPath = this.path.resolve(toDirPath);

        var  fileList = this.getFileListSync(sourceDirPath, {filter:filter});
        var  sourcePath = this.path.resolve(sourceDirPath);
        var  toPath = this.path.resolve(toDirPath);


        for (var  i = 0, count = fileList.length; i < count; i++) {
            var  sourceFilePath = fileList[i];
            var  toFilePath = sourceFilePath.replace(sourceDirPath, toDirPath);
            this.copyFileSync(sourceFilePath, toFilePath);
        }

        return this;
    },

    /**
    拷贝文件, 会自动递归创建目标文件夹
    @function fileSync.copyFileSync
    @static
    @param {string} sourceFilePath 源文件
    @param {string} toFilePath 目标文件
    */
    copyFileSync: function (sourceFilePath, toFilePath) {
        var  dirPath = this.path.dirname(toFilePath);
        this.mkdirSync(dirPath);
        this.fs.createReadStream(sourceFilePath).pipe(this.fs.createWriteStream(toFilePath));
        //console.log('copy file finished, source:' + sourceFilePath + ',to:' + toFilePath);
        return this;
    },

    /**
    创建文件夹, 会自动递归创建目标文件夹
    @function fileSync.mkdirSync
    @static
    @param {string} filePath 目标文件夹
    @param {number} mode 创建的文件夹的权限, 比如: 0755, 默认为 0777
    */
    mkdirSync: function (filePath, mode) {
        var  filePath = this.path.resolve(filePath);
        mode = mode || 0777;

        //已经存在, 不需要创建
        if (this.fs.existsSync(filePath)) {
            return this;
        }

        //判断分隔符号
        var  splitChar = '/';
        if (filePath.indexOf('/') === -1) {
            splitChar = '\\';
        }

        filePathArray = filePath.split(splitChar);

        var  currentDir;
        var  currentPath;
        var  previousPath = '';

        for (var  i = 0, count = filePathArray.length; i < count; i++) {
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

    /**
    获取一个目录中所有的文件
    @function fileSync.getFileListSync
    @static
    @param {string} filePath 目标文件夹
    @param {Object} option 参数对象. 参见当前类的option属性
    */
    getFileListSync: function (filePath, option) {
        var  result = [];
        filePath = filePath || './'; //默认为当前目录
        
        //处理参数默认值
        option = this.util.merge(option, this.option);

        //判断递归层次  
        if(option.recursion<1){
            return result;
        }
        
        //获取传递的文件路径
        var  basePath = this.path.resolve(filePath);

        //判断文件夹是否存在.
        if(!this.fs.existsSync(basePath)){
            return result;
        }
        
        //开始遍历文件名
        var  basePathFiles = this.fs.readdirSync(basePath);
        
        for (var  i = 0, count = basePathFiles.length; i < count; i++) {
            var  fileName = basePathFiles[i];
            var  filePath = this.path.resolve( basePath + '/' + fileName );
            var  fileStat = this.fs.statSync(filePath);

            //处理文件
            if (fileStat.isFile()) {
                if (option.filter && option.filter(fileName, filePath)) {
                    continue;
                }            
                result.push( filePath );
            }

            //处理文件夹
            if (fileStat.isDirectory()) {
                option.recursion = option.recursion-1;
                result = result.concat(this.getFileListSync(filePath, option));
                option.recursion = option.recursion+1;
            }
        }

        return result;
    },
    
    /**
    获取一个目录中所有的目录
    @function fileSync.getDirectoryListSync
    @static
    @param {string} filePath 目标文件夹
    @param {Object} option 参数对象. 参见当前类的option属性
    */
    getDirectoryListSync: function (filePath, option) {
        var  result = [];
        filePath = filePath || './'; //默认为当前目录
        
        //处理参数默认值
        option = this.util.merge(option, this.option);
        
        //判断递归层次  
        if(option.recursion<1){
            return result;
        }
        
        //获取传递的文件路径
        var  basePath = this.path.resolve(filePath);
        
        //判断文件夹是否存在.
        if(!this.fs.existsSync(basePath)){
            return result;
        }
        
        //开始遍历文件名
        var  basePathFiles = this.fs.readdirSync(basePath);
        for (var  i = 0, count = basePathFiles.length; i < count; i++) {
            var  fileName = basePathFiles[i];
            var  filePath = this.path.resolve( basePath + '/' + fileName );
            var  fileStat = this.fs.statSync(filePath);

            //处理文件夹
            if (fileStat.isDirectory()) {
                if (option.filter && option.filter(fileName, filePath)) {
                    continue;
                }
                result.push( filePath );
                //入栈
                option.recursion = option.recursion-1;
                result = result.concat(this.getDirectoryListSync(filePath, option));
                //出栈
                option.recursion = option.recursion+1;
            }
        }

        return result;
    }
});


