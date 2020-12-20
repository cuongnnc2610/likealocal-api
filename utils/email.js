const nodeMailer = require('nodemailer');
const config = require('../config/app');

const adminEmail = config.mail.username;
const adminPassword = config.mail.password;

const mailHost = config.mail.host;
const mailPort = config.mail.port;

const sendMail = (to, subject, htmlContent) => {
	const transporter = nodeMailer.createTransport({
		// service: 'Outlook365',
		host: mailHost,
		port: mailPort,
		secure: false,
		auth: {
			user: adminEmail,
			pass: adminPassword,
		},
	});

	const options = {
		from: adminEmail,
		to,
		subject,
		html: htmlContent,
	};
	return transporter.sendMail(options);
};

module.exports = {
	sendMail,
};
