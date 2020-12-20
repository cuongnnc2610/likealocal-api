const constants = require('../utils/constants');

module.exports = (sequelize, DataTypes) => {
	const ToursPlace = sequelize.define('ToursPlace', {
		tours_place_id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		tour_id: {
			type: DataTypes.INTEGER,
		},
		tours_edit_id: {
			type: DataTypes.INTEGER,
		},
		numerical_order: {
			type: DataTypes.INTEGER,
		},
		place_name: {
			type: DataTypes.STRING(255),
		},
		description: {
			type: DataTypes.TEXT,
		},
		status: {
			type: DataTypes.INTEGER,
			defaultValue: constants.TOURS_EDIT_PENDING,
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
		tableName: 'tours_places',
	});
	// eslint-disable-next-line func-names
	ToursPlace.associate = function (models) {
		ToursPlace.belongsTo(models.Tour, {
			foreignKey: 'tour_id',
			as: 'tour',
		});
		ToursPlace.belongsTo(models.ToursEdit, {
			foreignKey: 'tours_edit_id',
			as: 'toursEdit',
		});
	};
	return ToursPlace;
};
