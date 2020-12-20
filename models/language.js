module.exports = (sequelize, DataTypes) => {
	const Language = sequelize.define('Language', {
		language_id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		name: {
			type: DataTypes.STRING(50),
		},
		lang_code: {
			type: DataTypes.STRING(3),
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
		tableName: 'languages',
	});
	// eslint-disable-next-line func-names, no-unused-vars
	Language.associate = function (models) {
		// associations can be defined here
	};
	return Language;
};
