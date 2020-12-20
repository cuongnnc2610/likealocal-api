module.exports = (sequelize, DataTypes) => {
	const City = sequelize.define('City', {
		city_id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		name: {
			type: DataTypes.STRING(50),
		},
		country_id: {
			type: DataTypes.INTEGER,
		},
		utc_offset: {
			type: DataTypes.STRING(6),
		},
		image: {
			type: DataTypes.STRING(255),
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
		tableName: 'cities',
	});
	// eslint-disable-next-line func-names
	City.associate = function (models) {
		City.belongsTo(models.Country, {
			foreignKey: 'country_id',
			as: 'country',
		});
		City.hasMany(models.Tour, {
			foreignKey: 'tour_id',
			as: 'tours',
		});
	};
	return City;
};
