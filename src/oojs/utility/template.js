oojs.define({
    name:'template',
    namespace:'oojs.utility',

    getTemplate:function(func){
        return func.toString().match(/\/\*\s*([\s\S]*?)\s*\*\//m)[1];
    },
    compile:function(templateSource){
        var  funcString= 'var  $="";';
        var  templateSourceArray = templateSource.replace(/[\r\t\n]/g, " ").replace(/\<\%\=/g, "\<\=\%").split('<%');
        var  i=0;
        while(i<templateSourceArray.length){
            var  p = templateSourceArray[i];
            if(i){
                var  x = p.indexOf('%>');
                funcString += p.substr(0, x);
                p = p.substr(x+2)
            }
            funcString += "$+='"+p.replace(/\<\=\%(.*?)\%\>/g, "'+$1+'")+"';";
            i++;
        }
        funcString += "return $";
        return this.renderFunc = new Function('data',funcString);
    },
    render:function(data){
        return this.renderFunc(data);
    }
});
