const constants = require('../utils/constants');

module.exports = {
	up: (queryInterface, Sequelize) => queryInterface.createTable('tours_images', {
		tours_image_id: {
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
		path: {
			type: Sequelize.STRING(255),
			allowNull: false,
		},
		status: {
			type: Sequelize.BOOLEAN,
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
	down: (queryInterface, Sequelize) => queryInterface.dropTable('tours_images'),
};
