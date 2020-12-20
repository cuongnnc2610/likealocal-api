const router = require('express').Router();
const ToursController = require('../../controllers/ToursController');
const auth = require('../../utils/auth');
const middlewares = require('../../utils/middlewares');

router.get('/master',
	auth.isAuthenticated,
	ToursController.getMasterData);

router.put('/show/:id',
	auth.isAuthenticated,
	auth.isHost,
	middlewares.validateParamId,
	ToursController.updateShowStatusTour);

router.put('/publish/:id',
	auth.isAuthenticated,
	auth.isAdmin,
	middlewares.validateParamId,
	middlewares.requireParams(['status']),
	middlewares.validatePositiveInteger(['status']),
	ToursController.updateStatusOfTour);

router.post('/images',
	auth.isAuthenticated,
	ToursController.uploadImages);

router.get('/',
	middlewares.validatePositiveInteger(['country_id', 'city_id', 'category_id', 'transport_id', 'status', 'page', 'order_type']),
	middlewares.validateString(['name', 'host_name']),
	ToursController.getToursByFilter);

router.get('/:id',
	middlewares.validateParamId,
	ToursController.getTour);

router.post('/',
	auth.isAuthenticated,
	auth.isHost,
	middlewares.requireParams(['name', 'description', 'city_id', 'list_price', 'sale_price', 'max_people', 'duration', 'meeting_address', 'category_id', 'transport_id', 'cover_image', 'tours_benefits', 'tours_places', 'tours_images']),
	middlewares.validatePositiveInteger(['city_id', 'max_people', 'category_id', 'transport_id']),
	middlewares.validatePositiveFloat(['list_price', 'sale_price', 'duration']),
	middlewares.validateString(['name', 'description', 'meeting_address', 'cover_image']),
	middlewares.validateArray(['tours_benefits', 'tours_places', 'tours_images']),
	ToursController.createTour);

router.put('/:id',
	auth.isAuthenticated,
	auth.isHost,
	middlewares.requireParams(['name', 'description', 'city_id', 'list_price', 'sale_price', 'max_people', 'duration', 'meeting_address', 'category_id', 'transport_id', 'cover_image', 'tours_benefits', 'tours_places']),
	middlewares.validatePositiveInteger(['city_id', 'max_people', 'category_id', 'transport_id']),
	middlewares.validatePositiveFloat(['list_price', 'sale_price', 'duration']),
	middlewares.validateString(['name', 'description', 'meeting_address', 'cover_image']),
	middlewares.validateArray(['tours_benefits', 'tours_places']),
	ToursController.updateTour);

router.delete('/:id',
	auth.isAuthenticated,
	middlewares.validateParamId,
	ToursController.deleteTour);

module.exports = router;
