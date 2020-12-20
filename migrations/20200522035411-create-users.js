module.exports = {
	up: (queryInterface, Sequelize) => queryInterface.createTable('users', {
		user_id: {
			type: Sequelize.INTEGER,
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
		},
		email: {
			type: Sequelize.STRING(255),
			allowNull: false,
		},
		user_name: {
			type: Sequelize.STRING(50),
		},
		level_id: {
			type: Sequelize.INTEGER,
			allowNull: false,
			references: {
				model: 'levels',
				key: 'level_id',
			},
		},
		is_tour_guide: {
			type: Sequelize.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
		avatar: {
			type: Sequelize.STRING(255),
		},
		introduction_video: {
			type: Sequelize.STRING(255),
		},
		self_introduction: {
			type: Sequelize.TEXT,
		},
		city_id: {
			type: Sequelize.INTEGER,
			references: {
				model: 'cities',
				key: 'city_id',
			},
		},
		phone_number: {
			type: Sequelize.STRING(20),
		},
		is_verified: {
			type: Sequelize.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
		password: {
			type: Sequelize.STRING(255),
			allowNull: false,
		},
		one_time_password: {
			type: Sequelize.STRING(20),
		},
		one_time_password_period: {
			type: Sequelize.DATE,
		},
		request_status: {
			type: Sequelize.INTEGER,
			allowNull: false,
			defaultValue: 0,
		},
		balance: {
			type: Sequelize.FLOAT,
			allowNull: false,
			defaultValue: 0,
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
	down: (queryInterface, Sequelize) => queryInterface.dropTable('users'),
};
