const router = require('express').Router();

router.use('/benefits', require('./benefitsRouter'));
router.use('/categories', require('./categoriesRouter'));
router.use('/transports', require('./transportsRouter'));
router.use('/countries', require('./countriesRouter'));
router.use('/cities', require('./citiesRouter'));
router.use('/languages', require('./languagesRouter'));
router.use('/system-settings', require('./systemSettingsRouter'));
router.use('/accounts', require('./accountsRouter'));
router.use('/host-requests', require('./hostRequestsRouter'));
router.use('/hosts-reviews', require('./hostsReviewsRouter'));
router.use('/tours-reviews', require('./toursReviewsRouter'));
router.use('/subscribers', require('./subscribersRouter'));
router.use('/coupons', require('./couponsRouter'));
router.use('/tours', require('./toursRouter'));
router.use('/tours-edits', require('./toursEditsRouter'));
router.use('/tours-images', require('./toursImagesRouter'));
router.use('/tours-hosts', require('./toursHostsRouter'));
router.use('/tours-schedules', require('./toursSchedulesRouter'));
router.use('/orders', require('./ordersRouter'));
router.use('/statistics', require('./statisticsRouter'));
router.use('/payments', require('./paymentsRouter'));
router.use('/transactions', require('./transactionsRouter'));
router.use('/', require('./authRouter'));


module.exports = router;
