const router = require('express').Router();
const StatisticsController = require('../../controllers/StatisticsController');
const auth = require('../../utils/auth');
const middlewares = require('../../utils/middlewares');

router.get('/',
	auth.isAuthenticated,
	auth.isAdmin,
	middlewares.validateString(['start_date', 'end_date']),
	StatisticsController.getStatistics);

module.exports = router;
