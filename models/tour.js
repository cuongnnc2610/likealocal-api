const constants = require('../utils/constants');

module.exports = (sequelize, DataTypes) => {
	const Tour = sequelize.define('Tour', {
		tour_id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		name: {
			type: DataTypes.STRING(255),
		},
		description: {
			type: DataTypes.TEXT,
		},
		city_id: {
			type: DataTypes.INTEGER,
		},
		host_id: {
			type: DataTypes.INTEGER,
		},
		list_price: {
			type: DataTypes.FLOAT,
		},
		sale_price: {
			type: DataTypes.FLOAT,
		},
		max_people: {
			type: DataTypes.INTEGER,
		},
		duration: {
			type: DataTypes.FLOAT,
		},
		meeting_address: {
			type: DataTypes.STRING(255),
		},
		category_id: {
			type: DataTypes.INTEGER,
		},
		transport_id: {
			type: DataTypes.INTEGER,
		},
		cover_image: {
			type: DataTypes.STRING(255),
		},
		is_shown: {
			type: DataTypes.BOOLEAN,
			defaultValue: true,
		},
		status: {
			type: DataTypes.INTEGER,
			defaultValue: constants.TOUR_UNPUBLISHED,
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
		tableName: 'tours',
	});
	// eslint-disable-next-line func-names
	Tour.associate = function (models) {
		Tour.belongsTo(models.City, {
			foreignKey: 'city_id',
			as: 'city',
		});
		Tour.belongsTo(models.User, {
			foreignKey: 'host_id',
			targetKey: 'user_id',
			as: 'host',
		});
		Tour.belongsTo(models.Category, {
			foreignKey: 'category_id',
			as: 'category',
		});
		Tour.belongsTo(models.Transport, {
			foreignKey: 'transport_id',
			as: 'transport',
		});
		Tour.hasMany(models.ToursBenefit, {
			foreignKey: 'tour_id',
			as: 'toursBenefits',
		});
		Tour.hasMany(models.ToursHost, {
			foreignKey: 'tour_id',
			as: 'toursHosts',
		});
		Tour.hasMany(models.ToursPlace, {
			foreignKey: 'tour_id',
			as: 'toursPlaces',
		});
		Tour.hasMany(models.ToursImage, {
			foreignKey: 'tour_id',
			as: 'toursImages',
		});
		Tour.hasMany(models.ToursEdit, {
			foreignKey: 'tour_id',
			as: 'toursEdits',
		});
	};
	return Tour;
};
