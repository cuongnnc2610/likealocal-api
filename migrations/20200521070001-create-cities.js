module.exports = {
	up: (queryInterface, Sequelize) => queryInterface.createTable('cities', {
		city_id: {
			type: Sequelize.INTEGER,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
		},
		name: {
			type: Sequelize.STRING(50),
			allowNull: false,
		},
		country_id: {
			type: Sequelize.INTEGER,
			allowNull: false,
			references: {
				model: 'countries',
				key: 'country_id',
			},
		},
		utc_offset: {
			type: Sequelize.STRING(6),
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
	down: (queryInterface, Sequelize) => queryInterface.dropTable('cities'),
};
