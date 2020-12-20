module.exports = {
	up: (queryInterface, Sequelize) => queryInterface.createTable('tours_reviews', {
		tours_review_id: {
			type: Sequelize.INTEGER,
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
		},
		order_id: {
			type: Sequelize.INTEGER,
			allowNull: false,
			references: {
				model: 'orders',
				key: 'order_id',
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
	down: (queryInterface, Sequelize) => queryInterface.dropTable('tours_reviews'),
};
