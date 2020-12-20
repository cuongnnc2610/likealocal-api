const router = require('express').Router();
const ToursImagesController = require('../../controllers/ToursImagesController');
const auth = require('../../utils/auth');
const middlewares = require('../../utils/middlewares');

router.put('/status/:id',
	auth.isAuthenticated,
	auth.isAdmin,
	middlewares.validateParamId,
	middlewares.requireParams(['status']),
	middlewares.validatePositiveInteger(['status']),
	ToursImagesController.updateStatusOfToursImage);

router.put('/all-status',
	auth.isAuthenticated,
	auth.isAdmin,
	middlewares.requireParams(['tour_id', 'status']),
	middlewares.validatePositiveInteger(['tour_id', 'status']),
	ToursImagesController.updateStatusOfAllToursImage);

router.post('/images',
	auth.isAuthenticated,
	auth.isHost,
	ToursImagesController.uploadToursImage);

router.get('/',
	auth.isAuthenticated,
	middlewares.requireParams(['tour_id']),
	middlewares.validatePositiveInteger(['tour_id']),
	ToursImagesController.getAllToursImages);

router.post('/',
	auth.isAuthenticated,
	auth.isHost,
	ToursImagesController.createToursImage);

router.delete('/:id',
	auth.isAuthenticated,
	auth.isHost,
	middlewares.validateParamId,
	ToursImagesController.deleteToursImage);

module.exports = router;
