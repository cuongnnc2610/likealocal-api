/* eslint-disable max-len */
const { Op } = require('sequelize');
const RequestHandler = require('../utils/RequestHandler');
const Logger = require('../utils/logger');
const BaseController = require('./BaseController');
const constants = require('../utils/constants');

const logger = new Logger();
const requestHandler = new RequestHandler(logger);

class StatisticsController extends BaseController {
	async getStatistics(req, res) {
		try {
			// GET DATE RANGE
			const condition = {};
			condition.is_deleted = false;
			if (req.query.start_date && req.query.end_date) {
				condition.createdAt = {
					[Op.gte]: new Date(`${req.query.start_date}T00:00:00.000+00:00`),
					[Op.lte]: new Date(`${req.query.end_date}T23:59:59.000+00:00`),
				};
			}
			if (req.query.start_date && !req.query.end_date) {
				condition.createdAt = {
					[Op.gte]: new Date(`${req.query.start_date}T00:00:00.000+00:00`),
				};
			}
			if (!req.query.start_date && req.query.end_date) {
				condition.createdAt = {
					[Op.lte]: new Date(`${req.query.end_date}T23:59:59.000+00:00`),
				};
			}

			// GET ALL NORMAL USERS
			const conditionUser = {};
			Object.assign(conditionUser, condition);
			conditionUser.level_id = constants.LEVEL_USER;
			const findAllUsers = () => super.getAllList(req, 'User', {
				where: conditionUser,
			});

			// GET ALL HOSTS
			const conditionHost = {};
			Object.assign(conditionHost, condition);
			conditionHost.level_id = constants.LEVEL_HOST;
			const findAllHosts = () => super.getAllList(req, 'User', {
				where: conditionHost,
			});

			// GET ALL TOURS
			const conditionTour = {};
			Object.assign(conditionTour, condition);
			conditionTour.status = constants.TOUR_PUBLISHED;
			const findAllTours = () => super.getAllList(req, 'Tour', {
				where: conditionTour,
			});

			// GET ALL ORDERS
			const conditionOrder = {};
			Object.assign(conditionOrder, condition);
			conditionOrder.is_cancelled = false;
			conditionOrder.is_paid_to_system = true;
			conditionOrder.is_paid_to_host = true;
			conditionOrder.status = constants.ORDER_FINISHED;
			const findAllOrders = () => super.getAllList(req, 'Order', {
				where: conditionOrder,
			});

			// GET ALL SUBSCRIBERS
			const findAllSubscribers = () => super.getAllList(req, 'Subscriber', {
				where: condition,
			});

			// GET ALL HOSTS REVIEWS
			const findAllHostsReviews = () => super.getAllList(req, 'HostsReview', {
				where: condition,
			});

			// GET ALL TOURS REVIEWS
			const findAllToursReviews = () => super.getAllList(req, 'ToursReview', {
				where: condition,
			});

			// GET ALL TOURS IMAGES
			const conditionToursImage = {};
			Object.assign(conditionToursImage, condition);
			conditionToursImage.status = constants.TOURS_EDIT_APPROVED;
			const findAllToursImages = () => super.getAllList(req, 'ToursImage', {
				where: conditionToursImage,
			});

			const [users, hosts, tours, orders, subscribers, hostsReviews, toursReviews, toursImages] = await Promise.all([findAllUsers(), findAllHosts(), findAllTours(), findAllOrders(), findAllSubscribers(), findAllHostsReviews(), findAllToursReviews(), findAllToursImages()]);

			// RESULT
			const data = {};
			data.number_of_normal_users = users.length;
			data.number_of_hosts = hosts.length;
			data.number_of_tours = tours.length;
			data.number_of_orders = orders.length;
			data.number_of_subscribers = subscribers.length;
			data.number_of_hosts_reviews = hostsReviews.length;
			data.number_of_tours_reviews = toursReviews.length;
			data.number_of_tours_images = toursImages.length;

			return requestHandler.sendSuccess(res, 20001, 'Get data success')(data);
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}
}
module.exports = new StatisticsController();
