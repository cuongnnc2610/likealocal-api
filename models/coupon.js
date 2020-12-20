module.exports = (sequelize, DataTypes) => {
	const Coupon = sequelize.define('Coupon', {
		coupon_id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		code: {
			type: DataTypes.STRING(255),
		},
		discount: {
			type: DataTypes.INTEGER,
		},
		total_quantity: {
			type: DataTypes.INTEGER,
		},
		is_available: {
			type: DataTypes.BOOLEAN,
			defaultValue: true,
		},
		is_deleted: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
		createdAt: {
			type: DataTypes.DATE,
			field: 'created_at',
		},
		updatedAt: {
			type: DataTypes.DATE,
			field: 'updated_at',
		},
	}, {
		tableName: 'coupons',
	});
	// eslint-disable-next-line func-names, no-unused-vars
	Coupon.associate = function (models) {
	};
	return Coupon;
};
