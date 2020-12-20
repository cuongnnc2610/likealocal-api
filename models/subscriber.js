module.exports = (sequelize, DataTypes) => {
	const Subscriber = sequelize.define('Subscriber', {
		subscriber_id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		email: {
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
		tableName: 'subscribers',
	});
	// eslint-disable-next-line func-names, no-unused-vars
	Subscriber.associate = function (models) {
	};
	return Subscriber;
};
