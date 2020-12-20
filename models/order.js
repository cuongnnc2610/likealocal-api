const constants = require('../utils/constants');

module.exports = (sequelize, DataTypes) => {
	const Order = sequelize.define('Order', {
		order_id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		tours_host_id: {
			type: DataTypes.INTEGER,
		},
		user_id: {
			type: DataTypes.INTEGER,
		},
		fullname: {
			type: DataTypes.STRING(255),
		},
		email: {
			type: DataTypes.STRING(255),
		},
		phone_number: {
			type: DataTypes.STRING(11),
		},
		language_id: {
			type: DataTypes.INTEGER,
		},
		number_of_people: {
			type: DataTypes.INTEGER,
		},
		price: {
			type: DataTypes.FLOAT,
		},
		date_time: {
			type: DataTypes.DATE,
		},
		coupon_id: {
			type: DataTypes.INTEGER,
		},
		discount: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
		},
		note: {
			type: DataTypes.STRING,
		},
		status: {
			type: DataTypes.INTEGER,
			defaultValue: constants.ORDER_UNCONFIRMED,
		},
		is_cancelled: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
		is_refunded: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
		is_paid_to_system: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
		is_paid_to_host: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
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
		tableName: 'orders',
	});
	// eslint-disable-next-line func-names
	Order.associate = function (models) {
		Order.belongsTo(models.ToursHost, {
			foreignKey: 'tours_host_id',
			as: 'toursHost',
		});
		Order.belongsTo(models.User, {
			foreignKey: 'user_id',
			as: 'user',
		});
		Order.belongsTo(models.Language, {
			foreignKey: 'language_id',
			as: 'language',
		});
		Order.belongsTo(models.Coupon, {
			foreignKey: 'coupon_id',
			as: 'coupon',
		});
		Order.hasMany(models.ToursReview, {
			foreignKey: 'order_id',
			as: 'toursReviews',
		});
	};
	return Order;
};
