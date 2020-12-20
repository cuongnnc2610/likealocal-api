const router = require('express').Router();
const SubscribersController = require('../../controllers/SubscribersController');
const auth = require('../../utils/auth');
const middlewares = require('../../utils/middlewares');

router.get('/',
	auth.isAuthenticated,
	auth.isAdmin,
	middlewares.requireParams(['order_type']),
	middlewares.validatePositiveInteger(['page', 'order_type']),
	middlewares.validateString(['email']),
	SubscribersController.getSubscribers);

router.post('/',
	middlewares.requireParams(['email']),
	middlewares.validateEmail,
	SubscribersController.createSubscriber);

router.delete('/:id',
	auth.isAuthenticated,
	auth.isAdmin,
	middlewares.validateParamId,
	SubscribersController.deleteSubscriber);

module.exports = router;
