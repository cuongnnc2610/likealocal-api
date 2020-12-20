/* eslint-disable max-len */
const _ = require('lodash');
const RequestHandler = require('../utils/RequestHandler');
const Logger = require('../utils/logger');


const logger = new Logger();
const errHandler = new RequestHandler(logger);
class BaseController {
	constructor(options) {
		this.limit = 20;
		this.options = options;
	}

	/**
    * Get an element by it's id .
    *
    *
    * @return a Promise
	* @return an err if an error occur
    */
	// eslint-disable-next-line class-methods-use-this
	async getById(req, modelName) {
		const reqParam = req.params.id;
		let result;
		try {
			result = await req.app.get('db')[modelName].findByPk(reqParam).then(
				errHandler.throwIf((r) => !r, 404, 'not found', 'Resource not found'),
				errHandler.throwError(500, 'Sequelize error, some thing wrong with either the data base connection or schema'),
			);
		} catch (err) {
			return Promise.reject(err);
		}
		return result;
	}

	// eslint-disable-next-line class-methods-use-this
	async getByCustomOptions(req, modelName, options) {
		let result;
		try {
			result = await req.app.get('db')[modelName].findOne(options);
		} catch (err) {
			return Promise.reject(err);
		}
		return result;
	}

	// eslint-disable-next-line class-methods-use-this
	async findAndCountAll(req, modelName, options) {
		let result;
		try {
			result = await req.app.get('db')[modelName].findAndCountAll(options);
		} catch (err) {
			return Promise.reject(err);
		}
		return result;
	}

	// eslint-disable-next-line class-methods-use-this
	async deleteById(req, modelName) {
		const reqParam = req.params.id;
		let result;
		try {
			result = await req.app.get('db')[modelName].destroy({
				where: {
					id: reqParam,
				},
			}).then(
				errHandler.throwIf((r) => r < 1, 404, 'Not found', 'No record matches the Id provided'),
				errHandler.throwError(500, 'Sequelize error'),
			);
		} catch (err) {
			return Promise.reject(err);
		}
		return result;
	}

	// eslint-disable-next-line class-methods-use-this
	async deleteByCustomOptions(req, modelName, options) {
		let result;
		try {
			result = await req.app.get('db')[modelName].destroy(options).then(
				// errHandler.throwIf((r) => r < 1, 404, 'Not found', 'No record matches the options provided'),
				// errHandler.throwError(500, 'Sequelize error'),
			);
		} catch (err) {
			return Promise.reject(err);
		}
		return result;
	}

	// eslint-disable-next-line class-methods-use-this
	async create(req, modelName, data) {
		let obj = data;
		if (_.isUndefined(obj)) {
			obj = req.body;
		}
		let result;
		try {
			result = await req.app.get('db')[modelName].build(obj).save().then(
				errHandler.throwIf((r) => !r, 500, 'Internal server error', 'Something went wrong couldnt save data'),
				errHandler.throwError(500, 'Sequelize error'),

			).then(
				(savedResource) => Promise.resolve(savedResource),
			);
		} catch (err) {
			return Promise.reject(err);
		}
		return result;
	}

	// eslint-disable-next-line class-methods-use-this
	async bulkCreate(req, modelName, data) {
		let result;
		try {
			result = await req.app.get('db')[modelName].bulkCreate(data).then(
				errHandler.throwIf((r) => !r, 500, 'Internal server error', 'Something went wrong couldnt save data'),
				errHandler.throwError(500, 'Sequelize error'),

			).then(
				(savedResource) => Promise.resolve(savedResource),
			);
		} catch (err) {
			return Promise.reject(err);
		}
		return result;
	}


	// eslint-disable-next-line class-methods-use-this
	async updateById(req, modelName, data) {
		const recordID = req.params.id;
		let result;

		try {
			result = await req.app.get('db')[modelName]
				.update(data, {
					where: {
						id: recordID,
					},
				}).then(
					errHandler.throwIf((r) => !r, 500, 'Internal server error', 'Something went wrong couldnt update data'),
					errHandler.throwError(500, 'Sequelize error'),

				).then(
					(updatedRecored) => Promise.resolve(updatedRecored),
				);
		} catch (err) {
			return Promise.reject(err);
		}
		return result;
	}

	// eslint-disable-next-line class-methods-use-this
	async updateByCustomWhere(req, modelName, data, options) {
		let result;

		try {
			result = await req.app.get('db')[modelName]
				.update(data, options).then(
					errHandler.throwIf((r) => !r, 500, 'Internal server error', 'Something went wrong couldnt update data'),
					errHandler.throwError(500, 'Sequelize error'),

				).then(
					(updatedRecored) => Promise.resolve(updatedRecored),
				);
		} catch (err) {
			return Promise.reject(err);
		}
		return result;
	}

	// eslint-disable-next-line class-methods-use-this
	async getAllList(req, modelName, options) {
		let results;
		try {
			if (_.isUndefined(options)) {
				options = {};
			}

			results = await req.app.get('db')[modelName]
				.findAll(options)
				// .then(
				// 	errHandler.throwIf((r) => !r, 500, 'Internal server error', 'Something went wrong while fetching data'),
				// 	errHandler.throwError(500, 'Sequelize error'),
				// )
				.then((result) => Promise.resolve(result));
		} catch (err) {
			return Promise.reject(err);
		}
		return results;
	}

	// eslint-disable-next-line class-methods-use-this
	async updateByCustomWhereFindOne(req, modelName, data, options) {
		let result;
		try {
			result = await req.app.get('db')[modelName].findOne(options);
			if (result) {
				result.update(data)
					.then(
						errHandler.throwIf((r) => !r, 500, 'Internal server error', 'Something went wrong couldnt update data'),
						errHandler.throwError(500, 'Sequelize error'),

					).then(
						(updatedRecored) => Promise.resolve(updatedRecored),
					);
			}
		} catch (err) {
			return Promise.reject(err);
		}
		return result;
	}

	async getList(req, modelName, options) {
		const { page } = req.query;

		let results;
		try {
			if (_.isUndefined(options)) {
				options = {};
			}

			if (parseInt(page, 10)) {
				if (page === 0) {
					options = _.extend({}, options, {});
				} else {
					options = _.extend({}, options, {
						offset: this.limit * (page - 1),
						limit: this.limit,
					});
				}
			} else {
				options = _.extend({}, options, {}); // extend it so we can't mutate
			}

			results = await req.app.get('db')[modelName]
				.findAll(options)
				.then(
					errHandler.throwIf((r) => !r, 500, 'Internal server error', 'Something went wrong while fetching data'),
					errHandler.throwError(500, 'Sequelize error'),
				).then((result) => Promise.resolve(result));
		} catch (err) {
			return Promise.reject(err);
		}
		return results;
	}
}
module.exports = BaseController;
