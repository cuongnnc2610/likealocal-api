/* eslint-disable max-len */
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const config = require('../config/app');
const RequestHandler = require('./RequestHandler');
const Logger = require('./logger');
const constants = require('./constants');
const BaseController = require('../controllers/BaseController');

const logger = new Logger();
const requestHandler = new RequestHandler(logger);
function getTokenFromHeader(req) {
	if ((req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Token')
		|| (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer')) {
		return req.headers.authorization.split(' ')[1];
	}
	return null;
}

function getLanguageFromHeader(req) {
	try {
		if (constants.LIST_LANGUAGE_SUPPORT.indexOf(req.headers.language) > -1) {
			return req.headers.language;
		}
		return 'en';
	} catch (e) {
		return 'en';
	}
}

function getTimezoneOffsetFromHeader(req) {
	if (req.headers.timezone_offset) {
		return req.headers.timezone_offset;
	}
	// default 0h
	return 0;
}

function isAuthenticated(req, res, next) {
	try {
		if (_.isUndefined(req.headers.authorization)) {
			requestHandler.throwError(401, 'Not Authorized to access this resource!')();
		}
		const Bearer = req.headers.authorization.split(' ')[0];

		if (!Bearer || Bearer !== 'Bearer') {
			requestHandler.throwError(401, 'Not Authorized to access this resource!')();
		}

		const token = req.headers.authorization.split(' ')[1];

		if (!token) {
			requestHandler.throwError(401, 'Not Authorized to access this resource!')();
		}

		jwt.verify(token, config.auth.jwt_secret, (err, decoded) => {
			if (err) {
				requestHandler.throwError(401, 'Please provide a valid token, your token might be expired')();
			}
			req.decoded = decoded;
			next();
		});
	} catch (error) {
		requestHandler.sendFailure(res, 40001, error.message)();
	}
}

function isAdmin(req, res, next) {
	try {
		const tokenFromHeader = getTokenFromHeader(req);
		const account = jwt.decode(tokenFromHeader);
		if (account.payload.level_id === 1) {
			next();
		} else {
			requestHandler.throwError(401, 'No permission')();
		}
	} catch (error) {
		requestHandler.sendFailure(res, 40001, error.message)();
	}
}

function isUser(req, res, next) {
	try {
		const tokenFromHeader = getTokenFromHeader(req);
		const account = jwt.decode(tokenFromHeader);
		if (account.payload.level_id === 2) {
			next();
		} else {
			requestHandler.throwError(401, 'No permission')();
		}
	} catch (error) {
		requestHandler.sendFailure(res, 40001, error.message)();
	}
}

function isHost(req, res, next) {
	try {
		const tokenFromHeader = getTokenFromHeader(req);
		const account = jwt.decode(tokenFromHeader);
		if (account.payload.level_id === 3) {
			next();
		} else {
			requestHandler.throwError(401, 'No permission')();
		}
	} catch (error) {
		requestHandler.sendFailure(res, 40001, error.message)();
	}
}

function getAccountFromToken(req, res) {
	try {
		const tokenFromHeader = getTokenFromHeader(req);
		const account = jwt.decode(tokenFromHeader);
		return account.payload;
	} catch (error) {
		return requestHandler.sendFailure(res, 40001, error.message)();
	}
}

async function getUserLanguageCode(req, res) {
	try {
		const account = getAccountFromToken(req, res);
		const userManagement = await new BaseController().getByCustomOptions(req, 'UserManagement', {
			where: {
				USER_MANAGEMENT_ID: account.USER_MANAGEMENT_ID,
				DELETED: false,
			},
		});
		return userManagement.LANG_CODE;
	} catch (error) {
		return requestHandler.sendFailure(res, 40001, error.message)();
	}
}

// eslint-disable-next-line max-len
module.exports = {
	// eslint-disable-next-line max-len
	getJwtToken: getTokenFromHeader, isAuthenticated, isAdmin, isUser, isHost, getLanguage: getLanguageFromHeader, getTimezoneOffset: getTimezoneOffsetFromHeader, getUserLanguageCode,
};
