module.exports = {
	up: (queryInterface, Sequelize) => queryInterface.createTable('tours_benefits', {
		tours_benefit_id: {
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
		benefit_id: {
			type: Sequelize.INTEGER,
			allowNull: false,
			references: {
				model: 'benefits',
				key: 'benefit_id',
			},
		},
		is_included: {
			type: Sequelize.BOOLEAN,
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
	down: (queryInterface, Sequelize) => queryInterface.dropTable('tours_benefits'),
};
