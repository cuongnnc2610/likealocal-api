const constants = require('../utils/constants');

module.exports = {
	up: (queryInterface, Sequelize) => queryInterface.createTable('tours', {
		tour_id: {
			type: Sequelize.INTEGER,
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
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
		host_id: {
			type: Sequelize.INTEGER,
			allowNull: false,
			references: {
				model: 'users',
				key: 'user_id',
			},
		},
		list_price: {
			type: Sequelize.FLOAT,
			allowNull: false,
		},
		sale_price: {
			type: Sequelize.FLOAT,
			allowNull: false,
		},
		max_people: {
			type: Sequelize.INTEGER,
			allowNull: false,
		},
		duration: {
			type: Sequelize.FLOAT,
			allowNull: false,
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
		is_shown: {
			type: Sequelize.BOOLEAN,
			allowNull: false,
			defaultValue: true,
		},
		status: {
			type: Sequelize.INTEGER,
			allowNull: false,
			defaultValue: constants.TOUR_UNPUBLISHED,
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
	down: (queryInterface, Sequelize) => queryInterface.dropTable('tours'),
};
