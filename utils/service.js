require('dotenv').config();
const AWS = require('aws-sdk');
const fs = require('fs');
const RequestHandler = require('./RequestHandler');
const Logger = require('./logger');

const logger = new Logger();
const requestHandler = new RequestHandler(logger);

const S3Config = {
	apiVersion: '2006-03-01',
	accessKeyId: process.env.AWS_SES_ACCESS_KEY_ID,
	secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY,
	signatureVersion: 'v4',
	region: process.env.AWS_SES_REGION,
};

const uploadFile = async (req, filePath, fileName, fileType, res) => {
	const fileContent = fs.readFileSync(filePath);
	const params = {
		Bucket: process.env.AWS_S3_BUCKET_NAME,
		Key: fileName,
		Body: fileContent,
		ACL: 'public-read',
		ContentType: fileType,
	};

	const S3 = new AWS.S3(S3Config);

	await S3.upload(params, (err, data) => {
		if (err) {
			return requestHandler.sendFailure(res, 40001, err.message)();
		}
		// eslint-disable-next-line no-console
		console.log(`File uploaded successfully. ${data.Location}`);
		return res.json({
			status: 200,
			code: 20001,
			message: 'Success',
			data: data.Location,
		});
	});
};

const getFileLink = async (req, filePath, fileName, fileType, res) => {
	const fileContent = fs.readFileSync(filePath);
	const params = {
		Bucket: process.env.AWS_S3_BUCKET_NAME,
		Key: fileName,
		Body: fileContent,
		ACL: 'public-read',
		ContentType: fileType,
	};

	const S3 = new AWS.S3(S3Config);
	const file = await S3.upload(params, (err, data) => {
		if (err) {
			return requestHandler.sendFailure(res, 40001, err.message)();
		}
		return data;
	}).promise();
	return file.Location;
};

module.exports = {
	uploadFile, getFileLink,
};
