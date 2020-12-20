const constants = require('../utils/constants');

module.exports = {
	up: (queryInterface, Sequelize) => queryInterface.createTable('orders', {
		order_id: {
			type: Sequelize.INTEGER,
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
		},
		tours_host_id: {
			type: Sequelize.INTEGER,
			allowNull: false,
			references: {
				model: 'tours_hosts',
				key: 'tours_host_id',
			},
		},
		user_id: {
			type: Sequelize.INTEGER,
			// allowNull: false,
			references: {
				model: 'users',
				key: 'user_id',
			},
		},
		fullname: {
			type: Sequelize.STRING(255),
			allowNull: false,
		},
		email: {
			type: Sequelize.STRING(255),
			allowNull: false,
		},
		phone_number: {
			type: Sequelize.STRING(11),
			allowNull: false,
		},
		language_id: {
			type: Sequelize.INTEGER,
			allowNull: false,
			references: {
				model: 'languages',
				key: 'language_id',
			},
		},
		number_of_people: {
			type: Sequelize.INTEGER,
			allowNull: false,
		},
		price: {
			type: Sequelize.FLOAT,
			allowNull: false,
		},
		date_time: {
			type: Sequelize.DATE,
			allowNull: false,
		},
		coupon_id: {
			type: Sequelize.INTEGER,
			references: {
				model: 'coupons',
				key: 'coupon_id',
			},
		},
		discount: {
			type: Sequelize.INTEGER,
			allowNull: false,
			defaultValue: 0,
		},
		status: {
			type: Sequelize.INTEGER,
			allowNull: false,
			defaultValue: constants.ORDER_UNCONFIRMED,
		},
		note: {
			type: Sequelize.STRING,
		},
		is_paid_to_system: {
			type: Sequelize.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
		is_paid_to_host: {
			type: Sequelize.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
		is_cancelled: {
			type: Sequelize.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
		is_refunded: {
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
	down: (queryInterface, Sequelize) => queryInterface.dropTable('orders'),
};
