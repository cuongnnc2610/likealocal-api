module.exports = (sequelize, DataTypes) => {
	const ToursHost = sequelize.define('ToursHost', {
		tours_host_id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		tour_id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
		},
		host_id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
		},
		is_agreed: {
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
		tableName: 'tours_hosts',
	});
	// eslint-disable-next-line func-names
	ToursHost.associate = function (models) {
		ToursHost.belongsTo(models.Tour, {
			foreignKey: 'tour_id',
			as: 'tour',
		});
		ToursHost.belongsTo(models.User, {
			foreignKey: 'host_id',
			targetKey: 'user_id',
			as: 'host',
		});
		ToursHost.hasOne(models.ToursSchedule, {
			foreignKey: 'tours_host_id',
			as: 'toursSchedule',
		});
		ToursHost.hasMany(models.Order, {
			foreignKey: 'tours_host_id',
			as: 'orders',
		});
	};
	return ToursHost;
};
