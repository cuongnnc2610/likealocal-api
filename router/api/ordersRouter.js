const router = require('express').Router();
const OrdersController = require('../../controllers/OrdersController');
const auth = require('../../utils/auth');
const middlewares = require('../../utils/middlewares');

router.put('/confirm/:id',
	auth.isAuthenticated,
	auth.isHost,
	middlewares.validateParamId,
	OrdersController.confirmOrder);

/*
	ADD FUNCTION TO PAY BACK MONEY TO USER IF TOUR IS CANCELLED BEFORE DUE DATE AND CURRENT STATUS = 3
*/
router.put('/cancel/:id',
	auth.isAuthenticated,
	middlewares.validateParamId,
	OrdersController.cancelOrder);

router.put('/finish/:id',
	auth.isAuthenticated,
	auth.isHost,
	middlewares.validateParamId,
	OrdersController.finishOrder);

router.put('/complete/:id',
	auth.isAuthenticated,
	auth.isAdmin,
	middlewares.validateParamId,
	OrdersController.completeOrder);

router.put('/paid/:id',
	auth.isAuthenticated,
	middlewares.validateParamId,
	middlewares.requireParams(['transaction_fee', 'transaction_number', 'sender']),
	middlewares.validatePositiveFloat(['transaction_fee']),
	middlewares.validateString(['transaction_number', 'sender']),
	OrdersController.confirmPaid);

router.get('/host',
	auth.isAuthenticated,
	auth.isHost,
	middlewares.validatePositiveInteger(['page', 'limit', 'order_id']),
	// middlewares.validateString(['fullname', 'email', 'phone_number', 'tour_name', 'host_name', 'user_name']),
	middlewares.validateBoolean(['is_paid_to_host']),
	OrdersController.getHostOrders);

router.get('/',
	auth.isAuthenticated,
	middlewares.validatePositiveInteger(['page', 'limit', 'order_id']),
	// middlewares.validateString(['fullname', 'email', 'phone_number', 'tour_name', 'host_name', 'user_name']),
	middlewares.validateBoolean(['is_paid_to_host']),
	OrdersController.getOrders);

router.get('/:id',
	auth.isAuthenticated,
	middlewares.validateParamId,
	OrdersController.getOrder);

/*
	MISS CASE USER PAY FIRST => is_paid_to_system = true
*/
router.post('/',
	// auth.isAuthenticated,
	// auth.isUser,
	middlewares.requireParams(['tours_host_id', 'fullname', 'email', 'phone_number', 'language_id', 'number_of_people', 'date_time']),
	middlewares.validatePositiveInteger(['tours_host_id', 'language_id', 'number_of_people']),
	middlewares.validateEmail,
	middlewares.validateString(['fullname', 'phone_number', 'date_time', 'coupon']),
	OrdersController.createOrder);

module.exports = router;
