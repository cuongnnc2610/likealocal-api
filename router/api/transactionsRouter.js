const router = require('express').Router();
const TransactionsController = require('../../controllers/TransactionsController');
const auth = require('../../utils/auth');
// const middlewares = require('../../utils/middlewares');


router.get('/balance',
	auth.isAuthenticated,
	auth.isAdmin,
	TransactionsController.getCurrentBalanceOfSystem);

router.get('/',
	auth.isAuthenticated,
	TransactionsController.getTransactions);

// router.post('/',
// 	auth.isAuthenticated,
// 	auth.isAdmin,
// 	middlewares.requireParams(['name']),
// 	middlewares.validateString(['name']),
// 	TransactionsController.createTransaction);

module.exports = router;
