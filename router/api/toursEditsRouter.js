const router = require('express').Router();
const ToursEditsController = require('../../controllers/ToursEditsController');
const auth = require('../../utils/auth');
const middlewares = require('../../utils/middlewares');

router.get('/tour',
	auth.isAuthenticated,
	auth.isHost,
	middlewares.requireParams(['tour_id']),
	middlewares.validatePositiveInteger(['tour_id']),
	ToursEditsController.getLatestToursEditOfTour);

router.put('/approve/:id',
	auth.isAuthenticated,
	auth.isAdmin,
	middlewares.validateParamId,
	ToursEditsController.approveToursEdit);

router.put('/reject/:id',
	auth.isAuthenticated,
	auth.isAdmin,
	middlewares.validateParamId,
	ToursEditsController.rejectToursEdit);

router.get('/',
	auth.isAuthenticated,
	auth.isAdmin,
	middlewares.validatePositiveInteger(['country_id', 'city_id', 'category_id', 'transport_id', 'status', 'page', 'order_type']),
	middlewares.validateString(['name', 'host_name']),
	ToursEditsController.getToursEdits);

router.get('/:id',
	auth.isAuthenticated,
	auth.isAdmin,
	middlewares.validateParamId,
	ToursEditsController.getToursEdit);

module.exports = router;
