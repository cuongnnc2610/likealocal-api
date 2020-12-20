/* eslint-disable max-len */
const { Op } = require('sequelize');
const RequestHandler = require('../utils/RequestHandler');
const Logger = require('../utils/logger');
const BaseController = require('./BaseController');
const models = require('../models');
const constants = require('../utils/constants');

const logger = new Logger();
const requestHandler = new RequestHandler(logger);

class CategoriesController extends BaseController {
	async getAllCategories(req, res) {
		try {
			let categories = await super.getAllList(req, 'Category', {
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
			if (!categories) {
				return requestHandler.sendSuccess(res, 20002, 'No results')();
			}

			// ORDER RESULT
			const orderType = Number(req.query.order_type);
			switch (orderType) {
			case 1: // id DESC
				categories = categories.sort((category1, category2) => category2.category_id - category1.category_id);
				break;
			case 2: // id ASC
				categories = categories.sort((category1, category2) => category1.category_id - category2.category_id);
				break;
			case 3: // name DESC
				categories = categories.sort((category1, category2) => category2.name.localeCompare(category1.name));
				break;
			case 4: // name ASC
				categories = categories.sort((category1, category2) => category1.name.localeCompare(category2.name));
				break;
			case 5: // number of tours DESC
				categories = categories.sort((category1, category2) => category2.tours.length - category1.tours.length);
				break;
			case 6: // number of tours ASC
				categories = categories.sort((category1, category2) => category1.tours.length - category2.tours.length);
				break;
			default:
				break;
			}

			const data = {};
			data.categories = categories;
			return requestHandler.sendSuccess(res, 20001, 'Get success')(data);
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}

	async createCategory(req, res) {
		try {
			// CHECK IF CATEGORY NAME EXISTS
			const category = await super.getByCustomOptions(req, 'Category', {
				where: {
					name: req.body.name,
					is_deleted: false,
				},
			});
			if (category) {
				return requestHandler.sendFailure(res, 40002, 'Category existed')();
			}

			// CREATE CATEGORY
			const createdCategory = await super.create(req, 'Category', {
				name: req.body.name,
			});
			if (createdCategory) {
				return requestHandler.sendSuccess(res, 20001, 'Get success')(createdCategory);
			}
			return requestHandler.sendFailure(res, 40001, 'Unable to process the contained instructions')();
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}

	async updateCategory(req, res) {
		try {
			// CHECK IF CATEGORY_ID EXISTS
			const category = await super.getByCustomOptions(req, 'Category', {
				where: {
					category_id: req.params.id,
					is_deleted: false,
				},
			});
			if (!category) {
				return requestHandler.sendFailure(res, 40002, 'Field category_id does not exist')();
			}

			// CHECK IF CATEGORY NAME EXISTS
			const duplicatedCategory = await super.getByCustomOptions(req, 'Category', {
				where: {
					name: req.body.name,
					is_deleted: false,
				},
			});
			if (duplicatedCategory && duplicatedCategory.category_id !== Number(req.params.id)) {
				return requestHandler.sendFailure(res, 40002, 'Category existed')();
			}

			// UPDATE CATEGORY
			category.name = req.body.name;
			if (category.save()) {
				return requestHandler.sendSuccess(res, 20001, 'Get success')(category);
			}
			return requestHandler.sendFailure(res, 40001, 'Unable to process the contained instructions')();
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}

	async deleteCategory(req, res) {
		try {
			// CHECK IF CATEGORY_ID EXISTS
			const category = await super.getByCustomOptions(req, 'Category', {
				where: {
					category_id: req.params.id,
					is_deleted: false,
				},
				// include: [{
				// 	model: models.Tour,
				// 	as: 'tours',
				// }],
			});
			if (!category) {
				return requestHandler.sendFailure(res, 40002, 'Field category_id does not exist')();
			}

			// CHECK IF THERE IS ANY TOUR OF THE CATEGORY EXISTS
			// if (category.tours.findIndex((tour) => tour.is_deleted === false) !== -1) {
			// 	return requestHandler.sendFailure(res, 40002, 'Tours of this category still exist')();
			// }

			await super.updateByCustomWhere(req, 'Tour', { category_id: constants.CATEGORY_OTHER }, {
				where: {
					category_id: req.params.id,
				},
			});

			category.is_deleted = true;
			if (category.save()) {
				return requestHandler.sendSuccess(res, 20001, 'Get success')(category);
			}
			return requestHandler.sendFailure(res, 40001, 'Unable to process the contained instructions')();
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}
}
module.exports = new CategoriesController();
