/* eslint-disable max-len */
const _ = require('lodash');
const sequelize = require('sequelize');
const RequestHandler = require('../utils/RequestHandler');
const Logger = require('../utils/logger');
const BaseController = require('./BaseController');
const models = require('../models');
const constants = require('../utils/constants');

const logger = new Logger();
const requestHandler = new RequestHandler(logger);

class CountriesController extends BaseController {
	async getAllCountries(req, res) {
		try {
			const countries = await super.getAllList(req, 'Country', {
				where: {
					is_deleted: false,
				},
			});
			if (!countries) {
				return requestHandler.sendSuccess(res, 20002, 'No results')();
			}

			const data = {};
			data.countries = [];
			countries.forEach((result) => {
				const country = _.omit(result.dataValues, ['createdAt', 'updatedAt']);
				data.countries.push(country);
			});

			return requestHandler.sendSuccess(res, 20001, 'Get success')(data);
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}

	async getCountriesWithTheMostTours(req, res) {
		try {
			const allTours = await super.getAllList(req, 'Tour', {
				where: {
					is_shown: true,
					status: constants.TOUR_PUBLISHED,
					is_deleted: false,
				},
				include: [{
					model: models.City,
					as: 'city',
					include: [{
						model: models.Country,
						as: 'country',
					}],
				}],
				group: ['city.country_id'],
				attributes: ['city.country_id', [sequelize.fn('COUNT', 'city.country_id'), 'number_of_tours']],
			});

			// SORT BY NUMBER OF TOURS DESC
			let tours = allTours.sort((tour1, tour2) => tour2.dataValues.number_of_tours - tour1.dataValues.number_of_tours);

			// SET LIMIT OF RESULT
			const limit = req.query.limit ? Number(req.query.limit) : 8;
			tours = tours.slice(0, limit);
			

			// FORMAT RESULT
			const data = {};
			data.countries = [];
			tours.forEach((result) => {
				const country = _.omit(result.dataValues, ['city']);
				country.country = result.dataValues.city.country;
				data.countries.push(country);
			});
			return requestHandler.sendSuccess(res, 20001, 'Get success')(data);
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}
}
module.exports = new CountriesController();
