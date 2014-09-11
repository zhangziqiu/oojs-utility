define && define({
    name: 'jsHelper',
    namespace: 'oojs.utility',
    $jsHelper: function () {
        this.fs = require('fs');
        this.js = require('uglify-js');
    },
    compressSync: function (source) {
        var result = this.js.minify(source, {
            fromString: true
        }).code;

        return result;
    },
    formatSync: function (source, option) {
        var result;
        var ast = this.js.parse(source);
        option = option || {};
        option.beautify = typeof option.beautify === 'undefined' ? true : option.beautify;
        option.comments = typeof option.comments === 'undefined' ? true : option.comments;
        option.width = typeof option.width === 'undefined' ? 120 : option.width;

        var formatStream = this.js.OutputStream({
            beautify: option.beautify,
            comments: option.comments,
            width: option.width
        });
        ast.print(formatStream);
        result = formatStream.toString();
        return result;
    } 
});