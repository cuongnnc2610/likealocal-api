const router = require('express').Router();
const AccountsController = require('../../controllers/AccountsController');
const auth = require('../../utils/auth');
const middlewares = require('../../utils/middlewares');

router.get('/profile',
	auth.isAuthenticated,
	AccountsController.getProfile);

router.put('/profile',
	auth.isAuthenticated,
	middlewares.requireParams(['user_name']),
	middlewares.validateString(['user_name', 'avatar', 'introduction_video', 'self_introduction', 'phone_number', 'language_ids']),
	middlewares.validatePositiveInteger(['city_id', 'request_status']),
	AccountsController.updateProfile);

router.put('/request-to-be-host',
	auth.isAuthenticated,
	auth.isUser,
	AccountsController.requestToBeHost);

router.put('/change-password',
	auth.isAuthenticated,
	middlewares.requireParams(['password', 'new_password']),
	middlewares.validateString(['password', 'new_password']),
	AccountsController.changePassword);

router.put('/tourguide/:id',
	auth.isAuthenticated,
	auth.isAdmin,
	middlewares.validateParamId,
	AccountsController.updateTourGuideStatusUser);

router.post('/avatar',
	auth.isAuthenticated,
	AccountsController.uploadAvatar);

router.post('/introduction-video',
	auth.isAuthenticated,
	AccountsController.uploadIntroductionVideo);

router.delete('/avatar/:id',
	auth.isAuthenticated,
	auth.isAdmin,
	middlewares.validateParamId,
	AccountsController.deleteAvatar);

router.get('/',
	auth.isAuthenticated,
	auth.isAdmin,
	middlewares.validatePositiveInteger(['page', 'level_id', 'country_id', 'city_id', 'order_type']),
	middlewares.validateString(['email', 'user_name', 'created_at']),
	middlewares.validateBoolean(['is_tour_guide', 'is_verified']),
	AccountsController.getUsers);

router.get('/:id',
	middlewares.validateParamId,
	AccountsController.getUser);

router.delete('/:id',
	auth.isAuthenticated,
	auth.isAdmin,
	middlewares.validateParamId,
	AccountsController.deleteUser);

module.exports = router;
