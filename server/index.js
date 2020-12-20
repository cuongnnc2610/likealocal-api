const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const compression = require('compression');
const uuid = require('uuid');
const config = require('../config/app');
const Logger = require('../utils/logger.js');
const TransactionsController = require('../controllers/TransactionsController');

const logger = new Logger();
const app = express();
app.set('config', config);
app.use(bodyParser.json());
app.use(require('method-override')());

app.use(compression());
app.use(cors());
const swagger = require('../utils/swagger');


process.on('SIGINT', () => {
	logger.log('Stopping the server', 'info');
	process.exit();
});

app.set('db', require('../models/index.js'));

app.set('port', process.env.DEV_APP_PORT);
app.use('/api/docs', swagger.router);

app.use((req, res, next) => {
	req.identifier = uuid.v1();
	const logString = `A request has been made with the following uuid [${req.identifier}] ${req.url} ${req.headers['user-agent']} ${JSON.stringify(req.body)}`;
	logger.log(logString, 'info');
	next();
});

app.use(require('../router'));

app.use((req, res, next) => {
	logger.log('The url you are trying to reach is not hosted on our server', 'error');
	const err = new Error('Not Found');
	err.status = 404;
	res.status(err.status).json({
		status: 'failure',
		code: 40001,
		message: 'Url not found',
	});
	next(err);
});
module.exports = app;
