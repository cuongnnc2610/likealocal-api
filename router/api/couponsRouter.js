const router = require('express').Router();
const CouponsController = require('../../controllers/CouponsController');
const auth = require('../../utils/auth');
const middlewares = require('../../utils/middlewares');

router.get('/',
	auth.isAuthenticated,
	auth.isAdmin,
	middlewares.requireParams(['order_type']),
	middlewares.validatePositiveInteger(['page', 'order_type']),
	middlewares.validateString(['code']),
	middlewares.validateBoolean(['is_available']),
	CouponsController.getCoupons);

router.get('/verify',
	auth.isAuthenticated,
	middlewares.requireParams(['code']),
	middlewares.validateString(['code']),
	CouponsController.verifyCoupon);

router.post('/',
	auth.isAuthenticated,
	auth.isAdmin,
	middlewares.requireParams(['code', 'discount', 'total_quantity', 'is_available']),
	middlewares.validateString(['code']),
	middlewares.validatePositiveInteger(['discount', 'total_quantity']),
	middlewares.validateBoolean(['is_available']),
	CouponsController.createCoupon);

router.put('/:id',
	auth.isAuthenticated,
	auth.isAdmin,
	middlewares.validateParamId,
	middlewares.requireParams(['code', 'discount', 'total_quantity', 'is_available']),
	middlewares.validateString(['code']),
	middlewares.validatePositiveInteger(['discount', 'total_quantity']),
	middlewares.validateBoolean(['is_available']),
	CouponsController.updateCoupon);

router.delete('/:id',
	auth.isAuthenticated,
	auth.isAdmin,
	middlewares.validateParamId,
	CouponsController.deleteCoupon);

module.exports = router;
