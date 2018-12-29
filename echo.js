var io = require('socket.io-client');
var shell = require('shelljs');
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
	// var shellOut = shell.exec(config.scripts.createAccess + ' ' + data.user_id);
	var shellOut = shell.exec('dir');

	client.emit('CreateAccess', {
		...data,
		ovpn: shellOut // output ovpn file
	});
});

client.on('DeleteAccess', function(data) {
	shell.exec(config.scripts.deleteAccess + ' ' + data.user_id);

	client.emit('DeleteAccess', data);
});

client.on('disconnect', function() {
	console.log(`Disconnect from ${config.echo.host}`);
});

