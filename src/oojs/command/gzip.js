oojs.define({
	name:'gzip',
	namespace:'oojs.command',
	gzip : function(args){	
		this.sourcePath = args.values[0];
		this.targetPath = args.output || this.sourcePath + ".gz";
		this.compressLevel = args.compress || 9;
	},
	
	run:function(){
		var  fs = require('fs');
		var  zlib = require('zlib');
        var  gz = zlib.createGzip({
            level: 9
        })
        var  inp = fs.createReadStream(this.sourcePath);
        var  out = fs.createWriteStream(this.targetPath);
		inp.pipe(gz).pipe(out);
	}
	
});