const router = require('express').Router();
const CitiesController = require('../../controllers/CitiesController');
const middlewares = require('../../utils/middlewares');

router.get('/',
	// middlewares.requireParams(['country_id']),
	middlewares.validatePositiveInteger(['country_id']),
	CitiesController.getAllCitiesByCountry);

module.exports = router;
