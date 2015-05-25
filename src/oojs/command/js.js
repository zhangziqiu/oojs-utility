oojs.define({
    name: 'js',
    namespace: 'oojs.command',
    js: function (args) {
        this.isFormat = args.format ? true : false;

        this.sourcePath = args.values[0];
        if (this.isFormat) {
            this.targetPath = args.output || this.sourcePath.replace('.js', '.format.js');
        }
        else {
            this.targetPath = args.output || this.sourcePath.replace('.js', '.compress.js');
        }
        this.isOverwrite = args.overwrite ? true : false;

    },

    run: function () {
        var  fs = require('fs');
        var  js = require('uglify-js');
        var  sourceString = fs.readFileSync(this.sourcePath, 'utf-8');
        var  compressString;
        if (this.isFormat) {
            var  ast = js.parse(sourceString);
            var  formatStream = js.OutputStream({
                beautify: true,
                comments: false,
                width: 120
            });
            ast.print(formatStream);
            compressString = formatStream.toString();
        }
        else {
            compressString = js.minify(sourceString, {
                fromString: true
            }).code;
        }

        if (this.isOverwrite) {
            fs.writeFileSync(this.sourceString, compressString);
        }
        else {
            fs.writeFileSync(this.targetPath, compressString);
        }
		return this.targetPath;
    }

});