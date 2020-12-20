const router = require('express').Router();
const ToursHostsController = require('../../controllers/ToursHostsController');
const auth = require('../../utils/auth');
const middlewares = require('../../utils/middlewares');

router.get('/tours',
	auth.isAuthenticated,
	auth.isHost,
	ToursHostsController.getAllToursHostsByHost);

router.post('/guide',
	auth.isAuthenticated,
	auth.isHost,
	middlewares.requireParams(['tour_id']),
	middlewares.validatePositiveInteger(['tour_id']),
	ToursHostsController.requestGuideTour);

router.put('/agree/:id',
	auth.isAuthenticated,
	auth.isHost,
	ToursHostsController.updateAgreeStatusOfToursHost);

router.get('/',
	auth.isAuthenticated,
	auth.isHost,
	middlewares.requireParams(['tour_id']),
	middlewares.validatePositiveInteger(['tour_id']),
	ToursHostsController.getAllToursHostsByTour);

router.delete('/:id',
	auth.isAuthenticated,
	auth.isHost,
	middlewares.validateParamId,
	ToursHostsController.deleteToursHost);

module.exports = router;
