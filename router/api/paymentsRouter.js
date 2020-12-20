const router = require('express').Router();
const PaymentsController = require('../../controllers/PaymentsController');
const TransactionsController = require('../../controllers/TransactionsController');
const auth = require('../../utils/auth');
const middlewares = require('../../utils/middlewares');

router.post('/create',
	middlewares.requireParams(['order_id']),
	middlewares.validatePositiveInteger(['order_id']),
	PaymentsController.createRequest);

router.get('/process',
	PaymentsController.processRequest);

router.post('/withdraw',
	auth.isAuthenticated,
	// auth.isHost,
	middlewares.requireParams(['receiver', 'amount_value']),
	middlewares.validateString(['receiver']),
	middlewares.validatePositiveFloat(['amount_value']),
	PaymentsController.requestWithdraw);

router.post('/webhook',
  TransactionsController.updateTransactionStatus);


module.exports = router;
