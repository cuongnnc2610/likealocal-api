const router = require('express').Router();
const ToursSchedulesController = require('../../controllers/ToursSchedulesController');
const auth = require('../../utils/auth');
const middlewares = require('../../utils/middlewares');

router.get('/block/:id',
	auth.isAuthenticated,
	auth.isHost,
	middlewares.validateParamId,
	ToursSchedulesController.toggleBlockStatusOfToursSchedule);

/*
	ADD API WITH INPUT: TOUR_ID, DATE => OUTPUT: LIST OF HOSTS AND AVAILABLE TIME OF HOST
*/
router.get('/',
	middlewares.requireParams(['tours_host_id', 'date']),
	middlewares.validatePositiveInteger(['tours_host_id']),
	middlewares.validateDate(['date']),
	ToursSchedulesController.getAvailableSchedulesInDateAndMonth);

router.put('/:id',
	auth.isAuthenticated,
	auth.isHost,
	middlewares.validateParamId,
	middlewares.requireParams(['is_recurring']),
	middlewares.validateBoolean(['is_recurring']),
	middlewares.validateArray(['included_datetimes', 'excluded_datetimes', 'everyweek_recurring_days', 'everyday_recurring_hours']),
	middlewares.validateString(['recurring_unit']),
	ToursSchedulesController.updateToursSchedule);

module.exports = router;
