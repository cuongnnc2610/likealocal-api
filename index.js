const http = require('http');
const app = require('./server/index');
const Logger = require('./utils/logger');

const logger = new Logger();

const server = http.createServer(app);

function normalizePort(val) {
	const port = parseInt(val, 10);

	if (Number.isNaN(port)) {
		return val;
	}

	if (port >= 0) {
		return port;
	}

	return false;
}

const port = process.env.PORT || 8080;
// const port = normalizePort(process.env.DEV_APP_PORT || '8080');
app.set('port', port);

function onError(error) {
	if (error.syscall !== 'listen') {
		throw error;
	}

	const bind = typeof port === 'string'
		? `Pipe ${port}`
		: `Port ${port}`;

	switch (error.code) {
	case 'EACCES':
		logger.log(`${bind} requires elevated privileges`);
		process.exit(1);
		break;
	case 'EADDRINUSE':
		logger.log(`${bind} is already in use`);
		process.exit(1);
		break;
	default:
		throw error;
	}
}

function onListening() {
	const addr = server.address();
	const bind = typeof addr === 'string'
		? `pipe ${addr}`
		: `port ${addr.port}`;

	logger.log(`the server started listening on port ${bind}`, 'info');
}

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);
