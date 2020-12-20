const router = require('express').Router();
const CountriesController = require('../../controllers/CountriesController');
const middlewares = require('../../utils/middlewares');

router.get('/the-most-tours',
	middlewares.validatePositiveInteger(['limit']),
	CountriesController.getCountriesWithTheMostTours);

router.get('/',
	CountriesController.getAllCountries);

module.exports = router;
