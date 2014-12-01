require('node-oojs');
var fileWatch = oojs.using('oojs.utility.fileWatch');
fileWatch.watch('./test/ut/oojs/utility/fileWatch/main-dir', function(eventName, fileName){
    console.log('eventName:' + eventName);
    console.log('fileName:' + fileName);
});

