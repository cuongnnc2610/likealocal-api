const formidable = require('formidable');
const jwt = require('jsonwebtoken');
const auth = require('../utils/auth');
const RequestHandler = require('../utils/RequestHandler');
const Logger = require('../utils/logger');
const BaseController = require('./BaseController');
const models = require('../models');
const constants = require('../utils/constants');
const service = require('../utils/service');

const logger = new Logger();
const requestHandler = new RequestHandler(logger);

class ToursImagesController extends BaseController {
	async updateStatusOfToursImage(req, res) {
		try {
			const toursImage = await super.getByCustomOptions(req, 'ToursImage', {
				where: {
					tours_image_id: req.params.id,
					is_deleted: false,
				},
			});
			if (!toursImage) {
				return requestHandler.sendFailure(res, 40001, 'Field tours_image_id does not exist')();
			}

			// UPDATE STATUS
			toursImage.status = req.body.status;
			if (toursImage.save()) {
				return requestHandler.sendSuccess(res, 20001, 'Success')(toursImage);
			}
			return requestHandler.sendFailure(res, 40001, 'Unable to process the contained instructions')();
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}

	async updateStatusOfAllToursImage(req, res) {
		try {
			// CHECK IF TOUR_ID EXISTS
			const tour = await super.getByCustomOptions(req, 'Tour', {
				where: {
					tour_id: req.body.tour_id,
					is_deleted: false,
				},
			});
			if (!tour) {
				return requestHandler.sendFailure(res, 40001, 'Field tour_id does not exist')();
			}

			// UPDATE STATUS OF ALL TOURS IMAGES
			const updatedToursImages = await super.updateByCustomWhere(req, 'ToursImage', { status: req.body.status }, {
				where: {
					status: constants.TOURS_EDIT_PENDING,
					is_deleted: false,
				},
			});
			if (!updatedToursImages) {
				return requestHandler.sendFailure(res, 40001, 'Unable to process the contained instructions')();
			}
			return requestHandler.sendSuccess(res, 20001, 'Success')(updatedToursImages);
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}

	// eslint-disable-next-line consistent-return
	async createToursImage(req, res) {
		try {
			const formData = new formidable.IncomingForm();
			formData.parse(req, async (err, fields, file) => {
				if (err) {
					return requestHandler.sendFailure(res, 40001, err.message)();
				}

				// CHECK PERMMISSION
				const tour = await super.getByCustomOptions(req, 'Tour', {
					where: {
						tour_id: Number(fields.tour_id),
						is_deleted: false,
					},
				});
				if (!tour) {
					return requestHandler.sendFailure(res, 40002, 'Field tour_id does not exist')();
				}
				const tokenFromHeader = auth.getJwtToken(req);
				const account = jwt.decode(tokenFromHeader);
				if (tour.host_id !== account.payload.user_id) {
					return requestHandler.sendFailure(res, 40001, 'No permission')();
				}

				const fileName = file.file.name;
				const fileType = file.file.type;
				const name = fileName.substr(0, fileName.lastIndexOf('.'));
				const extension = fileName.substr(fileName.lastIndexOf('.'));
				if (extension !== '.png' && extension !== '.jpg' && extension !== '.jpeg') {
					return requestHandler.sendFailure(res, 40001, 'Invalid file')();
				}
				const newName = name + new Date().getTime() + extension;
				const path = await service.getFileLink(req, file.file.path, `${process.env.AWS_S3_ALBUM_TOUR_DETAIL_IMAGE_NAME}/${newName}`, fileType, res);

				// CREATE TOURS IMAGE
				const toursImage = await super.create(req, 'ToursImage', {
					tour_id: fields.tour_id,
					path,
					status: constants.TOURS_EDIT_PENDING,
				});
				if (toursImage) {
					return requestHandler.sendSuccess(res, 20001, 'Success')(toursImage);
				}
				return requestHandler.sendFailure(res, 40001, 'Unable to process the contained instructions')();
			});
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}

	// eslint-disable-next-line class-methods-use-this, consistent-return
	async uploadToursImage(req, res) {
		try {
			const formData = new formidable.IncomingForm();
			formData.parse(req, async (err, fields, file) => {
				if (err) {
					return requestHandler.sendFailure(res, 40001, err.message)();
				}
				const fileName = file.file.name;
				const fileType = file.file.type;
				const name = fileName.substr(0, fileName.lastIndexOf('.'));
				const extension = fileName.substr(fileName.lastIndexOf('.'));
				if (extension !== '.png' && extension !== '.jpg' && extension !== '.jpeg') {
					return requestHandler.sendFailure(res, 40001, 'Invalid file')();
				}
				const newName = name + new Date().getTime() + extension;
				return service.uploadFile(req, file.file.path, `${process.env.AWS_S3_ALBUM_TOUR_DETAIL_IMAGE_NAME}/${newName}`, fileType, res);
			});
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}

	async deleteToursImage(req, res) {
		try {
			const toursImage = await super.getByCustomOptions(req, 'ToursImage', {
				where: {
					tours_image_id: req.params.id,
					is_deleted: false,
				},
				include: [{
					model: models.Tour,
					as: 'tour',
				}],
			});
			if (!toursImage) {
				return requestHandler.sendFailure(res, 40001, 'Field tours_image_id does not exist')();
			}

			// CHECK PERMMISSION
			const tokenFromHeader = auth.getJwtToken(req);
			const account = jwt.decode(tokenFromHeader);
			if (toursImage.tour.host_id !== account.payload.user_id) {
				return requestHandler.sendFailure(res, 40001, 'No permission')();
			}

			// DELETE TOURS IMAGE
			toursImage.is_deleted = true;
			if (toursImage.save()) {
				return requestHandler.sendSuccess(res, 20001, 'Success')(toursImage);
			}
			return requestHandler.sendFailure(res, 40001, 'Unable to process the contained instructions')();
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}

	async getAllToursImages(req, res) {
		try {
			const tokenFromHeader = auth.getJwtToken(req);
			const account = jwt.decode(tokenFromHeader);
			if (account.payload.level_id === constants.LEVEL_USER) {
				return requestHandler.sendFailure(res, 40001, 'No permission')();
			}

			const toursImages = await super.getAllList(req, 'ToursImage', {
				where: {
					tour_id: req.query.tour_id,
					is_deleted: false,
				},
			});
			if (!toursImages.length) {
				return requestHandler.sendSuccess(res, 20002, 'No result')();
			}
			return requestHandler.sendSuccess(res, 20001, 'Success')(toursImages);
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}
}
module.exports = new ToursImagesController();
