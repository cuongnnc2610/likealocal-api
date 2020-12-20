/* eslint-disable max-len */
const jwt = require('jsonwebtoken');
const auth = require('../utils/auth');
const RequestHandler = require('../utils/RequestHandler');
const Logger = require('../utils/logger');
const BaseController = require('./BaseController');
const models = require('../models');
const constants = require('../utils/constants');

const logger = new Logger();
const requestHandler = new RequestHandler(logger);

class ToursHostsController extends BaseController {
	async getAllToursHostsByTour(req, res) {
		try {
			// CHECK IF TOUR_ID EXISTS
			const tour = await super.getByCustomOptions(req, 'Tour', {
				where: {
					tour_id: req.query.tour_id,
					is_deleted: false,
				},
			});
			if (!tour) {
				return requestHandler.sendFailure(res, 40002, 'Field tour_id does not exist')();
			}

			// CHECK PERMISSION
			const tokenFromHeader = auth.getJwtToken(req);
			const account = jwt.decode(tokenFromHeader);
			if (tour.host_id !== account.payload.user_id) {
				return requestHandler.sendFailure(res, 40001, 'No permission')();
			}

			const toursHosts = await super.getAllList(req, 'ToursHost', {
				where: {
					tour_id: req.query.tour_id,
					is_deleted: false,
				},
				include: [{
					model: models.User,
					as: 'host',
					attributes: ['user_id', 'email', 'user_name', 'level_id', 'is_tour_guide', 'avatar', 'introduction_video', 'city_id', 'phone_number'],
					include: [{
						model: models.City,
						as: 'city',
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
				}],
			});
			if (!toursHosts.length) {
				return requestHandler.sendSuccess(res, 20002, 'No result')();
			}
			for (let indexHost = 0; indexHost < toursHosts.length; indexHost += 1) {
				toursHosts[indexHost].host.dataValues.languages = [];
				for (let indexLanguage = 0; indexLanguage < toursHosts[indexHost].host.usersLanguages.length; indexLanguage += 1) {
					toursHosts[indexHost].host.dataValues.languages.push(toursHosts[indexHost].host.usersLanguages[indexLanguage].language.name);
				}
			}
			return requestHandler.sendSuccess(res, 20001, 'Success')(toursHosts);
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}

	async requestGuideTour(req, res) {
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

			const toursHost = await super.getByCustomOptions(req, 'ToursHost', {
				where: {
					tour_id: req.body.tour_id,
					host_id: account.payload.user_id,
					is_deleted: false,
				},
			});
			if (toursHost) {
				// CASE HAS RECORD OF TOURS_HOST AND DO NOT WANT TO GUIDE
				toursHost.is_deleted = true;
				if (toursHost.save()) {
					return requestHandler.sendSuccess(res, 20001, 'Success')(toursHost);
				}
				return requestHandler.sendFailure(res, 40001, 'Unable to process the contained instructions')();
			}

			// CASE NO RECORD OF TOURS_HOST AND WANT TO GUIDE
			const createdToursHost = await super.create(req, 'ToursHost', {
				tour_id: req.body.tour_id,
				host_id: account.payload.user_id,
				is_agreed: false,
			});
			if (createdToursHost) {
				const createdToursSchedule = await super.create(req, 'ToursSchedule', {
					tours_host_id: createdToursHost.tours_host_id,
					included_datetimes: null,
					excluded_datetimes: null,
					everyweek_recurring_days: null,
					everyday_recurring_hours: null,
					recurring_unit: null,
					is_recurring: false,
					is_blocked: false,
				});
				if (createdToursSchedule) {
					return requestHandler.sendSuccess(res, 20001, 'Success')(createdToursHost);
				}
				return requestHandler.sendFailure(res, 40001, 'Unable to process the contained instructions')();
			}
			return requestHandler.sendFailure(res, 40001, 'Unable to process the contained instructions')();
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}

	async updateAgreeStatusOfToursHost(req, res) {
		try {
			// CHECK IF TOURS_HOST EXISTS
			const toursHost = await super.getByCustomOptions(req, 'ToursHost', {
				where: {
					tours_host_id: req.params.id,
					is_deleted: false,
				},
				include: [{
					model: models.Tour,
					as: 'tour',
				}],
			});
			if (!toursHost) {
				return requestHandler.sendFailure(res, 40002, 'Tours host does not exist')();
			}

			// CHECK PERMISSION
			const tokenFromHeader = auth.getJwtToken(req);
			const account = jwt.decode(tokenFromHeader);
			if (account.payload.user_id !== toursHost.tour.host_id) {
				return requestHandler.sendFailure(res, 40001, 'No permission')();
			}

			// UPDATE AGREE STATUS
			toursHost.is_agreed = !toursHost.is_agreed;
			if (toursHost.save()) {
				return requestHandler.sendSuccess(res, 20001, 'Success')(toursHost);
			}
			return requestHandler.sendFailure(res, 40001, 'Unable to process the contained instructions')();
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}

	async deleteToursHost(req, res) {
		try {
			// CHECK IF TOURS_HOST EXISTS
			const toursHost = await super.getByCustomOptions(req, 'ToursHost', {
				where: {
					tours_host_id: req.params.id,
					is_deleted: false,
				},
				include: [{
					model: models.Tour,
					as: 'tour',
				}],
			});
			if (!toursHost) {
				return requestHandler.sendFailure(res, 40002, 'Tours host does not exist')();
			}

			// CHECK PERMISSION
			const tokenFromHeader = auth.getJwtToken(req);
			const account = jwt.decode(tokenFromHeader);
			if (account.payload.user_id !== toursHost.tour.host_id) {
				return requestHandler.sendFailure(res, 40001, 'No permission')();
			}

			// DELETE TOURS HOST
			toursHost.is_deleted = true;
			if (toursHost.save()) {
				return requestHandler.sendSuccess(res, 20001, 'Success')(toursHost);
			}
			return requestHandler.sendFailure(res, 40001, 'Unable to process the contained instructions')();
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}

	async getAllToursHostsByHost(req, res) {
		try {
			const tokenFromHeader = auth.getJwtToken(req);
			const account = jwt.decode(tokenFromHeader);

			const toursHosts = await super.getAllList(req, 'ToursHost', {
				where: {
					host_id: account.payload.user_id,
					// is_agreed: true,
					is_deleted: false,
				},
				include: [{
					model: models.Tour,
					as: 'tour',
					where: {
						is_deleted: false,
					},
					include: [{
						model: models.City,
						as: 'city',
						include: [{
							model: models.Country,
							as: 'country',
						}],
					}, {
						model: models.Category,
						as: 'category',
					}, {
						model: models.Transport,
						as: 'transport',
					}],
				}, {
					model: models.ToursSchedule,
					as: 'toursSchedule',
				}, {
					model: models.Order,
					as: 'orders',
				}],
			});
			if (!toursHosts.length) {
				return requestHandler.sendSuccess(res, 20002, 'No result')();
			}

			// GET NUMBER OF COMPLETED ORDERS OF TOURS HOST
			for (let indexToursHost = 0; indexToursHost < toursHosts.length; indexToursHost += 1) {
				let numberOfCompletedOrdersOfToursHost = 0;
				for (let indexOrder = 0; indexOrder < toursHosts[indexToursHost].orders.length; indexOrder += 1) {
					if (toursHosts[indexToursHost].orders[indexOrder].status === constants.ORDER_FINISHED) {
						numberOfCompletedOrdersOfToursHost += 1;
					}
				}
				toursHosts[indexToursHost].tour.dataValues.number_of_completed_orders_of_tours_host = numberOfCompletedOrdersOfToursHost;
				toursHosts[indexToursHost].tour.dataValues.tours_host_id = toursHosts[indexToursHost].tours_host_id;
				toursHosts[indexToursHost].tour.dataValues.tours_schedule = toursHosts[indexToursHost].toursSchedule;

				// USE THIS FIELD TO CHECK THE STATUS OF TOURS HOST REQUEST
				toursHosts[indexToursHost].tour.dataValues.is_agreed = toursHosts[indexToursHost].is_agreed;
			}
			return requestHandler.sendSuccess(res, 20001, 'Success')(toursHosts.map(toursHost => toursHost.tour));
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}
}
module.exports = new ToursHostsController();
