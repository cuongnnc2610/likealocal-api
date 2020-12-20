const router = require('express').Router();
const HostsReviewsController = require('../../controllers/HostsReviewsController');
const auth = require('../../utils/auth');
const middlewares = require('../../utils/middlewares');

router.get('/',
	middlewares.requireParams(['order_type']),
	middlewares.validatePositiveInteger(['host_id', 'page', 'order_type']),
	middlewares.validateString(['content', 'user', 'host']),
	HostsReviewsController.getReviews);

router.post('/',
	auth.isAuthenticated,
	middlewares.requireParams(['host_id', 'rating', 'content']),
	middlewares.validatePositiveInteger(['host_id', 'rating']),
	middlewares.validateString(['content']),
	HostsReviewsController.createReview);

router.delete('/:id',
	auth.isAuthenticated,
	middlewares.validateParamId,
	HostsReviewsController.deleteReview);

module.exports = router;
