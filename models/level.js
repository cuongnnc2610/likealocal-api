module.exports = (sequelize, DataTypes) => {
	const Level = sequelize.define('Level', {
		level_id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		level_name: {
			type: DataTypes.STRING(50),
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
		tableName: 'levels',
	});
	// eslint-disable-next-line func-names, no-unused-vars
	Level.associate = function (models) {
		// associations can be defined here
	};
	return Level;
};
