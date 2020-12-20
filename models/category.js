module.exports = (sequelize, DataTypes) => {
	const Category = sequelize.define('Category', {
		category_id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		name: {
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
		tableName: 'categories',
	});
	// eslint-disable-next-line func-names
	Category.associate = function (models) {
		Category.hasMany(models.Tour, {
			foreignKey: 'category_id',
			as: 'tours',
		});
	};
	return Category;
};
