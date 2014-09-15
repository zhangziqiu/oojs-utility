define && define({
    name: 'gzip',
    namespace: 'oojs.utility',
    $gzip: function () {
        this.fs = require('fs');
        this.path = require('path');
        this.zlib = require('zlib');
    },

    processOption: function (option) {
        option = option || {};
        option.level = option.level || 9;
        return option;
    },

    zipStringToFileSync: function (toFilePath, sourceString, option) {
        option = this.processOption(option);
        
        var tempSourceFilePath = this.path.resolve('./') + "/gzip_temp_file_"+parseInt(Math.random()*1000000)+".js";
        this.fs.writeFileSync(tempSourceFilePath, sourceString );
        var gz = this.zlib.createGzip({
            level: option.level
        })
        var inp = this.fs.createReadStream(tempSourceFilePath);
        var out = this.fs.createWriteStream(toFilePath);
        inp.pipe(gz).pipe(out);
        this.fs.unlinkSync(tempSourceFilePath);
        return true;
    },

    zipFileSync: function (sourceFilePath, toFilePath, option) {
        option = this.processOption(option);

        var gz = this.zlib.createGzip({
            level: option.level
        })
        var inp = this.fs.createReadStream(sourceFilePath);
        var out = this.fs.createWriteStream(toFilePath);
        inp.pipe(gz).pipe(out);
        return true;
    }

});