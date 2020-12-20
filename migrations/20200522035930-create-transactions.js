module.exports = {
	up: (queryInterface, Sequelize) => queryInterface.createTable('transactions', {
		transaction_id: {
			type: Sequelize.INTEGER,
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
		},
		order_id: {
			type: Sequelize.INTEGER,
			references: {
				model: 'orders',
				key: 'order_id',
			},
		},
		amount: {
			type: Sequelize.FLOAT,
			allowNull: false,
		},
		transaction_fee: {
			type: Sequelize.FLOAT,
			allowNull: false,
		},
		host_id: {
			type: Sequelize.INTEGER,
			references: {
				model: 'users',
				key: 'user_id',
			},
		},
		transaction_number: {
			type: Sequelize.STRING(255),
		},
		transaction_type_id: {
			type: Sequelize.INTEGER,
			allowNull: false,
			references: {
				model: 'transaction_types',
				key: 'transaction_type_id',
			},
		},
		sender: {
			type: Sequelize.STRING(255),
		},
		receiver: {
			type: Sequelize.STRING(255),
		},
		payout_batch_id: {
			type: Sequelize.STRING(255),
		},
		status: {
			type: Sequelize.INTEGER,
			allowNull: false,
		},
		available_balance: {
			type: Sequelize.FLOAT,
			allowNull: false,
		},
		unavailable_balance: {
			type: Sequelize.FLOAT,
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
	down: (queryInterface, Sequelize) => queryInterface.dropTable('transactions'),
};
