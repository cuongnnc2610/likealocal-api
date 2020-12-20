const router = require('express').Router();
const CategoriesController = require('../../controllers/CategoriesController');
const auth = require('../../utils/auth');
const middlewares = require('../../utils/middlewares');

router.get('/',
	CategoriesController.getAllCategories);

router.post('/',
	auth.isAuthenticated,
	auth.isAdmin,
	middlewares.requireParams(['name']),
	middlewares.validateString(['name']),
	CategoriesController.createCategory);

router.put('/:id',
	auth.isAuthenticated,
	auth.isAdmin,
	middlewares.validateParamId,
	middlewares.requireParams(['name']),
	middlewares.validateString(['name']),
	CategoriesController.updateCategory);

router.delete('/:id',
	auth.isAuthenticated,
	auth.isAdmin,
	middlewares.validateParamId,
	CategoriesController.deleteCategory);

module.exports = router;
