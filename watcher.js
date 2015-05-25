var  exec = require('child_process').exec;
// https://github.com/mikeal/watch 
// npm install watch
var  watcher = require('watch'); 

function build () {

	exec("oojs build", function (error, stdout, stderr) {
		if (error) {
			console.log("【Build Error】--->", error);
			return;
		}

		if (stderr) {;
			console.log("【Build Error】--->", stderr);
			return;
		}
		
		console.log("【Build Successed】");
	});	
}

var  targetProject = '/usr/local/lib/node_modules/node-oojs-utility/';

function copy (file) {
    var  cmd = "sudo rm " + targetProject + file;
    console.log(cmd);
    exec(cmd, function (error, stdout, stderr) {
		if (error) {
			console.log("[rm Error】--->", error);
			//return;
		}

		if (stderr) {;
			console.log("【rm Error】--->", stderr);
			//return;
		}
		
		console.log("【rm Successed】");
	});

    var  cmd2 = "sudo cp " + file + " " + targetProject + file;
    console.log(cmd2);
    exec(cmd2, function (error, stdout, stderr) {
		if (error) {
			console.log("[cp Error】--->", error);
			return;
		}

		if (stderr) {;
			console.log("【cp Error】--->", stderr);
			return;
		}
		
		console.log("【cp Successed】 " + new Date().toString());
	});
}

function publish (command, file) {
	//console.log("【File " + command + "】--->", file);
    if (/\.js$/.test(''+file) > 0) {
        copy(file);
    }
}

watcher.watchTree("./src", function (f, curr, prev) {
	
	if (prev === null) {
		//publish("Created", f);
    } 
    else if (curr.nlink === 0) {
		//publish("Removed", f);
    } 
    else {
		publish("Changed", f);
    }
});


