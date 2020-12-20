const _ = require('lodash');

class RequestHandler {
	constructor(logger) {
		this.logger = logger;
	}

	throwIf(fn, statusCode, errorMessage) {
		return (result) => (fn(result) ? this.throwError(statusCode, errorMessage)() : result);
	}

	// eslint-disable-next-line class-methods-use-this
	throwError(statusCode, errorMessage) {
		return (e) => {
			if (!e) e = new Error(errorMessage || 'Default Error');
			e.status = statusCode;
			e.code = 40000;
			e.message = errorMessage;
			throw e;
		};
	}

	validateJoi(res, err) {
		if (err) { this.logger.log(`error in validating request : ${err.message}`, 'warn'); }
		if (!_.isNull(err)) {
			const code = err.details[0].message.code || 'code invalid';
			const message = err.details[0].message.message || 'param invalid';
			return this.sendFailure(res, code, message)();
		}
		return this.sendFailure(res, 40001, 'Bad request')();
	}

	sendSuccess(res, messageCode, message, statusCode) {
		this.logger.log(`a request has been made and proccessed successfully at: ${new Date()}`, 'info');
		return (data, globalData) => {
			if (_.isUndefined(statusCode)) {
				statusCode = 200;
			}

			const response = {
				status: 'success',
				code: messageCode,
				// message: message || 'Success result',
				message: messageCode === 20001 ? 'Success' : 'No result',
				data,
				...globalData,
			};
			if (data != null) {
				response.data = data;
			}
			res.status(statusCode).json(response);
		};
	}

	sendFailure(res, messageCode, message, statusCode) {
		this.logger.log(`a request has been made and proccessed successfully at: ${new Date()}`, 'info');
		return (data, globalData) => {
			if (_.isUndefined(statusCode)) {
				statusCode = 200;
			}

			const response = {
				status: 'failure',
				code: messageCode,
				message: message || 'Failure',
				...globalData,
			};
			if (data != null) {
				response.data = data;
			}
			res.status(statusCode).json(response);
		};
	}
}
module.exports = RequestHandler;
