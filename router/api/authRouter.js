const router = require('express').Router();
const AuthController = require('../../controllers/AuthController');
const middlewares = require('../../utils/middlewares');

router.post('/loginuser',
	middlewares.requireParams(['email', 'password']),
	middlewares.validateString(['email', 'password']),
	middlewares.validateEmail,
	AuthController.loginUser);

router.post('/loginadmin',
	middlewares.requireParams(['email', 'password']),
	middlewares.validateString(['email', 'password']),
	middlewares.validateEmail,
	AuthController.loginAdmin);

router.post('/sign-up',
	middlewares.requireParams(['email', 'user_name', 'password']),
	middlewares.validateString(['email', 'user_name', 'password']),
	middlewares.validateEmail,
	AuthController.signUp);

router.post('/send-reset-code',
	middlewares.requireParams(['email']),
	middlewares.validateString(['email']),
	middlewares.validateEmail,
	AuthController.sendResetCode);

router.post('/verify-reset-code',
	middlewares.requireParams(['email', 'one_time_password']),
	middlewares.validateString(['email', 'one_time_password']),
	middlewares.validateEmail,
	AuthController.verifyResetCode);

router.post('/refresh-token',
	middlewares.requireParams(['refreshToken']),
	middlewares.validateString(['refreshToken']),
	AuthController.refreshToken);

router.post('/resend-verify-code',
	middlewares.requireParams(['email']),
	middlewares.validateString(['email']),
	middlewares.validateEmail,
	AuthController.resendVerifyCode);

router.post('/verify-email',
	middlewares.requireParams(['email', 'one_time_password']),
	middlewares.validateString(['email', 'one_time_password']),
	middlewares.validateEmail,
	AuthController.verifyEmail);

module.exports = router;
