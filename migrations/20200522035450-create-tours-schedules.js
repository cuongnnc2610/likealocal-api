module.exports = {
	up: (queryInterface, Sequelize) => queryInterface.createTable('tours_schedules', {
		tours_schedule_id: {
			type: Sequelize.INTEGER,
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
		},
		tours_host_id: {
			type: Sequelize.INTEGER,
			allowNull: false,
			references: {
				model: 'tours_hosts',
				key: 'tours_host_id',
			},
		},
		/*
			JSON
			[
				{
					"date": "2020-09-22",
					"time": ["10:00","11:30","16:00"]
				},
				{
					"date": "2020-09-23",
					"time": ["10:30","12:00","15:30"]
				}
			]
		*/
		included_datetimes: {
			type: Sequelize.TEXT,
		},
		/*
			JSON
			[
				{
					"date": "2020-09-22",
					"time": ["10:00","11:30","16:00"]
				},
				{
					"date": "2020-09-23",
					"time": ["10:30","12:00","15:30"]
				}
			]
		*/
		excluded_datetimes: {
			type: Sequelize.TEXT,
		},
		/*
			JSON
			[
				{
					"weekday": 0,
					"time": ["10:00","11:30","16:00"]
				},
				{
					"weekday": 6,
					"time": ["10:30","12:00","15:30"]
				}
			]
		*/
		everyweek_recurring_days: {
			type: Sequelize.TEXT,
		},
		// ["10:30","12:00","15:30"]
		everyday_recurring_hours: {
			type: Sequelize.TEXT,
		},
		// 'DAY' or 'WEEK' or 'DAYWEEK'
		recurring_unit: {
			type: Sequelize.STRING(255),
		},
		is_recurring: {
			type: Sequelize.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
		// start_date: {
		// 	type: Sequelize.DATE,
		// },
		// end_date: {
		// 	type: Sequelize.DATE,
		// },
		is_blocked: {
			type: Sequelize.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
		is_deleted: {
			type: Sequelize.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
		created_at: {
			type: Sequelize.DATE,
			allowNull: false,
		},
		updated_at: {
			type: Sequelize.DATE,
		},
	}),
	// eslint-disable-next-line no-unused-vars
	down: (queryInterface, Sequelize) => queryInterface.dropTable('tours_schedules'),
};
