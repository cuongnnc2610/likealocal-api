module.exports = (sequelize, DataTypes) => {
	const User = sequelize.define('User', {
		user_id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		email: {
			type: DataTypes.STRING(255),
		},
		user_name: {
			type: DataTypes.STRING(50),
		},
		level_id: {
			type: DataTypes.INTEGER,
		},
		is_tour_guide: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
		avatar: {
			type: DataTypes.STRING(255),
		},
		introduction_video: {
			type: DataTypes.STRING(255),
		},
		self_introduction: {
			type: DataTypes.TEXT,
		},
		city_id: {
			type: DataTypes.INTEGER,
		},
		phone_number: {
			type: DataTypes.STRING(20),
		},
		is_verified: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
		password: {
			type: DataTypes.STRING(255),
		},
		one_time_password: {
			type: DataTypes.STRING(20),
		},
		one_time_password_period: {
			type: DataTypes.DATE,
		},
		request_status: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
		},
		balance: {
			type: DataTypes.FLOAT,
			defaultValue: 0,
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
		tableName: 'users',
	});
	// eslint-disable-next-line func-names
	User.associate = function (models) {
		User.belongsTo(models.Level, {
			foreignKey: 'level_id',
			as: 'level',
		});
		User.belongsTo(models.City, {
			foreignKey: 'city_id',
			as: 'city',
		});
		User.hasMany(models.UsersLanguage, {
			foreignKey: 'user_id',
			as: 'usersLanguages',
		});
		User.hasMany(models.HostsReview, {
			foreignKey: 'host_id',
			as: 'hostsReviews',
		});
		User.hasMany(models.Order, {
			foreignKey: 'user_id',
			as: 'orders',
		});
		User.hasMany(models.Tour, {
			foreignKey: 'host_id',
			sourceKey: 'user_id',
			as: 'tours',
		});
	};
	return User;
};
