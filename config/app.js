require('dotenv').config();

module.exports = {
	app: {
		port: process.env.DEV_APP_PORT || 8080,
		appName: process.env.APP_NAME || 'LikeALocal',
		env: process.env.NODE_ENV || 'development',
	},
	auth: {
		jwt_secret: process.env.JWT_SECRET || 'VmVyeVBvd2VyZnVsbFNlY3JldA==',
		jwt_expires_in: process.env.JWT_EXPIRES_IN || '100d',
		saltRounds: 10,
		refresh_token_secret: process.env.REFRESH_TOKEN_SECRET || 'VmVyeVBvd2VyZnVsbFNlY3JldA',
		refresh_token_expires_in: process.env.REFRESH_TOKEN_EXPIRES_IN || '365d',
	},
	mail: {
		driver: process.env.MAIL_DRIVER || 'smtp',
		host: process.env.MAIL_HOST || 'smtp.gmail.com',
		port: process.env.MAIL_PORT || 587,
		from_name: process.env.MAIL_FROM_NAME || 'LikeALocal System',
		username: process.env.MAIL_USERNAME || 'likealocalsys@gmail.com',
		password: process.env.MAIL_PASSWORD || 'likealocallikealocal123456789',
		encryption: process.env.MAIL_ENCRYPTION || 'tls',
	},
};
