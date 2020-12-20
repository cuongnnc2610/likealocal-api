module.exports = (sequelize, DataTypes) => {
	const SystemSetting = sequelize.define('SystemSetting', {
		system_setting_id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		name: {
			type: DataTypes.STRING(255),
		},
		value: {
			type: DataTypes.STRING,
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
		tableName: 'system_settings',
	});
	// eslint-disable-next-line func-names, no-unused-vars
	SystemSetting.associate = function (models) {
	};
	return SystemSetting;
};
