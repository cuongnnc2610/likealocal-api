const stringUtil = require('../utils/stringUtil');

module.exports = {
	// eslint-disable-next-line no-unused-vars
	up: async (queryInterface, Sequelize) => {
		const data = [];
		for (let index = 0; index < 20; index += 1) {
			data.push({
				email: `${stringUtil.generateString(Math.floor(Math.random() * (20 - 6 + 1) + 6), false)}@gmail.com`.toLowerCase(),
				is_deleted: false,
				created_at: new Date(),
			});
		}
		return queryInterface.bulkInsert('subscribers', data, {});
	},
	// eslint-disable-next-line no-unused-vars
	down: (queryInterface, Sequelize) => queryInterface.bulkDelete('subscribers', null, {}),
};
