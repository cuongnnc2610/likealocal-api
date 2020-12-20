module.exports = {
	up: (queryInterface, Sequelize) => queryInterface.createTable('hosts_reviews', {
		hosts_review_id: {
			type: Sequelize.INTEGER,
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
		},
		host_id: {
			type: Sequelize.INTEGER,
			allowNull: false,
			references: {
				model: 'users',
				key: 'user_id',
			},
		},
		user_id: {
			type: Sequelize.INTEGER,
			allowNull: false,
			references: {
				model: 'users',
				key: 'user_id',
			},
		},
		rating: {
			type: Sequelize.INTEGER,
			allowNull: false,
		},
		content: {
			type: Sequelize.TEXT,
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
	down: (queryInterface, Sequelize) => queryInterface.dropTable('hosts_reviews'),
};
