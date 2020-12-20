const constants = require('../utils/constants');

module.exports = {
	up: (queryInterface, Sequelize) => queryInterface.createTable('tours_edits', {
		tours_edit_id: {
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
		name: {
			type: Sequelize.STRING(255),
			allowNull: false,
		},
		description: {
			type: Sequelize.TEXT,
			allowNull: false,
		},
		city_id: {
			type: Sequelize.INTEGER,
			allowNull: false,
			references: {
				model: 'cities',
				key: 'city_id',
			},
		},
		meeting_address: {
			type: Sequelize.STRING(255),
			allowNull: false,
		},
		category_id: {
			type: Sequelize.INTEGER,
			allowNull: false,
			references: {
				model: 'categories',
				key: 'category_id',
			},
		},
		transport_id: {
			type: Sequelize.INTEGER,
			allowNull: false,
			references: {
				model: 'transports',
				key: 'transport_id',
			},
		},
		cover_image: {
			type: Sequelize.STRING(255),
			allowNull: false,
		},
		status: {
			type: Sequelize.INTEGER,
			allowNull: false,
			defaultValue: constants.TOURS_EDIT_PENDING,
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
	down: (queryInterface, Sequelize) => queryInterface.dropTable('tours_edits'),
};
