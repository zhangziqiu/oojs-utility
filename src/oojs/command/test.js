define && define({
   name: 'test',
   namespace: 'oojs.command',
   test:function(args){
        console.log('test constructor ok');
        console.log('args:');
        console.log(args);
   },
   run:function(){
        console.log('test run ok');
   }
});