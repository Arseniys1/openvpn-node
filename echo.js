var io = require('socket.io-client');
var child_process = require('child_process');
var fs = require('fs');
var config = require('./config');

var client = io(config.echo.host, {
	transportOptions: {
		polling: {
			extraHeaders: {
				token: config.echo.token
			}
		}
	}
});

client.on('connect', function() {
	console.log(`Connect to ${config.echo.host}`);
});

client.on('CreateAccess', function(data) {
	if (config.debug) console.log(data);

	var ch = child_process.spawn('sh/create-user.sh', [data.data.user.text_id], {
		shell: true,
	});

	ch.stdout.on('data', (chData) => {
		if (config.debug) console.log(`Stdout: ${chData}`);
	});

	ch.stderr.on('data', (chData) => {
		if (config.debug) console.log(`Stderr: ${chData}`);
	});
	
	ch.on('close', (code) => {
		if (config.debug) console.log(`Code: ${code}`);

		fs.readFile(`/root/${data.data.user.text_id}.ovpn`, 'utf8', function (error, fileData) {
			if (error && config.debug) console.log(error);
			
			client.emit('CreateAccess', {
				...data,
				ovpn: fileData
			});
		});
	});
	
	ch.on('error', (err) => {
		if (config.debug) console.log(`Error: ${err}`);
	});
});

client.on('DeleteAccess', function(data) {
	shell.exec(config.scripts.deleteAccess + ' ' + data.user_id);

	client.emit('DeleteAccess', data);
});

client.on('disconnect', function() {
	console.log(`Disconnect from ${config.echo.host}`);
});

