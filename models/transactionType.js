module.exports = (sequelize, DataTypes) => {
	const TransactionType = sequelize.define('TransactionType', {
		transaction_type_id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		name: {
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
		tableName: 'transaction_types',
	});
	// eslint-disable-next-line func-names
	TransactionType.associate = function (models) {
		TransactionType.hasMany(models.Transaction, {
			foreignKey: 'transaction_type_id',
			as: 'transactions',
		});
	};
	return TransactionType;
};
