require('node-oojs');

/**

@class gzip
@classdesc 文件gzip压缩类, 支持字符串和文件的gzip压缩.
@example

//引入oojs和oojs-utility
require('node-oojs');
require('node-oojs-utility');

//创建类引用. gzip 类都是静态方法所以不需要创建实例. 直接通过类调用即可.
var  gzip = oojs.using('oojs.utility.gzip');

//压缩文件
gzip.zipFileSync("./test.js.gz", "./test.js");

//压缩字符串
gzip.zipStringToFileSync("./test.js.gz", 'eJzT0yMAAGTvBe8=');

*/
oojs.define({
    name: 'gzip',
    namespace: 'oojs.utility',
    $gzip: function() {
        this.fs = require('fs');
        this.path = require('path');
        this.zlib = require('zlib');
    },

    processOption: function(option) {
        option = option || {};
        option.level = option.level || 9;
        return option;
    },

    /**
    gzip压缩字符串到文件
    @function gzip.zipFileSync
    @static
    @param {string} toFilePath 目标文件
    @param {string} sourceString 源字符串
    @param {Object} option 设置项. 目前仅支持option.level设置压缩等级,默认为最高压缩比9.
    @return {boolean} 压缩成功返回true
    */
    zipStringToFileSync: function(toFilePath, sourceString, option) {
        option = this.processOption(option);

        var  tempSourceFilePath = this.path.resolve('./') + "/gzip_temp_file_" + parseInt(Math.random() * 1000000) + ".js";
        this.fs.writeFileSync(tempSourceFilePath, sourceString);
        var  gz = this.zlib.createGzip({
            level: option.level
        })
        var  inp = this.fs.createReadStream(tempSourceFilePath);
        var  out = this.fs.createWriteStream(toFilePath);
        inp.pipe(gz).pipe(out);
        this.fs.unlinkSync(tempSourceFilePath);
        return true;
    },

    /**
    gzip压缩文件
    @function gzip.zipFileSync
    @static
    @param {string} toFilePath 目标文件
    @param {string} sourceFilePath 源文件
    @param {Object} option 设置项. 目前仅支持option.level设置压缩等级,默认为最高压缩比9.
    @return {boolean} 压缩成功返回true
    */
    zipFileSync: function(toFilePath, sourceFilePath, option) {
        option = this.processOption(option);

        var  gz = this.zlib.createGzip({
            level: option.level
        })
        var  inp = this.fs.createReadStream(sourceFilePath);
        var  out = this.fs.createWriteStream(toFilePath);
        inp.pipe(gz).pipe(out);
        return true;
    }

});