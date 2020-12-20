/* eslint-disable max-len */
const { Op } = require('sequelize');
const RequestHandler = require('../utils/RequestHandler');
const Logger = require('../utils/logger');
const BaseController = require('./BaseController');
const models = require('../models');
const constants = require('../utils/constants');

const logger = new Logger();
const requestHandler = new RequestHandler(logger);

class TransportsController extends BaseController {
	async getAllTransports(req, res) {
		try {
			let transports = await super.getAllList(req, 'Transport', {
				where: {
					name: { [Op.substring]: req.query.name },
					is_deleted: false,
				},
				include: [{
					model: models.Tour,
					as: 'tours',
					required: false,
					where: {
						status: 2,
						is_deleted: false,
					},
				}],
			});
			if (!transports) {
				return requestHandler.sendSuccess(res, 20002, 'No results')();
			}

			// ORDER RESULT
			const orderType = Number(req.query.order_type);
			switch (orderType) {
			case 1: // id DESC
				transports = transports.sort((transport1, transport2) => transport2.transport_id - transport1.transport_id);
				break;
			case 2: // id ASC
				transports = transports.sort((transport1, transport2) => transport1.transport_id - transport2.transport_id);
				break;
			case 3: // name DESC
				transports = transports.sort((transport1, transport2) => transport2.name.localeCompare(transport1.name));
				break;
			case 4: // name ASC
				transports = transports.sort((transport1, transport2) => transport1.name.localeCompare(transport2.name));
				break;
			case 5: // number of tours DESC
				transports = transports.sort((transport1, transport2) => transport2.tours.length - transport1.tours.length);
				break;
			case 6: // number of tours ASC
				transports = transports.sort((transport1, transport2) => transport1.tours.length - transport2.tours.length);
				break;
			default:
				break;
			}

			const data = {};
			data.transports = transports;
			return requestHandler.sendSuccess(res, 20001, 'Get success')(data);
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}

	async createTransport(req, res) {
		try {
			// CHECK IF TRANSPORT NAME EXISTS
			const transport = await super.getByCustomOptions(req, 'Transport', {
				where: {
					name: req.body.name,
					is_deleted: false,
				},
			});
			if (transport) {
				return requestHandler.sendFailure(res, 40002, 'Transport existed')();
			}

			// CREATE TRANSPORT
			const createdTransport = await super.create(req, 'Transport', {
				name: req.body.name,
			});
			if (createdTransport) {
				return requestHandler.sendSuccess(res, 20001, 'Get success')(createdTransport);
			}
			return requestHandler.sendFailure(res, 40001, 'Unable to process the contained instructions')();
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}

	async updateTransport(req, res) {
		try {
			// CHECK IF TRANSPORT_ID EXISTS
			const transport = await super.getByCustomOptions(req, 'Transport', {
				where: {
					transport_id: req.params.id,
					is_deleted: false,
				},
			});
			if (!transport) {
				return requestHandler.sendFailure(res, 40002, 'Field transport_id does not exist')();
			}

			// CHECK IF TRANSPORT NAME EXISTS
			const duplicatedTransport = await super.getByCustomOptions(req, 'Transport', {
				where: {
					name: req.body.name,
					is_deleted: false,
				},
			});
			if (duplicatedTransport && duplicatedTransport.transport_id !== Number(req.params.id)) {
				return requestHandler.sendFailure(res, 40002, 'Transport existed')();
			}

			// UPDATE TRANSPORT
			transport.name = req.body.name;
			if (transport.save()) {
				return requestHandler.sendSuccess(res, 20001, 'Get success')(transport);
			}
			return requestHandler.sendFailure(res, 40001, 'Unable to process the contained instructions')();
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}

	async deleteTransport(req, res) {
		try {
			// CHECK IF TRANSPORT_ID EXISTS
			const transport = await super.getByCustomOptions(req, 'Transport', {
				where: {
					transport_id: req.params.id,
					is_deleted: false,
				},
				// include: [{
				// 	model: models.Tour,
				// 	as: 'tours',
				// }],
			});
			if (!transport) {
				return requestHandler.sendFailure(res, 40002, 'Field transport_id does not exist')();
			}

			// CHECK IF THERE IS ANY TOUR OF THE TRANSPORT EXISTS
			// if (transport.tours.findIndex((tour) => tour.is_deleted === false) !== -1) {
			// 	return requestHandler.sendFailure(res, 40002, 'Tours of this transport still exist')();
			// }

			await super.updateByCustomWhere(req, 'Tour', { transport_id: constants.TRANSPORT_OTHER }, {
				where: {
					transport_id: req.params.id,
				},
			});

			transport.is_deleted = true;
			if (transport.save()) {
				return requestHandler.sendSuccess(res, 20001, 'Get success')(transport);
			}
			return requestHandler.sendFailure(res, 40001, 'Unable to process the contained instructions')();
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}
}
module.exports = new TransportsController();
