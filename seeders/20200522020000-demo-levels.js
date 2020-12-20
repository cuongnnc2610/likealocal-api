const data = [];
data.push(
	{
		level_name: 'Super Admin',
		created_at: new Date(),
	},
	{
		level_name: 'User',
		created_at: new Date(),
	},
	{
		level_name: 'Host',
		created_at: new Date(),
	},
);

module.exports = {
	// eslint-disable-next-line no-unused-vars
	up: (queryInterface, Sequelize) => queryInterface.bulkInsert('levels', data, {}),
	// eslint-disable-next-line no-unused-vars
	down: (queryInterface, Sequelize) => queryInterface.bulkDelete('levels', null, {}),
};
