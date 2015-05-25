oojs.define({
    name: 'tool',
    $tool:function(){
        this.run();
    },
    run: function () {
        //读取js文件
        var  fs = require('fs');
        var  jsSourceString = fs.readFileSync('mraid.js');
        console.log("aaa");
        console.log(jsSourceString);
        return;
        
        //读取java文件
        var  javaSourceString = fs.readFileSync('./test.java');
        
        //js文件压缩
        var  jsHelper = oojs.using('oojs.utility.jsHelper');
        var  jsCompressString = jsHelper.compressSync(jsSourceString);
        
        //js文件替换双引号
        jsCompressString = jsCompressString.replace('"', '\\"');
        
        //替换java文件中的变量
        var  regex = /JAVASCRIPT_SOURCE.*\n?/gi;
        var  replaceString = 'JAVASCRIPT_SOURCE = "' + jsCompressString + '";\n';
        javaSourceString = javaSourceString.replace(regex, replaceString);        
        
        //覆盖java文件
        fs.writeFileSync('test.java', javaSourceString );
    }

});