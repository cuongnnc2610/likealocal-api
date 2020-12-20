module.exports = (sequelize, DataTypes) => {
	const ToursBenefit = sequelize.define('ToursBenefit', {
		tours_benefit_id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		tour_id: {
			type: DataTypes.INTEGER,
		},
		benefit_id: {
			type: DataTypes.INTEGER,
		},
		is_included: {
			type: DataTypes.BOOLEAN,
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
		tableName: 'tours_benefits',
	});
	// eslint-disable-next-line func-names
	ToursBenefit.associate = function (models) {
		ToursBenefit.belongsTo(models.Tour, {
			foreignKey: 'tour_id',
			as: 'tour',
		});
		ToursBenefit.belongsTo(models.Benefit, {
			foreignKey: 'benefit_id',
			as: 'benefit',
		});
	};
	return ToursBenefit;
};
