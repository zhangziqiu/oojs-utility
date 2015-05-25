oojs.define({
    name: 'smart',
    namespace: 'oojs.command',
    smart: function (args) {
        console.log('aaa');
        this.sourcePath = args.values[0];
        //识别文件类型
        if (this.sourcePath.indexOf('.js') > -1) {
            this.fileType = 'js';
        }
        else if (this.sourcePath.indexOf('.css') > -1) {
            this.fileType = 'css';
        }
    },

    run: function () {
        var  gzipClass = oojs.using('oojs.command.gzip');
        if (this.fileType === 'js') {
            //js的处理
            var  jsClass = oojs.using('oojs.command.js');
            var  jsArgs = {
                values: []
            };
            jsArgs.values.push(this.sourcePath);

            //compress
            var  jsCompress = oojs.create(jsClass, jsArgs);
            var  jsCompressFile = jsCompress.run();

            //format
            jsArgs.format = true;
            var  jsFormat = oojs.create(jsClass, jsArgs);
            jsFormat.run();

            //gzip
            var  gzipArgs = {
                values: []
            };
            gzipArgs.values.push(jsCompressFile);
            gzipArgs.output = this.sourcePath + ".gz";
            var  jsGzip = oojs.create(gzipClass, gzipArgs);
            jsGzip.run();


        }
        else if (this.fileType === 'css') {
            //css的处理
            var  cssClass = oojs.using('oojs.command.css');
            var  cssArgs = {
                values: []
            };
            cssArgs.values.push(this.sourcePath);

            //compress
            var  cssCompress = oojs.create(cssClass, cssArgs);
            var  cssCompressFile = cssCompress.run();

            //format
            cssArgs.format = true;
            var  cssFormat = oojs.create(cssClass, cssArgs);
            cssFormat.run();

            //gzip
            var  gzipArgs = {
                values: []
            };
            gzipArgs.values.push(cssCompressFile);
            gzipArgs.output = this.sourcePath + ".gz";
            var  cssGzip = oojs.create(gzipClass, gzipArgs);
            cssGzip.run();
        }
    }

});