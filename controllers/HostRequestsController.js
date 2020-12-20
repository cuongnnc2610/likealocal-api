/* eslint-disable max-len */
// const jwt = require('jsonwebtoken');
const _ = require('lodash');
const { Op } = require('sequelize');
const BaseController = require('./BaseController');
const RequestHandler = require('../utils/RequestHandler');
// const stringUtil = require('../utils/stringUtil');
const Logger = require('../utils/logger');
// const auth = require('../utils/auth');
const models = require('../models');
const constants = require('../utils/constants');

const logger = new Logger();
const requestHandler = new RequestHandler(logger);

class HostRequestsController extends BaseController {
	async getHostRequests(req, res) {
		try {
			let page = req.query.page ? Number(req.query.page) : 1;
			const limit = req.query.limit ? Number(req.query.limit) : 10;
			let startIndex = (page - 1) * limit;
			const condition = {};
			condition.is_deleted = false;
			condition.request_status = { [Op.in]: [constants.HOST_REQUEST_PENDING, constants.HOST_REQUEST_REJECTED] };
			if (req.query.email) {
				condition.email = { [Op.substring]: req.query.email };
			}
			if (req.query.user_name) {
				condition.user_name = { [Op.substring]: req.query.user_name };
			}
			if (req.query.country_id && !req.query.city_id) {
				const cities = await super.getAllList(req, 'City', {
					where: {
						country_id: Number(req.query.country_id),
						is_deleted: false,
					},
				});
				const cityIds = [];
				for (let index = 0; index < cities.length; index += 1) {
					cityIds.push(cities[index].city_id);
				}
				condition.city_id = { [Op.in]: cityIds };
			}
			if (req.query.city_id) {
				condition.city_id = Number(req.query.city_id);
			}
			if (req.query.request_status) {
				condition.request_status = req.query.request_status;
			}
			if (req.query.updated_at) {
				condition.updatedAt = {
					[Op.gte]: new Date(`${req.query.updated_at}T00:00:00.000+00:00`),
					[Op.lte]: new Date(`${req.query.updated_at}T23:59:59.000+00:00`),
				};
			}

			const allUsers = await super.getAllList(req, 'User', {
				where: condition,
				include: [{
					model: models.Level,
					as: 'level',
				}, {
					model: models.City,
					as: 'city',
					include: [{
						model: models.Country,
						as: 'country',
					}],
				}, {
					model: models.UsersLanguage,
					as: 'usersLanguages',
					required: false,
					where: {
						is_deleted: false,
					},
					include: [{
						model: models.Language,
						as: 'language',
					}],
				}],
			});

			allUsers.forEach((user) => {
				user.dataValues = _.omit(user.dataValues, ['password', 'one_time_password', 'one_time_password_period', 'is_deleted']);
			});

			const totalPage = Math.ceil(allUsers.length / limit);

			if (page > totalPage) {
				page = totalPage;
				startIndex = (page - 1) * limit;
			}

			let users;
			const orderType = Number(req.query.order_type);
			switch (orderType) {
			case 1: // request_status DESC
				users = allUsers.sort((user1, user2) => user2.request_status - user1.request_status || user1.updatedAt.getTime() - user2.updatedAt.getTime());
				break;
			case 2: // request_status ASC
				users = allUsers.sort((user1, user2) => user1.request_status - user2.request_status || user2.updatedAt.getTime() - user1.updatedAt.getTime());
				break;
			case 3: // user_name DESC
				users = allUsers.sort((user1, user2) => user2.user_name.localeCompare(user1.user_name));
				break;
			case 4: // user_name ASC
				users = allUsers.sort((user1, user2) => user1.user_name.localeCompare(user2.user_name));
				break;
			case 5: // email DESC
				users = allUsers.sort((user1, user2) => user2.email.localeCompare(user1.email));
				break;
			case 6: // email ASC
				users = allUsers.sort((user1, user2) => user1.email.localeCompare(user2.email));
				break;
			case 7: // updated_at DESC
				users = allUsers.sort((user1, user2) => user2.updatedAt.getTime() - user1.updatedAt.getTime());
				break;
			case 8: // updated_at ASC
				users = allUsers.sort((user1, user2) => user1.updatedAt.getTime() - user2.updatedAt.getTime());
				break;
			default:
				users = allUsers;
			}

			const offset = startIndex > 0 ? startIndex : 0;
			users = users.slice(offset, offset + limit);

			const result = {
				total: allUsers.length,
				per_page: limit,
				current_page: page,
				last_page: totalPage,
				from: startIndex + 1,
				to: startIndex + users.length,
				data: users,
			};

			return requestHandler.sendSuccess(res, 20001, 'Get data success')(result);
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}

	async approveOrRejectHostRequest(req, res) {
		try {
			const user = await super.getByCustomOptions(req, 'User', {
				where: {
					user_id: req.params.id,
					is_deleted: false,
				},
			});
			if (!user) {
				return requestHandler.sendFailure(res, 40505, 'Account does not exist')();
			}

			// CHECK IF USER IS NORMAL USER
			if (user.level_id !== constants.LEVEL_USER) {
				return requestHandler.sendFailure(res, 40002, 'User is not normal user')();
			}

			// UPDATE
			user.request_status = req.body.request_status;
			if (req.body.request_status === constants.HOST_REQUEST_NONE) {
				user.level_id = constants.LEVEL_HOST;
			}
			if (user.save()) {
				return requestHandler.sendSuccess(res, 20001, 'Success')();
			}
			return requestHandler.sendFailure(res, 40001, 'Unable to process the contained instructions')();
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}
}
module.exports = new HostRequestsController();
