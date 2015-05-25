require('node-oojs');

var  fileSync = oojs.using('oojs.utility.fileSync');
var  fileFilter = function (fileName, filePath) {
        if (fileName === 'a.txt') {
            //console.log('fileName:' + fileName);
            //console.log('filePath:' + filePath);
            return true;
        }
        return false;
    };
var  diretoryFilter = function (fileName, filePath) {
        if (fileName === 'b') {
            //console.log('fileName:' + fileName);
            //console.log('filePath:' + filePath);
            return true;
        }
        return false;
    };

console.log('getFileListSync, no filter:');
var  fileList = fileSync.getFileListSync('./test/ut/oojs/utility/fileSync/testDir');
console.log(fileList);
console.log('getFileListSync, with filter:');
var  fileList = fileSync.getFileListSync('./test/ut/oojs/utility/fileSync/testDir', {
    filter: fileFilter
});
console.log(fileList);


console.log('getDirectoryListSync, no filter:');
var  dirList = fileSync.getDirectoryListSync('./test/ut/oojs/utility/fileSync/testDir');
console.log(dirList);
console.log('getDirectoryListSync, with filter:');
var  dirList = fileSync.getDirectoryListSync('./test/ut/oojs/utility/fileSync/testDir', {
    filter: diretoryFilter
});
console.log(dirList);