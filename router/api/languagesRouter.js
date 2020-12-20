const router = require('express').Router();
const LanguagesController = require('../../controllers/LanguagesController');

router.get('/',
	LanguagesController.getAllLanguages);

module.exports = router;
