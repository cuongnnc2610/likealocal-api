const router = require('express').Router();
const TransportsController = require('../../controllers/TransportsController');
const auth = require('../../utils/auth');
const middlewares = require('../../utils/middlewares');

router.get('/',
	TransportsController.getAllTransports);

router.post('/',
	auth.isAuthenticated,
	auth.isAdmin,
	middlewares.requireParams(['name']),
	middlewares.validateString(['name']),
	TransportsController.createTransport);

router.put('/:id',
	auth.isAuthenticated,
	auth.isAdmin,
	middlewares.validateParamId,
	middlewares.requireParams(['name']),
	middlewares.validateString(['name']),
	TransportsController.updateTransport);

router.delete('/:id',
	auth.isAuthenticated,
	auth.isAdmin,
	middlewares.validateParamId,
	TransportsController.deleteTransport);

module.exports = router;
