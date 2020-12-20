/* eslint-disable max-len */
const { Op } = require('sequelize');
const RequestHandler = require('../utils/RequestHandler');
const Logger = require('../utils/logger');
const BaseController = require('./BaseController');
const models = require('../models');

const logger = new Logger();
const requestHandler = new RequestHandler(logger);

class BenefitsController extends BaseController {
	async getAllBenefits(req, res) {
		try {
			let benefits = await super.getAllList(req, 'Benefit', {
				where: {
					name: { [Op.substring]: req.query.name },
					is_deleted: false,
				},
				include: [{
					model: models.ToursBenefit,
					as: 'toursBenefits',
					required: false,
					where: {
						is_deleted: false,
					},
				}],
			});
			if (!benefits) {
				return requestHandler.sendSuccess(res, 20002, 'No results')();
			}

			// ORDER RESULT
			const orderType = Number(req.query.order_type);
			switch (orderType) {
			case 1: // id DESC
				benefits = benefits.sort((benefit1, benefit2) => benefit2.benefit_id - benefit1.benefit_id);
				break;
			case 2: // id ASC
				benefits = benefits.sort((benefit1, benefit2) => benefit1.benefit_id - benefit2.benefit_id);
				break;
			case 3: // name DESC
				benefits = benefits.sort((benefit1, benefit2) => benefit2.name.localeCompare(benefit1.name));
				break;
			case 4: // name ASC
				benefits = benefits.sort((benefit1, benefit2) => benefit1.name.localeCompare(benefit2.name));
				break;
			case 5: // number of occurrences DESC
				benefits = benefits.sort((benefit1, benefit2) => benefit2.toursBenefits.length - benefit1.toursBenefits.length);
				break;
			case 6: // number of occurrences ASC
				benefits = benefits.sort((benefit1, benefit2) => benefit1.toursBenefits.length - benefit2.toursBenefits.length);
				break;
			default:
				break;
			}

			const data = {};
			data.benefits = benefits;
			return requestHandler.sendSuccess(res, 20001, 'Get success')(data);
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}

	async createBenefit(req, res) {
		try {
			// CHECK IF BENEFIT NAME EXISTS
			const benefit = await super.getByCustomOptions(req, 'Benefit', {
				where: {
					name: req.body.name,
					is_deleted: false,
				},
			});
			if (benefit) {
				return requestHandler.sendFailure(res, 40002, 'Benefit existed')();
			}

			// CREATE BENEFIT
			const createdBenefit = await super.create(req, 'Benefit', {
				name: req.body.name,
			});
			if (createdBenefit) {
				return requestHandler.sendSuccess(res, 20001, 'Get success')(createdBenefit);
			}
			return requestHandler.sendFailure(res, 40001, 'Unable to process the contained instructions')();
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}

	async updateBenefit(req, res) {
		try {
			// CHECK IF BENEFIT_ID EXISTS
			const benefit = await super.getByCustomOptions(req, 'Benefit', {
				where: {
					benefit_id: req.params.id,
					is_deleted: false,
				},
			});
			if (!benefit) {
				return requestHandler.sendFailure(res, 40002, 'Field benefit_id does not exist')();
			}

			// CHECK IF BENEFIT NAME EXISTS
			const duplicatedBenefit = await super.getByCustomOptions(req, 'Benefit', {
				where: {
					name: req.body.name,
					is_deleted: false,
				},
			});
			if (duplicatedBenefit && duplicatedBenefit.benefit_id !== Number(req.params.id)) {
				return requestHandler.sendFailure(res, 40002, 'Benefit existed')();
			}

			// UPDATE BENEFIT
			benefit.name = req.body.name;
			if (benefit.save()) {
				return requestHandler.sendSuccess(res, 20001, 'Get success')(benefit);
			}
			return requestHandler.sendFailure(res, 40001, 'Unable to process the contained instructions')();
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}

	async deleteBenefit(req, res) {
		try {
			// CHECK IF BENEFIT_ID EXISTS
			const benefit = await super.getByCustomOptions(req, 'Benefit', {
				where: {
					benefit_id: req.params.id,
					is_deleted: false,
				},
			});
			if (!benefit) {
				return requestHandler.sendFailure(res, 40002, 'Field benefit_id does not exist')();
			}

			benefit.is_deleted = true;
			if (benefit.save()) {
				return requestHandler.sendSuccess(res, 20001, 'Get success')(benefit);
			}
			return requestHandler.sendFailure(res, 40001, 'Unable to process the contained instructions')();
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}
}
module.exports = new BenefitsController();
