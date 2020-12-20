module.exports = (sequelize, DataTypes) => {
	const Benefit = sequelize.define('Benefit', {
		benefit_id: {
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
		tableName: 'benefits',
	});
	// eslint-disable-next-line func-names
	Benefit.associate = function (models) {
		Benefit.hasMany(models.ToursBenefit, {
			foreignKey: 'benefit_id',
			as: 'toursBenefits',
		});
	};
	return Benefit;
};
