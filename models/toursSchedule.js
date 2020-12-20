module.exports = (sequelize, DataTypes) => {
	const ToursSchedule = sequelize.define('ToursSchedule', {
		tours_schedule_id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		tours_host_id: {
			type: DataTypes.INTEGER,
			references: {
				model: 'tours_hosts',
				key: 'tours_host_id',
			},
		},
		included_datetimes: {
			type: DataTypes.TEXT,
			get() { return JSON.parse(this.getDataValue('included_datetimes')); },
		},
		excluded_datetimes: {
			type: DataTypes.TEXT,
			get() { return JSON.parse(this.getDataValue('excluded_datetimes')); },
		},
		everyweek_recurring_days: {
			type: DataTypes.TEXT,
			get() { return JSON.parse(this.getDataValue('everyweek_recurring_days')); },
		},
		everyday_recurring_hours: {
			type: DataTypes.TEXT,
			get() { return JSON.parse(this.getDataValue('everyday_recurring_hours')); },
		},
		recurring_unit: {
			type: DataTypes.STRING(255),
		},
		is_recurring: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
		// start_date: {
		// 	type: DataTypes.DATE,
		// },
		// end_date: {
		// 	type: DataTypes.DATE,
		// },
		is_blocked: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
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
		tableName: 'tours_schedules',
	});
	// eslint-disable-next-line func-names
	ToursSchedule.associate = function (models) {
		ToursSchedule.belongsTo(models.ToursHost, {
			foreignKey: 'tours_host_id',
			as: 'toursHost',
		});
	};
	return ToursSchedule;
};
