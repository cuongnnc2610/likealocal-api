module.exports = (sequelize, DataTypes) => {
	const Country = sequelize.define('Country', {
		country_id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		name: {
			type: DataTypes.STRING(50),
		},
		iso2: {
			primaryKey: true,
			type: DataTypes.STRING(3),
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
		tableName: 'countries',
	});
	// eslint-disable-next-line func-names
	Country.associate = function (models) {
		Country.hasMany(models.City, {
			foreignKey: 'country_id',
			as: 'cities',
		});
	};
	return Country;
};
