module.exports = (sequelize, DataTypes) => {
	const Transport = sequelize.define('Transport', {
		transport_id: {
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
		tableName: 'transports',
	});
	// eslint-disable-next-line func-names
	Transport.associate = function (models) {
		Transport.hasMany(models.Tour, {
			foreignKey: 'transport_id',
			as: 'tours',
		});
	};
	return Transport;
};
