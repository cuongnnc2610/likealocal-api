/* eslint-disable max-len */
/* eslint-disable consistent-return */
const RequestHandler = require('./RequestHandler');
const Logger = require('./logger');

const logger = new Logger();
const code = require('./code');
const message = require('./message');

const requestHandler = new RequestHandler(logger);

function requireParams(params = []) {
	return function require(req, res, next) {
		const { method } = req;
		let paramsReceived;
		const missingParams = [];
		if (method === 'GET') {
			paramsReceived = req.query;
		} else {
			paramsReceived = req.body;
		}
		params.forEach((param) => {
			if (!Object.prototype.hasOwnProperty.call(paramsReceived, param)) missingParams.push(param);
			// else if (paramsReceived[param] === '' || paramsReceived[param] === null) missingParams.push(param);
			else if (paramsReceived[param] === null) missingParams.push(param);
		});
		if (missingParams.length > 0) {
			return requestHandler.sendFailure(
				res,
				code.MESSAGE_MISSING_REQUIRED_PARAMETERS,
				message.MESSAGE_MISSING_REQUIRED_PARAMETERS + missingParams,
			)();
		}
		next();
	};
}

async function validateEmail(req, res, next) {
	try {
		if (typeof req.body.email !== 'string') {
			return requestHandler.sendFailure(
				res,
				code.CODE_PARAM_NOT_CORRECT_FORMAT,
				`Email${message.MESSAGE_PARAM_NOT_CORRECT_FORMAT}`,
			)();
		}
		const regex = '^[a-z][a-z0-9_.]{0,32}@[a-z0-9]{2,}(.[a-z0-9]{2,4}){1,2}$';
		const { email } = req.body;
		const myEmail = email.match(regex);
		if (myEmail === null) {
			return requestHandler.sendFailure(
				res,
				code.CODE_PARAM_NOT_CORRECT_FORMAT,
				`Email${message.MESSAGE_PARAM_NOT_CORRECT_FORMAT}`,
			)();
		}
		next();
	} catch (error) {
		return requestHandler.sendFailure(
			res,
			40001,
			error.message,
		)();
	}
}

function validateString(params = []) {
	return function validate(req, res, next) {
		const { method } = req;
		let paramsReceived;
		if (method === 'GET') {
			paramsReceived = req.query;
		} else {
			paramsReceived = req.body;
		}
		for (let index = 0; index < params.length; index += 1) {
			if (paramsReceived[params[index]] !== undefined) {
				if (typeof paramsReceived[params[index]] !== 'string' && paramsReceived[params[index]] !== null) {
					return requestHandler.sendFailure(
						res,
						code.CODE_PARAM_NOT_CORRECT_FORMAT,
						params[index] + message.MESSAGE_PARAM_NOT_CORRECT_FORMAT,
					)();
				}
			}
		}
		next();
	};
}

function validateArray(params = []) {
	return function validate(req, res, next) {
		const { method } = req;
		let paramsReceived;
		if (method === 'GET') {
			paramsReceived = req.query;
		} else {
			paramsReceived = req.body;
		}
		for (let index = 0; index < params.length; index += 1) {
			if (paramsReceived[params[index]] !== undefined) {
				if (!Array.isArray(paramsReceived[params[index]]) && paramsReceived[params[index]] !== null) {
					return requestHandler.sendFailure(
						res,
						code.CODE_PARAM_NOT_CORRECT_FORMAT,
						params[index] + message.MESSAGE_PARAM_NOT_CORRECT_FORMAT,
					)();
				}
			}
		}
		next();
	};
}

function validatePositiveInteger(params = []) {
	return function validate(req, res, next) {
		const { method } = req;
		let paramsReceived;
		if (method === 'GET') {
			paramsReceived = req.query;
		} else {
			paramsReceived = req.body;
		}
		const regex = '^[0-9]+$';
		for (let index = 0; index < params.length; index += 1) {
			if (paramsReceived[params[index]] !== undefined) {
				if (method !== 'GET' && typeof paramsReceived[params[index]] !== 'number') {
					return requestHandler.sendFailure(
						res,
						code.CODE_PARAM_NOT_CORRECT_FORMAT,
						params[index] + message.MESSAGE_PARAM_NOT_CORRECT_FORMAT,
					)();
				}
				if (paramsReceived[params[index]] !== '' && paramsReceived[params[index]] !== null) {
					const isValid = paramsReceived[params[index]].toString().match(regex);
					if (isValid === null) {
						return requestHandler.sendFailure(
							res,
							code.CODE_PARAM_NOT_CORRECT_FORMAT,
							params[index] + message.MESSAGE_PARAM_NOT_CORRECT_FORMAT,
						)();
					}
					// if (Number(paramsReceived[params[index]]) === 0) {
					// 	return requestHandler.sendFailure(
					// 		res,
					// 		code.CODE_PARAM_CAN_NOT_ZERO,
					// 		params[index] + message.MESSAGE_PARAM_CAN_NOT_ZERO,
					// 	)();
					// }
				}
			}
		}
		next();
	};
}

