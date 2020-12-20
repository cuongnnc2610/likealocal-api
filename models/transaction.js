module.exports = (sequelize, DataTypes) => {
	const Transaction = sequelize.define('Transaction', {
		transaction_id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		order_id: {
			type: DataTypes.INTEGER,
		},
		amount: {
			type: DataTypes.FLOAT,
		},
		transaction_fee: {
			type: DataTypes.FLOAT,
		},
		host_id: {
			type: DataTypes.INTEGER,
		},
		sender: {
			type: DataTypes.STRING(255),
		},
		receiver: {
			type: DataTypes.STRING(255),
		},
		transaction_number: {
			type: DataTypes.STRING(255),
		},
		transaction_type_id: {
			type: DataTypes.INTEGER,
		},
		payout_batch_id: {
			type: DataTypes.STRING(255),
		},
		status: {
			type: DataTypes.INTEGER,
		},
		available_balance: {
			type: DataTypes.FLOAT,
		},
		unavailable_balance: {
			type: DataTypes.FLOAT,
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
		tableName: 'transactions',
	});
	// eslint-disable-next-line func-names
	Transaction.associate = function (models) {
		Transaction.belongsTo(models.User, {
			foreignKey: 'host_id',
			targetKey: 'user_id',
			as: 'host',
		});
		Transaction.belongsTo(models.Order, {
			foreignKey: 'order_id',
			as: 'order',
		});
		Transaction.belongsTo(models.TransactionType, {
			foreignKey: 'transaction_type_id',
			as: 'transactionType',
		});
	};
	return Transaction;
};
