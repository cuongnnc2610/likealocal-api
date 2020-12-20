const constants = require('../utils/constants');

module.exports = (sequelize, DataTypes) => {
	const ToursImage = sequelize.define('ToursImage', {
		tours_image_id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		tour_id: {
			type: DataTypes.INTEGER,
		},
		path: {
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
		tableName: 'tours_images',
	});
	// eslint-disable-next-line func-names
	ToursImage.associate = function (models) {
		ToursImage.belongsTo(models.Tour, {
			foreignKey: 'tour_id',
			as: 'tour',
		});
	};
	return ToursImage;
};
