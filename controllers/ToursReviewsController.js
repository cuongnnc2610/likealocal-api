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

class ToursReviewsController extends BaseController {
	async getReviews(req, res) {
		try {
			const orderIds = [];
			if (req.query.tour_id) {
				const tour = await super.getByCustomOptions(req, 'Tour', {
					where: {
						tour_id: req.query.tour_id,
						is_deleted: false,
					},
					include: [{
						model: models.ToursHost,
						as: 'toursHosts',
						required: false,
						where: {
							is_deleted: false,
						},
						include: [{
							model: models.Order,
							as: 'orders',
							required: false,
							where: {
								is_deleted: false,
							},
						}],
					}],
				});
				if (!tour) {
					return requestHandler.sendFailure(res, 40002, 'Field tour_id does not exist')();
				}

				for (let indexToursHost = 0; indexToursHost < tour.toursHosts.length; indexToursHost += 1) {
					for (let indexOrder = 0; indexOrder < tour.toursHosts[indexToursHost].orders.length; indexOrder += 1) {
						orderIds.push(tour.toursHosts[indexToursHost].orders[indexOrder].order_id);
					}
				}
			}

			let page = req.query.page ? Number(req.query.page) : 1;
			const limit = req.query.limit ? Number(req.query.limit) : 10;
			let startIndex = (page - 1) * limit;
			const condition = {};
			condition.is_deleted = false;
			if (req.query.tour_id) {
				condition.order_id = { [Op.in]: orderIds };
			}
			if (req.query.content) {
				condition.content = { [Op.substring]: req.query.content };
			}
			if (req.query.date) {
				condition.createdAt = {
					[Op.gte]: new Date(`${req.query.date}T00:00:00.000+00:00`),
					[Op.lte]: new Date(`${req.query.date}T23:59:59.000+00:00`),
				};
			}
			if (!req.query.user) {
				req.query.user = '';
			}
			if (!req.query.host) {
				req.query.host = '';
			}
			if (!req.query.tour_name) {
				req.query.tour_name = '';
			}

			const allToursReviews = await super.getAllList(req, 'ToursReview', {
				where: condition,
				include: [{
					model: models.Order,
					as: 'order',
					required: true,
					include: [{
						model: models.ToursHost,
						as: 'toursHost',
						required: true,
						include: [{
							model: models.Tour,
							as: 'tour',
							where: {
								name: { [Op.substring]: req.query.tour_name },
								is_deleted: false,
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
					}, {
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
					}],
				}],
			});

			const totalPage = Math.ceil(allToursReviews.length / limit);

			if (page > totalPage) {
				page = totalPage;
				startIndex = (page - 1) * limit;
			}

			let toursReviews;
			const orderType = Number(req.query.order_type);
			switch (orderType) {
			case 1: // id DESC
				toursReviews = allToursReviews.sort((toursReview1, toursReview2) => toursReview2.hosts_review_id - toursReview1.hosts_review_id);
				break;
			case 2: // id ASC
				toursReviews = allToursReviews.sort((toursReview1, toursReview2) => toursReview1.hosts_review_id - toursReview2.hosts_review_id);
				break;
			case 3: // content DESC
				toursReviews = allToursReviews.sort((toursReview1, toursReview2) => toursReview2.content.localeCompare(toursReview1.content));
				break;
			case 4: // content ASC
				toursReviews = allToursReviews.sort((toursReview1, toursReview2) => toursReview1.content.localeCompare(toursReview2.content));
				break;
			case 5: // rating DESC
				toursReviews = allToursReviews.sort((toursReview1, toursReview2) => toursReview2.rating - toursReview1.rating);
				break;
			case 6: // rating ASC
				toursReviews = allToursReviews.sort((toursReview1, toursReview2) => toursReview1.rating - toursReview2.rating);
				break;
			default:
				toursReviews = allToursReviews;
			}

			const offset = startIndex > 0 ? startIndex : 0;
			toursReviews = toursReviews.slice(offset, offset + limit);

			const result = {
				total: allToursReviews.length,
				per_page: limit,
				current_page: page,
				last_page: totalPage,
				from: startIndex + 1,
				to: startIndex + toursReviews.length,
				data: toursReviews,
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

			// CHECK IF TOUR_ID EXISTS
			const tour = await super.getByCustomOptions(req, 'Tour', {
				where: {
					tour_id: req.body.tour_id,
					is_deleted: false,
				},
			});
			if (!tour) {
				return requestHandler.sendFailure(res, 40002, 'Field tour_id does not exist')();
			}

			// CHECK IF USER HAS BOOKED THIS TOUR_ID
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
						tour_id: req.body.tour_id,
					},
				}],
			});
			if (!orders.length) {
				return requestHandler.sendFailure(res, 40004, 'This user_id has not booked this tour_id')();
			}

			// VALIDATE RATING
			if (req.body.rating < 0 || req.body.rating > 5) {
				return requestHandler.sendFailure(res, 40002, 'Field rating min: 0, max: 5')();
			}

			const createdToursReview = await super.create(req, 'ToursReview', {
				order_id: orders[orders.length - 1].order_id,
				rating: req.body.rating,
				content: req.body.content,
			});
			if (createdToursReview) {
				return requestHandler.sendSuccess(res, 20001, 'Get success')(createdToursReview);
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

			// CHECK IF TOURS_REVIEW_ID EXISTS
			const toursReview = await super.getByCustomOptions(req, 'ToursReview', {
				where: {
					tours_review_id: req.params.id,
					is_deleted: false,
				},
				include: [{
					model: models.Order,
					as: 'order',
					include: [{
						model: models.User,
						as: 'user',
					}],
				}],
			});

			if (!toursReview) {
				return requestHandler.sendFailure(res, 40002, 'Field tours_review_id does not exist')();
			}

			// CHECK PERMISSION
			if (account.payload.level_id !== constants.LEVEL_ADMIN && account.payload.user_id !== toursReview.order.user.user_id) {
				return requestHandler.sendFailure(res, 40001, 'No permission')();
			}

			toursReview.is_deleted = true;
			if (toursReview.save()) {
				return requestHandler.sendSuccess(res, 20001, 'Get success')(toursReview);
			}
			return requestHandler.sendFailure(res, 40001, 'Unable to process the contained instructions')();
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}
}
module.exports = new ToursReviewsController();
