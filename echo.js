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

	var ch = child_process.spawn(config.scripts.createAccess, [data.data.user.text_id], {
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

			data.data['ovpn'] = fileData;

			client.emit('CreateAccess', data);
		});
	});
	
	ch.on('error', (err) => {
		if (config.debug) console.log(`Error: ${err}`);
	});
});

client.on('DeleteAccess', function(data) {
	if (config.debug) console.log(data);

	var ch = child_process.spawn(config.scripts.deleteAccess, [data.data.user.text_id], {
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

		client.emit('DeleteAccess', data);
	});
	
	ch.on('error', (err) => {
		if (config.debug) console.log(`Error: ${err}`);
	});
});

client.on('disconnect', function() {
	console.log(`Disconnect from ${config.echo.host}`);
});

