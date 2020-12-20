const constants = require('../utils/constants');

module.exports = (sequelize, DataTypes) => {
	const ToursEdit = sequelize.define('ToursEdit', {
		tours_edit_id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		tour_id: {
			type: DataTypes.INTEGER,
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
		tableName: 'tours_edits',
	});
	// eslint-disable-next-line func-names
	ToursEdit.associate = function (models) {
		ToursEdit.belongsTo(models.Tour, {
			foreignKey: 'tour_id',
			as: 'tour',
		});
		ToursEdit.belongsTo(models.City, {
			foreignKey: 'city_id',
			as: 'city',
		});
		ToursEdit.belongsTo(models.Category, {
			foreignKey: 'category_id',
			as: 'category',
		});
		ToursEdit.belongsTo(models.Transport, {
			foreignKey: 'transport_id',
			as: 'transport',
		});
		ToursEdit.hasMany(models.ToursPlace, {
			foreignKey: 'tours_edit_id',
			as: 'toursPlaces',
		});
	};
	return ToursEdit;
};
