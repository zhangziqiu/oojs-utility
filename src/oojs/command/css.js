oojs.define({
    name:'css',
    namespace:'oojs.command',
    css : function(args){    
        this.isFormat = args.format ? true : false;
        this.sourcePath = args.values[0];
        if (this.isFormat) {
            this.targetPath = args.output || this.sourcePath.replace('.css', '.format.css');
        }
        else {
            this.targetPath = args.output || this.sourcePath.replace('.css', '.compress.css');
        }
        this.isOverwrite = args.r ? true : false;
    },
    
    run:function(){
        var  fs = require('fs');
        var  cssClass = require('clean-css');
        var  css = new cssClass({keepBreaks: this.isFormat});
        var  sourceString = fs.readFileSync(this.sourcePath, 'utf-8');
        var  compressString = css.minify(sourceString);    
        
        if(this.isOverwrite){
            fs.writeFileSync( this.sourceString, compressString );
        }
        else{
            fs.writeFileSync( this.targetPath, compressString );
        }
        return this.targetPath;
    }
    
});