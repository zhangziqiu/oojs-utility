require('node-oojs');
var command = oojs.using('oojs.utility.command');
var testArgs = ['node', 'oojs', '--option1=1', '-option2', '2', 'filenameValue'];
var result = command.getCommand(testArgs);
console.log(result);