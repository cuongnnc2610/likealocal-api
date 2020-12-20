const router = require('express').Router();
const SystemSettingsController = require('../../controllers/SystemSettingsController');
const auth = require('../../utils/auth');
const middlewares = require('../../utils/middlewares');

router.get('/',
	auth.isAuthenticated,
	auth.isAdmin,
	SystemSettingsController.getAllSystemSettings);

router.put('/:id',
	auth.isAuthenticated,
	auth.isAdmin,
	middlewares.requireParams(['value']),
	middlewares.validatePositiveFloat(['value']),
	SystemSettingsController.updateSystemSetting);

module.exports = router;
