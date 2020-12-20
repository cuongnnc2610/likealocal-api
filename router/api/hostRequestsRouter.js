/* eslint-disable max-len */
const router = require('express').Router();
const HostRequestsController = require('../../controllers/HostRequestsController');
const auth = require('../../utils/auth');
const middlewares = require('../../utils/middlewares');

// router.get('/profile',
// 	auth.isAuthenticated,
// 	AccountsController.getProfile);

// router.put('/profile',
// 	auth.isAuthenticated,
// 	middlewares.requireParams(['user_name']),
// 	middlewares.validateString(['user_name', 'avatar', 'introduction_video', 'self_introduction', 'phone_number', 'language_ids']),
// 	middlewares.validatePositiveInteger(['city_id', 'request_status']),
// 	AccountsController.updateProfile);

router.get('/',
	auth.isAuthenticated,
	auth.isAdmin,
	middlewares.validatePositiveInteger(['page', 'country_id', 'city_id', 'request_status', 'order_type']),
	middlewares.validateString(['email', 'user_name', 'updated_at']),
	HostRequestsController.getHostRequests);

router.put('/approve-reject/:id',
	auth.isAuthenticated,
	auth.isAdmin,
	middlewares.validateParamId,
	middlewares.requireParams(['request_status']),
	middlewares.validatePositiveInteger(['request_status']),
	HostRequestsController.approveOrRejectHostRequest);

module.exports = router;
