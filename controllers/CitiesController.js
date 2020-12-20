const _ = require('lodash');
const RequestHandler = require('../utils/RequestHandler');
const Logger = require('../utils/logger');
const BaseController = require('./BaseController');

const logger = new Logger();
const requestHandler = new RequestHandler(logger);

class CitiesController extends BaseController {
	async getAllCitiesByCountry(req, res) {
		try {
			const condition = {};
			condition.is_deleted = false;

			// CHECK IF COUNTRY_ID EXISTS
			if (req.query.country_id) {
				const country = await super.getByCustomOptions(req, 'Country', {
					where: {
						country_id: req.query.country_id,
						is_deleted: false,
					},
				});
				if (!country) {
					return requestHandler.sendFailure(res, 40002, 'Field country_id does not exist')();
				}
				condition.country_id = req.query.country_id;
			}
			

			const cities = await super.getAllList(req, 'City', {
				where: condition,
			});
			if (!cities) {
				return requestHandler.sendSuccess(res, 20002, 'No results')();
			}

			const result = {};
			result.cities = [];
			cities.forEach((city) => {
				city.dataValues = _.omit(city.dataValues, ['createdAt', 'updatedAt']);
				result.cities.push(city);
			});

			return requestHandler.sendSuccess(res, 20001, 'Get success')(result);
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}
}
module.exports = new CitiesController();
