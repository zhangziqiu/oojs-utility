define && define({
    name: 'gzip',
    namespace: 'oojs.utility',
    zipSync: function (sourceFilePath, toFilePath, option) {
        var fs = require('fs');
        var zlib = require('zlib');
        option = option || {};
        option.level = option.level || 9;        
        
        var gz = zlib.createGzip({
            level: option.level
        })
        var inp = fs.createReadStream(sourceFilePath);
        var out = fs.createWriteStream(toFilePath);
        inp.pipe(gz).pipe(out);
        return true;
    }

});