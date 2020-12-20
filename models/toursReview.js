module.exports = (sequelize, DataTypes) => {
	const ToursReview = sequelize.define('ToursReview', {
		tours_review_id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		order_id: {
			type: DataTypes.INTEGER,
		},
		rating: {
			type: DataTypes.INTEGER,
		},
		content: {
			type: DataTypes.TEXT,
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
		tableName: 'tours_reviews',
	});
	// eslint-disable-next-line func-names
	ToursReview.associate = function (models) {
		ToursReview.belongsTo(models.Order, {
			foreignKey: 'order_id',
			as: 'order',
		});
	};
	return ToursReview;
};
