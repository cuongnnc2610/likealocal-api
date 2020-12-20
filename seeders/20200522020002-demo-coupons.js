const stringUtil = require('../utils/stringUtil');

module.exports = {
	// eslint-disable-next-line no-unused-vars
	up: async (queryInterface, Sequelize) => {
		const data = [];
		for (let index = 0; index < 32; index += 1) {
			data.push({
				code: stringUtil.generateString(6, false).toUpperCase(),
				discount: Math.floor(Math.random() * (30 - 10 + 1) + 10),
				total_quantity: Math.floor(Math.random() * (500 - 200 + 1) + 200),
				is_available: Math.random() >= 0.5,
				is_deleted: false,
				created_at: new Date(),
			});
		}
		return queryInterface.bulkInsert('coupons', data, {});
	},
	// eslint-disable-next-line no-unused-vars
	down: (queryInterface, Sequelize) => queryInterface.bulkDelete('coupons', null, {}),
};
