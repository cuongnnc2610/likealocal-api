module.exports = {
	up: (queryInterface, Sequelize) => queryInterface.createTable('tours_hosts', {
		tours_host_id: {
			type: Sequelize.INTEGER,
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
		},
		tour_id: {
			type: Sequelize.INTEGER,
			allowNull: false,
			references: {
				model: 'tours',
				key: 'tour_id',
			},
		},
		host_id: {
			type: Sequelize.INTEGER,
			allowNull: false,
			references: {
				model: 'users',
				key: 'user_id',
			},
		},
		is_agreed: {
			type: Sequelize.BOOLEAN,
			allowNull: false,
			defaultValue: false,
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
	down: (queryInterface, Sequelize) => queryInterface.dropTable('tours_hosts'),
};
