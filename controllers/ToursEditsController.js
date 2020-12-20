/* eslint-disable max-len */
const { Op } = require('sequelize');
const RequestHandler = require('../utils/RequestHandler');
const Logger = require('../utils/logger');
const BaseController = require('./BaseController');
const models = require('../models');
const constants = require('../utils/constants');

const logger = new Logger();
const requestHandler = new RequestHandler(logger);

class ToursEditsController extends BaseController {

	async getLatestToursEditOfTour(req, res) {
		try {
			const toursEdit = await super.getByCustomOptions(req, 'ToursEdit', {
				where: {
					tour_id: req.query.tour_id,
					is_deleted: false,
				},
				order: [['tours_edit_id', 'DESC']],
				limit: 1,
				include: [{
					model: models.City,
					as: 'city',
					include: [{
						model: models.Country,
						as: 'country',
					}],
				}, {
					model: models.Category,
					as: 'category',
				}, {
					model: models.Transport,
					as: 'transport',
				}, {
					model: models.ToursPlace,
					as: 'toursPlaces',
					required: false,
					where: {
						is_deleted: false,
					},
				}],
			});
			if (!toursEdit) {
				return requestHandler.sendSuccess(res, 20002, 'No result')();
			}

			return requestHandler.sendSuccess(res, 20001, 'Success')(toursEdit);
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}

	async approveToursEdit(req, res) {
		try {
			// CHECK IF TOURS_EDIT EXIST
			const toursEdit = await super.getByCustomOptions(req, 'ToursEdit', {
				where: {
					tours_edit_id: req.params.id,
					is_deleted: false,
				},
				include: [{
					model: models.ToursPlace,
					as: 'toursPlaces',
					required: false,
					where: {
						is_deleted: false,
					},
				}],
			});
			if (toursEdit) {
				const tour = await super.getByCustomOptions(req, 'Tour', {
					where: {
						tour_id: toursEdit.tour_id,
						is_deleted: false,
					},
					include: [{
						model: models.ToursPlace,
						as: 'toursPlaces',
						required: false,
						where: {
							status: constants.TOURS_EDIT_APPROVED,
							is_deleted: false,
						},
					}],
				});
				if (!tour) {
					return requestHandler.sendFailure(res, 40001, 'Tour is deleted')();
				}

				// UPDATE TOUR
				tour.name = toursEdit.name;
				tour.description = toursEdit.description;
				tour.city_id = toursEdit.city_id;
				tour.meeting_address = toursEdit.meeting_address;
				tour.category_id = toursEdit.category_id;
				tour.transport_id = toursEdit.transport_id;
				tour.cover_image = toursEdit.cover_image;

				// UPDATE TOURS EDIT
				toursEdit.status = constants.TOURS_EDIT_APPROVED;
				if (tour.save() && toursEdit.save()) {
					// DELETE OLD TOURS PLACES
					for (let index = 0; index < tour.toursPlaces.length; index += 1) {
						tour.toursPlaces[index].is_deleted = true;
						tour.toursPlaces[index].save();
					}
					// APPROVE NEW TOURS PLACES
					for (let index = 0; index < toursEdit.toursPlaces.length; index += 1) {
						toursEdit.toursPlaces[index].status = constants.TOURS_EDIT_APPROVED;
						toursEdit.toursPlaces[index].save();
					}
					return requestHandler.sendSuccess(res, 20001, 'Success')(tour);
				}
				return requestHandler.sendFailure(res, 40001, 'Unable to process the contained instructions')();
			}
			return requestHandler.sendSuccess(res, 20002, 'No result')();
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}

	async rejectToursEdit(req, res) {
		try {
			// CHECK IF TOURS_EDIT_ID EXISTS
			const toursEdit = await super.getByCustomOptions(req, 'ToursEdit', {
				where: {
					tours_edit_id: req.params.id,
					is_deleted: false,
				},
				include: [{
					model: models.ToursPlace,
					as: 'toursPlaces',
					required: false,
					where: {
						is_deleted: false,
					},
				}],
			});

			if (!toursEdit) {
				return requestHandler.sendFailure(res, 40002, 'Field tours_edit_id does not exist')();
			}

			toursEdit.status = constants.TOURS_EDIT_REJECTED;

			for (let index = 0; index < toursEdit.toursPlaces.length; index += 1) {
				toursEdit.toursPlaces[index].status = constants.TOURS_EDIT_REJECTED;
				toursEdit.toursPlaces[index].save();
			}
			if (toursEdit.save()) {
				return requestHandler.sendSuccess(res, 20001, 'Success')(toursEdit);
			}
			return requestHandler.sendFailure(res, 40001, 'Unable to process the contained instructions')();
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}

	async getToursEdits(req, res) {
		try {
			// CHECK IF COUNTRY_ID EXISTS
			if (req.query.country_id) {
				const country = await super.getByCustomOptions(req, 'Country', {
					where: {
						country_id: Number(req.query.country_id),
						is_deleted: false,
					},
				});
				if (!country) {
					return requestHandler.sendFailure(res, 40002, 'Field country_id does not exist')();
				}
			}

			// CHECK IF CITY_ID EXISTS
			if (req.query.city_id) {
				const city = await super.getByCustomOptions(req, 'City', {
					where: {
						city_id: Number(req.query.city_id),
						is_deleted: false,
					},
				});
				if (!city) {
					return requestHandler.sendFailure(res, 40002, 'Field city_id does not exist')();
				}
			}

			// CHECK IF CATEGORY_ID EXISTS
			if (req.query.category_id) {
				const category = await super.getByCustomOptions(req, 'Category', {
					where: {
						category_id: Number(req.query.category_id),
						is_deleted: false,
					},
				});
				if (!category) {
					return requestHandler.sendFailure(res, 40002, 'Field category_id does not exist')();
				}
			}

			// CHECK IF TRANSPORT_ID EXISTS
			if (req.query.transport_id) {
				const transport = await super.getByCustomOptions(req, 'Transport', {
					where: {
						transport_id: Number(req.query.transport_id),
						is_deleted: false,
					},
				});
				if (!transport) {
					return requestHandler.sendFailure(res, 40002, 'Field transport_id does not exist')();
				}
			}

			let page = req.query.page ? Number(req.query.page) : 1;
			const limit = req.query.limit ? Number(req.query.limit) : 10;
			let startIndex = (page - 1) * limit;
			const condition = {};
			condition.status = { [Op.in]: [constants.TOURS_EDIT_PENDING, constants.TOURS_EDIT_REJECTED] };
			condition.is_deleted = false;

			const conditionTour = {};
			if (req.query.country_id && !req.query.city_id) {
				const cities = await super.getAllList(req, 'City', {
					where: {
						country_id: Number(req.query.country_id),
						is_deleted: false,
					},
				});
				const cityIds = [];
				for (let index = 0; index < cities.length; index += 1) {
					cityIds.push(cities[index].city_id);
				}
				conditionTour.city_id = { [Op.in]: cityIds };
			}
			if (req.query.city_id) {
				conditionTour.city_id = req.query.city_id;
			}
			if (req.query.category_id) {
				conditionTour.category_id = req.query.category_id;
			}
			if (req.query.transport_id) {
				conditionTour.transport_id = req.query.transport_id;
			}
			if (req.query.status) {
				conditionTour.status = req.query.status;
			}
			if (req.query.name) {
				conditionTour.name = { [Op.substring]: req.query.name };
			}
			if (!req.query.host_name) {
				req.query.host_name = '';
			}

			const allToursEdits = await super.getAllList(req, 'ToursEdit', {
				where: condition,
				include: [{
					model: models.Tour,
					as: 'tour',
					where: conditionTour,
					include: [{
						model: models.City,
						as: 'city',
						include: [{
							model: models.Country,
							as: 'country',
						}],
					}, {
						model: models.User,
						as: 'host',
						attributes: ['user_id', 'email', 'user_name', 'level_id', 'is_tour_guide', 'avatar'],
						where: {
							user_name: { [Op.substring]: req.query.host_name },
						},
					}, {
						model: models.Category,
						as: 'category',
					}, {
						model: models.Transport,
						as: 'transport',
					}],
				}],
			});

			const totalPage = Math.ceil(allToursEdits.length / limit);

			if (page > totalPage) {
				page = totalPage;
				startIndex = (page - 1) * limit;
			}

			let toursEdits;
			const orderType = Number(req.query.order_type);
			switch (orderType) {
			case 1: // id DESC
				toursEdits = allToursEdits.sort((toursEdit1, toursEdit2) => toursEdit2.tours_edit_id - toursEdit1.tours_edit_id);
				break;
			case 2: // id ASC
				toursEdits = allToursEdits.sort((toursEdit1, toursEdit2) => toursEdit1.tours_edit_id - toursEdit2.tours_edit_id);
				break;
			case 3: // old name DESC
				toursEdits = allToursEdits.sort((toursEdit1, toursEdit2) => toursEdit2.tour.name.localeCompare(toursEdit1.tour.name));
				break;
			case 4: // old name ASC
				toursEdits = allToursEdits.sort((toursEdit1, toursEdit2) => toursEdit1.tour.name.localeCompare(toursEdit2.tour.name));
				break;
			case 5: // rejected pending
				toursEdits = allToursEdits.sort((toursEdit1, toursEdit2) => toursEdit2.status - toursEdit1.status || toursEdit2.tours_edit_id - toursEdit1.tours_edit_id);
				break;
			case 6: // pending rejected
				toursEdits = allToursEdits.sort((toursEdit1, toursEdit2) => toursEdit1.status - toursEdit2.status || toursEdit1.tours_edit_id - toursEdit2.tours_edit_id);
				break;
			default:
				toursEdits = allToursEdits;
			}
			const offset = startIndex > 0 ? startIndex : 0;
			toursEdits = toursEdits.slice(offset, offset + limit);

			const result = {
				total: allToursEdits.length,
				per_page: limit,
				current_page: page,
				last_page: totalPage,
				from: startIndex + 1,
				to: startIndex + toursEdits.length,
				data: toursEdits,
			};

			return requestHandler.sendSuccess(res, 20001, 'Success')(result);
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}

	async getToursEdit(req, res) {
		try {
			const toursEdit = await super.getByCustomOptions(req, 'ToursEdit', {
				where: {
					tours_edit_id: req.params.id,
					is_deleted: false,
				},
				include: [{
					model: models.City,
					as: 'city',
					include: [{
						model: models.Country,
						as: 'country',
					}],
				}, {
					model: models.Category,
					as: 'category',
				}, {
					model: models.Transport,
					as: 'transport',
				}, {
					model: models.ToursPlace,
					as: 'toursPlaces',
					required: false,
					where: {
						is_deleted: false,
					},
				}],
			});

			const tour = await super.getByCustomOptions(req, 'Tour', {
				where: {
					tour_id: toursEdit.tour_id,
					is_deleted: false,
				},
				include: [{
					model: models.City,
					as: 'city',
					include: [{
						model: models.Country,
						as: 'country',
					}],
				}, {
					model: models.Category,
					as: 'category',
				}, {
					model: models.Transport,
					as: 'transport',
				}, {
					model: models.ToursPlace,
					as: 'toursPlaces',
					required: false,
					where: {
						status: constants.TOURS_EDIT_APPROVED,
						is_deleted: false,
					},
				}],
			});

			const result = {
				tours_edit: toursEdit,
				tour,
			};

			return requestHandler.sendSuccess(res, 20001, 'Success')(result);
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}

	// async deleteToursEdit(req, res) {
	// 	try {
	// 		// CHECK IF TOURS_EDIT_ID EXISTS
	// 		const toursEdit = await super.getByCustomOptions(req, 'ToursEdit', {
	// 			where: {
	// 				tours_edit_id: req.params.id,
	// 				is_deleted: false,
	// 			},
	// 			include: [{
	// 				model: models.ToursPlace,
	// 				as: 'toursPlaces',
	// 				required: false,
	// 				where: {
	// 					is_approved: false,
	// 					is_deleted: false,
	// 				},
	// 			}, {
	// 				model: models.ToursImage,
	// 				as: 'toursImages',
	// 				required: false,
	// 				where: {
	// 					is_approved: false,
	// 					is_deleted: false,
	// 				},
	// 			}],
	// 		});

	// 		if (!toursEdit) {
	// 			return requestHandler.sendFailure(res, 40002, 'Field tours_edit_id does not exist')();
	// 		}

	// 		toursEdit.is_deleted = true;

	// 		for (let index = 0; index < toursEdit.toursPlaces.length; index += 1) {
	// 			toursEdit.toursPlaces[index].is_deleted = true;
	// 			toursEdit.toursPlaces[index].save();
	// 		}
	// 		for (let index = 0; index < toursEdit.toursImages.length; index += 1) {
	// 			toursEdit.toursImages[index].is_deleted = true;
	// 			toursEdit.toursImages[index].save();
	// 		}
	// 		if (toursEdit.save()) {
	// 			return requestHandler.sendSuccess(res, 20001, 'Success')(toursEdit);
	// 		}
	// 		return requestHandler.sendFailure(res, 40001, 'Unable to process the contained instructions')();
	// 	} catch (error) {
	// 		return requestHandler.sendFailure(res, 40001, error.message)();
	// 	}
	// }
}
module.exports = new ToursEditsController();
