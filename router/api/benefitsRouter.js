const router = require('express').Router();
const BenefitsController = require('../../controllers/BenefitsController');
const auth = require('../../utils/auth');
const middlewares = require('../../utils/middlewares');

router.get('/',
	BenefitsController.getAllBenefits);

router.post('/',
	auth.isAuthenticated,
	auth.isAdmin,
	middlewares.requireParams(['name']),
	middlewares.validateString(['name']),
	BenefitsController.createBenefit);

router.put('/:id',
	auth.isAuthenticated,
	auth.isAdmin,
	middlewares.validateParamId,
	middlewares.requireParams(['name']),
	middlewares.validateString(['name']),
	BenefitsController.updateBenefit);

router.delete('/:id',
	auth.isAuthenticated,
	auth.isAdmin,
	middlewares.validateParamId,
	BenefitsController.deleteBenefit);

module.exports = router;
