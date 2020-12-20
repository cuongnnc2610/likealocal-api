/* eslint-disable max-len */
const { User, Language } = require('../models');

module.exports = {
	// eslint-disable-next-line no-unused-vars
	up: async (queryInterface, Sequelize) => {
		const data = [];
		const languages = await Language.findAll();
		const users = await User.findAll();
		users.forEach((user) => {
			data.push({
				user_id: user.user_id,
				language_id: languages[Math.floor(Math.random() * (languages.length - 1 - 50 + 1) + 50)].language_id,
				is_deleted: false,
				created_at: new Date(),
			});
			data.push({
				user_id: user.user_id,
				language_id: languages[Math.floor(Math.random() * (49 - 0 + 1) + 0)].language_id,
				is_deleted: false,
				created_at: new Date(),
			});
		});
		return queryInterface.bulkInsert('users_languages', data, {});
	},
	// eslint-disable-next-line no-unused-vars
	down: (queryInterface, Sequelize) => queryInterface.bulkDelete('users_languages', null, {}),
};
