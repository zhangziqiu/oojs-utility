require('node-oojs');
var  fileWatch = oojs.using('oojs.utility.fileWatch');
var  callback = function () {
        console.log(arguments);
    };

fileWatch.watch('./test/ut/oojs/utility/fileWatch/main-dir', {
    callback: callback
});


// fileWatch.watch('./test/ut/oojs/utility/fileWatch/main-dir/test.txt', function(eventName, fileName){
// console.log(arguments);
// });