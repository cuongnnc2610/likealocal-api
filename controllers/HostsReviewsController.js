/* eslint-disable max-len */
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');
const auth = require('../utils/auth');
const RequestHandler = require('../utils/RequestHandler');
const Logger = require('../utils/logger');
const BaseController = require('./BaseController');
const models = require('../models');
const constants = require('../utils/constants');

const logger = new Logger();
const requestHandler = new RequestHandler(logger);

class HostsReviewsController extends BaseController {
	async getReviews(req, res) {
		try {
			let page = req.query.page ? Number(req.query.page) : 1;
			const limit = req.query.limit ? Number(req.query.limit) : 10;
			let startIndex = (page - 1) * limit;

			const condition = {};
			condition.is_deleted = false;
			if (req.query.host_id) {
				const host = await super.getByCustomOptions(req, 'User', {
					where: {
						user_id: req.query.host_id,
						level_id: constants.LEVEL_HOST,
						is_deleted: false,
					},
				});
				if (!host) {
					return requestHandler.sendFailure(res, 40002, 'Field host_id does not exist')();
				}
				condition.host_id = host.user_id;
			}
			if (req.query.content) {
				condition.content = { [Op.substring]: req.query.content };
			}
			if (!req.query.user) {
				req.query.user = '';
			}
			if (!req.query.host) {
				req.query.host = '';
			}

			const allHostsReviews = await super.getAllList(req, 'HostsReview', {
				where: condition,
				include: [{
					model: models.User,
					as: 'user',
					attributes: ['user_id', 'email', 'user_name', 'avatar'],
					required: true,
					where: {
						[Op.or]: [
							{ user_name: { [Op.substring]: req.query.user } },
							{ email: { [Op.substring]: req.query.user } },
						],
					},
				}, {
					model: models.User,
					as: 'host',
					attributes: ['user_id', 'email', 'user_name', 'avatar'],
					required: true,
					where: {
						[Op.or]: [
							{ user_name: { [Op.substring]: req.query.host } },
							{ email: { [Op.substring]: req.query.host } },
						],
					},
				}],
			});

			const totalPage = Math.ceil(allHostsReviews.length / limit);

			if (page > totalPage) {
				page = totalPage;
				startIndex = (page - 1) * limit;
			}

			let hostsReviews;
			const orderType = Number(req.query.order_type);
			switch (orderType) {
			case 1: // id DESC
				hostsReviews = allHostsReviews.sort((hostsReview1, hostsReview2) => hostsReview2.hosts_review_id - hostsReview1.hosts_review_id);
				break;
			case 2: // id ASC
				hostsReviews = allHostsReviews.sort((hostsReview1, hostsReview2) => hostsReview1.hosts_review_id - hostsReview2.hosts_review_id);
				break;
			case 3: // content DESC
				hostsReviews = allHostsReviews.sort((hostsReview1, hostsReview2) => hostsReview2.content.localeCompare(hostsReview1.content));
				break;
			case 4: // content ASC
				hostsReviews = allHostsReviews.sort((hostsReview1, hostsReview2) => hostsReview1.content.localeCompare(hostsReview2.content));
				break;
			case 5: // rating DESC
				hostsReviews = allHostsReviews.sort((hostsReview1, hostsReview2) => hostsReview2.rating - hostsReview1.rating);
				break;
			case 6: // rating ASC
				hostsReviews = allHostsReviews.sort((hostsReview1, hostsReview2) => hostsReview1.rating - hostsReview2.rating);
				break;
			default:
				hostsReviews = allHostsReviews;
			}

			const offset = startIndex > 0 ? startIndex : 0;
			hostsReviews = hostsReviews.slice(offset, offset + limit);

			const result = {
				total: allHostsReviews.length,
				per_page: limit,
				current_page: page,
				last_page: totalPage,
				from: startIndex + 1,
				to: startIndex + hostsReviews.length,
				data: hostsReviews,
			};

			return requestHandler.sendSuccess(res, 20001, 'Get data success')(result);
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}

	async createReview(req, res) {
		try {
			const tokenFromHeader = auth.getJwtToken(req);
			const account = jwt.decode(tokenFromHeader);

			// CHECK IF HOST_ID EXISTS
			const host = await super.getByCustomOptions(req, 'User', {
				where: {
					user_id: req.body.host_id,
					level_id: constants.LEVEL_HOST,
					is_deleted: false,
				},
			});

			if (!host) {
				return requestHandler.sendFailure(res, 40002, 'Field host_id does not exist')();
			}

			// CHECK IF USER HAS BOOKED ANY TOUR OF THE HOST
			const orders = await super.getAllList(req, 'Order', {
				where: {
					user_id: account.payload.user_id,
					is_deleted: false,
				},
				required: true,
				include: [{
					model: models.ToursHost,
					as: 'toursHost',
					where: {
						host_id: req.body.host_id,
					},
				}],
			});
			if (!orders.length) {
				return requestHandler.sendFailure(res, 40001, 'This user_id has not booked tour guided by this host_id')();
			}

			// VALIDATE RATING
			if (req.body.rating < 0 || req.body.rating > 5) {
				return requestHandler.sendFailure(res, 40002, 'Field rating min: 0, max: 5')();
			}

			const createdHostsReview = await super.create(req, 'HostsReview', {
				host_id: req.body.host_id,
				user_id: account.payload.user_id,
				rating: req.body.rating,
				content: req.body.content,
			});
			if (createdHostsReview) {
				return requestHandler.sendSuccess(res, 20001, 'Get success')(createdHostsReview);
			}
			return requestHandler.sendFailure(res, 40001, 'Unable to process the contained instructions')();
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}

	async deleteReview(req, res) {
		try {
			const tokenFromHeader = auth.getJwtToken(req);
			const account = jwt.decode(tokenFromHeader);

			// CHECK IF HOST_REVIEW_ID EXISTS
			const hostsReview = await super.getByCustomOptions(req, 'HostsReview', {
				where: {
					hosts_review_id: req.params.id,
					is_deleted: false,
				},
			});

			if (!hostsReview) {
				return requestHandler.sendFailure(res, 40002, 'Field host_review_id does not exist')();
			}

			// CHECK PERMISSION
			if (account.payload.level_id !== constants.LEVEL_ADMIN && account.payload.user_id !== hostsReview.user_id) {
				return requestHandler.sendFailure(res, 40001, 'No permission')();
			}

			hostsReview.is_deleted = true;
			if (hostsReview.save()) {
				return requestHandler.sendSuccess(res, 20001, 'Get success')(hostsReview);
			}
			return requestHandler.sendFailure(res, 40001, 'Unable to process the contained instructions')();
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}
}
module.exports = new HostsReviewsController();
