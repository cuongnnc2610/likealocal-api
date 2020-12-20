module.exports = {
	up: (queryInterface, Sequelize) => queryInterface.createTable('coupons', {
		coupon_id: {
			type: Sequelize.INTEGER,
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
		},
		code: {
			type: Sequelize.STRING(255),
			allowNull: false,
		},
		discount: {
			type: Sequelize.INTEGER,
			allowNull: false,
		},
		total_quantity: {
			type: Sequelize.INTEGER,
			allowNull: false,
		},
		is_available: {
			type: Sequelize.BOOLEAN,
			allowNull: false,
			defaultValue: true,
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
	down: (queryInterface, Sequelize) => queryInterface.dropTable('coupons'),
};
