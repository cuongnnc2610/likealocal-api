const fs = require('fs');

const sql = fs.readFileSync(`${__dirname}/sql/transports.sql`).toString();

module.exports = {
	// eslint-disable-next-line no-unused-vars
	up(queryInterface, Sequelize) {
		return queryInterface.sequelize.query(
			sql,
		);
	},
	// eslint-disable-next-line no-unused-vars
	down: (queryInterface, Sequelize) => queryInterface.bulkDelete('transports', null, {}),
};
