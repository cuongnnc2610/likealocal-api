module.exports = (sequelize, DataTypes) => {
	const HostsReview = sequelize.define('HostsReview', {
		hosts_review_id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		host_id: {
			type: DataTypes.INTEGER,
		},
		user_id: {
			type: DataTypes.INTEGER,
		},
		rating: {
			type: DataTypes.INTEGER,
		},
		content: {
			type: DataTypes.TEXT,
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
		tableName: 'hosts_reviews',
	});
	// eslint-disable-next-line func-names
	HostsReview.associate = function (models) {
		HostsReview.belongsTo(models.User, {
			foreignKey: 'host_id',
			targetKey: 'user_id',
			as: 'host',
		});
		HostsReview.belongsTo(models.User, {
			foreignKey: 'user_id',
			as: 'user',
		});
	};
	return HostsReview;
};
