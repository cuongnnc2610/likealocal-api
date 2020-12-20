module.exports = {
	up: (queryInterface, Sequelize) => queryInterface.createTable('subscribers', {
		subscriber_id: {
			type: Sequelize.INTEGER,
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
		},
		email: {
			type: Sequelize.STRING(255),
			allowNull: false,
		},
		is_deleted: {
			type: Sequelize.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
		created_at: {
			type: Sequelize.DATE,
			allowNull: false,
		},
		updated_at: {
			type: Sequelize.DATE,
		},
	}),
	// eslint-disable-next-line no-unused-vars
	down: (queryInterface, Sequelize) => queryInterface.dropTable('subscribers'),
};