function validatePositiveFloat(params = []) {
	return function validate(req, res, next) {
		const { method } = req;
		let paramsReceived;
		if (method === 'GET') {
			paramsReceived = req.query;
		} else {
			paramsReceived = req.body;
		}
		const regex = '^[0-9]+(.[0-9]+)?$';
		for (let index = 0; index < params.length; index += 1) {
			if (paramsReceived[params[index]] !== undefined) {
				if (method !== 'GET' && typeof paramsReceived[params[index]] !== 'number') {
					return requestHandler.sendFailure(
						res,
						code.CODE_PARAM_NOT_CORRECT_FORMAT,
						params[index] + message.MESSAGE_PARAM_NOT_CORRECT_FORMAT,
					)();
				}
				const isValid = paramsReceived[params[index]].toString().match(regex);
				if (isValid === null) {
					return requestHandler.sendFailure(
						res,
						code.CODE_PARAM_NOT_CORRECT_FORMAT,
						params[index] + message.MESSAGE_PARAM_NOT_CORRECT_FORMAT,
					)();
				}
				if (Number(paramsReceived[params[index]]) === 0) {
					return requestHandler.sendFailure(
						res,
						code.CODE_PARAM_CAN_NOT_ZERO,
						params[index] + message.MESSAGE_PARAM_CAN_NOT_ZERO,
					)();
				}
			}
		}
		next();
	};
}

function validateBoolean(params = []) {
	return function validate(req, res, next) {
		const { method } = req;
		let paramsReceived;
		if (method === 'GET') {
			paramsReceived = req.query;
		} else {
			paramsReceived = req.body;
		}
		for (let index = 0; index < params.length; index += 1) {
			if (paramsReceived[params[index]] !== undefined && paramsReceived[params[index]] !== '') {
				if (typeof paramsReceived[params[index]] !== 'boolean' && paramsReceived[params[index]] !== 'true' && paramsReceived[params[index]] !== 'false') {
					return requestHandler.sendFailure(
						res,
						code.CODE_PARAM_NOT_CORRECT_FORMAT,
						params[index] + message.MESSAGE_PARAM_NOT_CORRECT_FORMAT,
					)();
				}
			}
		}
		next();
	};
}

function validateDate(params = []) {
	return function validate(req, res, next) {
		const { method } = req;
		let paramsReceived;
		if (method === 'GET') {
			paramsReceived = req.query;
		} else {
			paramsReceived = req.body;
		}
		for (let index = 0; index < params.length; index += 1) {
			if (paramsReceived[params[index]] !== undefined) {
				const regex = '^\\d{4}\\-(0[1-9]|1[012])\\-(0[1-9]|[12][0-9]|3[01])$';
				const date = paramsReceived[params[index]].match(regex);
				if ((typeof paramsReceived[params[index]] !== 'string' && paramsReceived[params[index]] !== null) || date === null) {
					return requestHandler.sendFailure(
						res,
						code.CODE_PARAM_NOT_CORRECT_FORMAT,
						params[index] + message.MESSAGE_PARAM_NOT_CORRECT_FORMAT,
					)();
				}
			}
		}
		next();
	};
}

async function validateParamId(req, res, next) {
	try {
		const regex = '^[0-9]+$';
		const { id } = req.params;
		const idParam = id.match(regex);
		if (idParam === null) {
			return requestHandler.sendFailure(
				res,
				code.CODE_PARAM_NOT_CORRECT_FORMAT,
				`id${message.default.MESSAGE_PARAM_NOT_CORRECT_FORMAT}`,
			)();
		}
		next();
	} catch (error) {
		return requestHandler.sendFailure(
			res,
			40001,
			error.message,
		)();
	}
}

module.exports = {
	requireParams, validateEmail, validateString, validateArray, validateBoolean, validatePositiveInteger, validatePositiveFloat, validateDate, validateParamId,
};
