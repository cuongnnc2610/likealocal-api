const _ = require('lodash');
const RequestHandler = require('../utils/RequestHandler');
const Logger = require('../utils/logger');
const BaseController = require('./BaseController');

const logger = new Logger();
const requestHandler = new RequestHandler(logger);

class LanguagesController extends BaseController {
	async getAllLanguages(req, res) {
		try {
			const languages = await super.getAllList(req, 'Language', {
				where: {
					is_deleted: false,
				},
			});
			if (!languages) {
				return requestHandler.sendSuccess(res, 20002, 'No results')();
			}

			const data = {};
			data.languages = [];
			languages.forEach((result) => {
				const language = _.omit(result.dataValues, ['createdAt', 'updatedAt']);
				data.languages.push(language);
			});

			return requestHandler.sendSuccess(res, 20001, 'Get success')(data);
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}
}
module.exports = new LanguagesController();
