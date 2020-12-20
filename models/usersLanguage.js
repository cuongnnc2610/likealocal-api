module.exports = (sequelize, DataTypes) => {
	const UsersLanguage = sequelize.define('UsersLanguage', {
		user_id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
		},
		language_id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
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
		tableName: 'users_languages',
	});
	// eslint-disable-next-line func-names
	UsersLanguage.associate = function (models) {
		UsersLanguage.belongsTo(models.User, {
			foreignKey: 'user_id',
			as: 'user',
		});
		UsersLanguage.belongsTo(models.Language, {
			foreignKey: 'language_id',
			as: 'language',
		});
	};
	return UsersLanguage;
};
