/* eslint-disable max-len */
const bcrypt = require('bcrypt');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const RequestHandler = require('../utils/RequestHandler');
const Logger = require('../utils/logger');
const BaseController = require('./BaseController');
const stringUtil = require('../utils/stringUtil');
const constants = require('../utils/constants');
const email = require('../utils/email');
const config = require('../config/app');
// const auth = require('../utils/auth');
// const models = require('../models');
const messagesSendResetCode = require('../assets/mail_template/messages/send_reset_code');
const messagesSendVerifyCode = require('../assets/mail_template/messages/send_verify_code');
const messagesVerifyResetCode = require('../assets/mail_template/messages/verify_reset_code');
const columnName = require('../utils/columnName');

const logger = new Logger();
const requestHandler = new RequestHandler(logger);
const tokenList = {};

class AuthController extends BaseController {
	async loginUser(req, res) {
		try {
			const options = {
				where: {
					email: req.body.email,
					level_id: { [Op.in]: [constants.LEVEL_USER, constants.LEVEL_HOST] },
					is_verified: true,
					is_deleted: false,
				},
			};

			const user = await super.getByCustomOptions(req, 'User', options);
			if (!user) {
				return requestHandler.sendFailure(res, 40101, 'Email does not exist')();
			}

			let isCorrect = false;
			await bcrypt
				.compare(req.body.password, user.password)
				.then((result) => {
					isCorrect = result;
				});

			if (!isCorrect) {
				return requestHandler.sendFailure(res, 40102, 'Incorrect password')();
			}

			const payload = _.omit(user.dataValues, ['introduction_video', 'self_introduction', 'city_id', 'is_verified', 'password', 'one_time_password', 'one_time_password_period', 'request_status', 'is_deleted', 'createdAt', 'updatedAt']);

			const token = jwt.sign({ payload }, config.auth.jwt_secret, {
				expiresIn: config.auth.jwt_expires_in,
				algorithm: 'HS512',
			});

			const refreshToken = jwt.sign(
				{ payload },
				config.auth.refresh_token_secret,
				{
					expiresIn: config.auth.refresh_token_expires_in,
					algorithm: 'HS512',
				},
			);

			const dataResponse = {
				token,
				refreshToken,
			};
			tokenList[refreshToken] = dataResponse;
			return requestHandler.sendSuccess(res, 20001, 'User logged in Successfully')(dataResponse);
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}

	async loginAdmin(req, res) {
		try {
			const options = {
				where: {
					email: req.body.email,
					level_id: constants.LEVEL_ADMIN,
					is_verified: true,
					is_deleted: false,
				},
			};

			const user = await super.getByCustomOptions(req, 'User', options);
			if (!user) {
				return requestHandler.sendFailure(res, 40101, 'Email does not exist')();
			}

			let isCorrect = false;
			await bcrypt
				.compare(req.body.password, user.password)
				.then((result) => {
					isCorrect = result;
				});

			if (!isCorrect) {
				return requestHandler.sendFailure(res, 40102, 'Incorrect password')();
			}

			const payload = _.omit(user.dataValues, ['introduction_video', 'self_introduction', 'city_id', 'phone_number', 'is_verified', 'password', 'one_time_password', 'one_time_password_period', 'request_status', 'balance', 'is_deleted', 'createdAt', 'updatedAt']);

			const token = jwt.sign({ payload }, config.auth.jwt_secret, {
				expiresIn: config.auth.jwt_expires_in,
				algorithm: 'HS512',
			});

			const refreshToken = jwt.sign(
				{ payload },
				config.auth.refresh_token_secret,
				{
					expiresIn: config.auth.refresh_token_expires_in,
					algorithm: 'HS512',
				},
			);

			const dataResponse = {
				token,
				refreshToken,
			};
			tokenList[refreshToken] = dataResponse;
			return requestHandler.sendSuccess(res, 20001, 'User logged in Successfully')(dataResponse);
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}

	async signUp(req, res) {
		try {
			const data = req.body;

			// CHECK IF EMAIL EXISTS
			const user = await super.getByCustomOptions(req, 'User', {
				where: {
					email: data.email.trim(),
					is_deleted: false,
				},
			});
			if (user && user.is_verified) {
				return requestHandler.sendFailure(res, 40204, 'Account existed')();
			}

			// HASH PASSWORD
			data.password = bcrypt.hashSync(data.password, config.auth.saltRounds);

			// GET DEFAULT AVATAR
			const systemSettingAvatar = await super.getByCustomOptions(req, 'SystemSetting', {
				where: {
					name: columnName.DEFAULT_USER_AVATAR,
					is_deleted: false,
				},
			});
			data.avatar = systemSettingAvatar.value;

			const dataCreateUser = {
				email: data.email,
				user_name: data.user_name,
				level_id: constants.LEVEL_USER,
				is_verified: false,
				password: data.password,
				avatar: data.avatar,
				is_deleted: false,
			};

			let newUser = null;

			if (user) {
				if (user.is_verified === false) {
					newUser = await super.updateByCustomWhere(req, 'User', dataCreateUser, {
						where: {
							email: data.email,
							is_verified: false,
							is_deleted: false,
						},
					});
					if (!newUser) {
						return requestHandler.sendFailure(res, 40001, 'Unable to process the contained instructions')();
					}
				}
			} else {
				newUser = await super.create(req, 'User', dataCreateUser);
				if (!newUser) {
					return requestHandler.sendFailure(res, 40001, 'Unable to process the contained instructions')();
				}
			}

			if (!_.isNull(newUser)) {
				const randomString = stringUtil.generateNumber();
				const replacements = messagesSendVerifyCode.en;
				replacements.randomString = randomString;

				const dataUpdate = {
					one_time_password: randomString,
					one_time_password_period: new Date(),
				};
				const updateUser = await super.updateByCustomWhere(req, 'User', dataUpdate, {
					where: {
						email: data.email,
						is_deleted: false,
					},
				});
				if (!_.isNull(updateUser)) {
					email.sendMail(
						data.email,
						replacements.title,
						replacements.content + randomString,
					);
					logger.log(`An email has been sent at: ${new Date()} to : ${data.user_id} with the following results success`, 'info');
					return requestHandler.sendSuccess(res, 20001, 'Email with your OTP sent successfully')();
				}
			}
			return requestHandler.sendFailure(res, 40001, 'Unable to process the contained instructions')();
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}

	async resendVerifyCode(req, res) {
		try {
			const data = stringUtil.trimObject(req.body);
			const user = await super.getByCustomOptions(req, 'User', {
				where: {
					email: data.email,
					is_verified: false,
					is_deleted: false,
				},
			});

			if (user) {
				const randomString = stringUtil.generateNumber();
				const replacements = messagesSendVerifyCode.en;
				replacements.randomString = randomString;
				const dataUpdate = {
					one_time_password: randomString,
					one_time_password_period: new Date(),
				};

				const updatedUser = await super.updateByCustomWhere(req, 'User', dataUpdate, {
					where: {
						email: data.email,
						is_verified: false,
						is_deleted: false,
					},
				});
				if (!_.isNull(updatedUser)) {
					email.sendMail(
						data.email,
						replacements.title,
						replacements.content + randomString,
					);
					logger.log(`An email has been sent at: ${new Date()} to : ${data.user_id} with the following results success`, 'info');
					return requestHandler.sendSuccess(res, 20001, 'Email with your OTP sent successfully')();
				}
				return requestHandler.sendFailure(res, 40001, 'Unable to process the contained instructions')();
			}
			return requestHandler.sendFailure(res, 42601, 'Account does not exist')();
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}

	async sendResetCode(req, res) {
		try {
			const data = stringUtil.trimObject(req.body);
			const user = await super.getByCustomOptions(req, 'User', {
				where: {
					email: data.email,
					is_verified: true,
					is_deleted: false,
				},
			});
			if (!user) {
				return requestHandler.sendFailure(res, 42401, 'Account does not exist')();
			}

			const randomString = stringUtil.generateNumber();
			const replacements = messagesSendResetCode.en;
			replacements.randomString = randomString;

			user.one_time_password = randomString;
			user.one_time_password_period = new Date();
			if (user.save()) {
				email.sendMail(
					data.email,
					replacements.title,
					replacements.content + randomString,
				);
				logger.log(`An email has been sent at: ${new Date()} to : ${data.user_id} with the following results success`, 'info');
				return requestHandler.sendSuccess(res, 20001, 'Email with your OTP sent successfully')();
			}
			return requestHandler.sendFailure(res, 40001, 'Unable to process the contained instructions')();
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}

	async verifyResetCode(req, res) {
		try {
			const data = stringUtil.trimObject(req.body);
			const user = await super.getByCustomOptions(req, 'User', {
				where: {
					email: data.email,
					is_verified: true,
					is_deleted: false,
				},
			});
			if (!user) {
				return requestHandler.sendFailure(res, 42401, 'Account does not exist')();
			}

			if (user.one_time_password !== data.one_time_password) {
				return requestHandler.sendFailure(res, 42301, 'Incorrect OTP')();
			}

			const currentTime = new Date().getTime();
			const resetTime = stringUtil.timeDBToTimestampUTC(user.ONETIME_PASSWORD_PERIOD);

			if ((currentTime - resetTime) / 1000 > constants.SECOND_LIMIT_RESET_CODE) {
				return requestHandler.sendFailure(res, 42302, 'OTP was expired')();
			}

			const randomString = `${stringUtil.generateString()}vN@2`;

			const replacements = messagesVerifyResetCode.en;
			replacements.randomString = randomString;
			const dataUpdate = {
				one_time_password: null,
				one_time_password_period: null,
				password: bcrypt.hashSync(randomString, config.auth.saltRounds),
			};

			const updatedUser = await super.updateByCustomWhere(req, 'User', dataUpdate, {
				where: {
					email: data.email,
					is_deleted: false,
				},
			});
			if (!_.isNull(updatedUser)) {
				email.sendMail(
					data.email,
					replacements.title,
					replacements.content + randomString,
				);
				logger.log(`An email has been sent at: ${new Date()} to : ${data.user_id} with the following results success`, 'info');
				return requestHandler.sendSuccess(res, 20001, 'Email with your OTP sent successfully')();
			}
			return requestHandler.sendFailure(res, 40001, 'Unable to process the contained instructions')();
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}

	async verifyEmail(req, res) {
		try {
			const data = stringUtil.trimObject(req.body);
			const user = await super.getByCustomOptions(req, 'User', {
				where: {
					email: data.email,
					is_verified: false,
					is_deleted: false,
				},
			});
			if (!user) {
				return requestHandler.sendFailure(res, 42501, 'Account does not exist')();
			}

			if (user.one_time_password !== data.one_time_password) {
				return requestHandler.sendFailure(res, 42505, 'Incorrect OTP')();
			}

			const currentTime = new Date().getTime();
			const verifyTime = stringUtil.timeDBToTimestampUTC(user.one_time_password_period);

			if ((currentTime - verifyTime) / 1000 > constants.SECOND_LIMIT_VERIFY_CODE) {
				return requestHandler.sendFailure(res, 42506, 'OTP was expired')();
			}

			user.one_time_password = null;
			user.one_time_password_period = null;
			user.is_verified = true;
			if (user.save()) {
				const payload = _.omit(user.dataValues, ['password', 'one_time_password', 'one_time_password_period', 'is_deleted', 'createdAt', 'updatedAt']);

				const token = jwt.sign({ payload }, config.auth.jwt_secret, {
					expiresIn: config.auth.jwt_expires_in,
					algorithm: 'HS512',
				});

				const refreshToken = jwt.sign(
					{ payload },
					config.auth.refresh_token_secret,
					{
						expiresIn: config.auth.refresh_token_expires_in,
						algorithm: 'HS512',
					},
				);

				const dataResponse = {
					token,
					refreshToken,
				};
				tokenList[refreshToken] = dataResponse;
				return requestHandler.sendSuccess(res, 20001, 'User logged in Successfully')(dataResponse);
			}
			return requestHandler.sendFailure(res, 40001, 'Unable to process the contained instructions')();
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}

	// eslint-disable-next-line class-methods-use-this
	async refreshToken(req, res) {
		try {
			const data = req.body;
			jwt.verify(
				data.refreshToken,
				config.auth.refresh_token_secret,
				(err, decoded) => {
					if (err) {
						requestHandler.sendFailure(res, 40001, 'Please provide a valid token, your token might be expired', 401)();
					}
					req.decoded = decoded;
				},
			);

			const account = req.decoded;

			if (data.refreshToken && data.refreshToken in tokenList) {
				const token = jwt.sign({ account }, config.auth.jwt_secret, {
					expiresIn: config.auth.jwt_expires_in,
					algorithm: 'HS512',
				});
				const response = {
					token,
				};
				// update the token in the list
				tokenList[data.refreshToken].token = token;
				return requestHandler.sendSuccess(res, 20001, 'A new token is issued')(response);
			}
			return requestHandler.sendFailure(res, 40001, 'Please provide a valid token, your token might be expired', 401)();
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}
}

module.exports = new AuthController();
