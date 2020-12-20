const router = require('express').Router();
const ToursReviewsController = require('../../controllers/ToursReviewsController');
const auth = require('../../utils/auth');
const middlewares = require('../../utils/middlewares');

router.get('/',
	middlewares.requireParams(['order_type']),
	middlewares.validatePositiveInteger(['tour_id', 'page', 'order_type']),
	middlewares.validateString(['content', 'user', 'host', 'date']),
	ToursReviewsController.getReviews);

router.post('/',
	auth.isAuthenticated,
	middlewares.requireParams(['tour_id', 'rating', 'content']),
	middlewares.validatePositiveInteger(['tour_id', 'rating']),
	middlewares.validateString(['content']),
	ToursReviewsController.createReview);

router.delete('/:id',
	auth.isAuthenticated,
	middlewares.validateParamId,
	ToursReviewsController.deleteReview);

module.exports = router;
