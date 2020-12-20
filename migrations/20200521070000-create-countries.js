module.exports = {
	up: (queryInterface, Sequelize) => queryInterface.createTable('countries', {
		country_id: {
			type: Sequelize.INTEGER,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
		},
		name: {
			type: Sequelize.STRING(50),
			allowNull: false,
		},
		iso2: {
			type: Sequelize.STRING(3),
			allowNull: false,
		},
		image: {
			type: Sequelize.STRING(255),
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
	down: (queryInterface, Sequelize) => queryInterface.dropTable('countries'),
};
