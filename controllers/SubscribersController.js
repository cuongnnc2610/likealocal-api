/* eslint-disable max-len */
const { Op } = require('sequelize');
const RequestHandler = require('../utils/RequestHandler');
const Logger = require('../utils/logger');
const BaseController = require('./BaseController');

const logger = new Logger();
const requestHandler = new RequestHandler(logger);

class SubscribersController extends BaseController {
	async getSubscribers(req, res) {
		try {
			let page = req.query.page ? Number(req.query.page) : 1;
			const limit = req.query.limit ? Number(req.query.limit) : 10;
			let startIndex = (page - 1) * limit;
			const condition = {};
			condition.is_deleted = false;
			if (req.query.email) {
				condition.email = { [Op.substring]: req.query.email };
			}
			const allSubscribers = await super.getAllList(req, 'Subscriber', {
				where: condition,
			});

			const totalPage = Math.ceil(allSubscribers.length / limit);

			if (page > totalPage) {
				page = totalPage;
				startIndex = (page - 1) * limit;
			}

			let subscribers;
			const orderType = Number(req.query.order_type);
			switch (orderType) {
			case 1: // id DESC
				subscribers = allSubscribers.sort((subscriber1, subscriber2) => subscriber2.subscriber_id - subscriber1.subscriber_id);
				break;
			case 2: // id ASC
				subscribers = allSubscribers.sort((subscriber1, subscriber2) => subscriber1.subscriber_id - subscriber2.subscriber_id);
				break;
			case 3: // email DESC
				subscribers = allSubscribers.sort((subscriber1, subscriber2) => subscriber2.email.localeCompare(subscriber1.email));
				break;
			case 4: // email ASC
				subscribers = allSubscribers.sort((subscriber1, subscriber2) => subscriber1.email.localeCompare(subscriber2.email));
				break;
			default:
				subscribers = allSubscribers;
			}
			const offset = startIndex > 0 ? startIndex : 0;
			subscribers = subscribers.slice(offset, offset + limit);

			const result = {
				total: allSubscribers.length,
				per_page: limit,
				current_page: page,
				last_page: totalPage,
				from: startIndex + 1,
				to: startIndex + subscribers.length,
				data: subscribers,
			};

			return requestHandler.sendSuccess(res, 20001, 'Success')(result);
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}

	async createSubscriber(req, res) {
		try {
			// CHECK IF EMAIL EXISTS
			const subscriber = await super.getByCustomOptions(req, 'Subscriber', {
				where: {
					email: req.body.email,
				},
			});
			if (subscriber) {
				if (subscriber.is_deleted === true) {
					subscriber.is_deleted = false;
					if (subscriber.save()) {
						return requestHandler.sendSuccess(res, 20001, 'Success')(subscriber);
					}
				}
				return requestHandler.sendFailure(res, 40002, 'Subscriber existed')();
			}

			// CREATE SUBSCRIBER
			const createdSubscriber = await super.create(req, 'Subscriber', {
				email: req.body.email,
			});
			if (createdSubscriber) {
				return requestHandler.sendSuccess(res, 20001, 'Get success')(createdSubscriber);
			}
			return requestHandler.sendFailure(res, 40001, 'Unable to process the contained instructions')();
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}

	async deleteSubscriber(req, res) {
		try {
			// CHECK IF SUBSCRIBER_ID EXISTS
			const subscriber = await super.getByCustomOptions(req, 'Subscriber', {
				where: {
					subscriber_id: req.params.id,
					is_deleted: false,
				},
			});
			if (!subscriber) {
				return requestHandler.sendFailure(res, 40002, 'Field subscriber_id does not exist')();
			}

			subscriber.is_deleted = true;
			if (subscriber.save()) {
				return requestHandler.sendSuccess(res, 20001, 'Get success')(subscriber);
			}
			return requestHandler.sendFailure(res, 40001, 'Unable to process the contained instructions')();
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}
}
module.exports = new SubscribersController();
