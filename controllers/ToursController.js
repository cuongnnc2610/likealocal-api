/* eslint-disable max-len */
const { Op } = require('sequelize');
const formidable = require('formidable');
const jwt = require('jsonwebtoken');
const auth = require('../utils/auth');
const RequestHandler = require('../utils/RequestHandler');
const Logger = require('../utils/logger');
const BaseController = require('./BaseController');
const models = require('../models');
const service = require('../utils/service');
const constants = require('../utils/constants');

const logger = new Logger();
const requestHandler = new RequestHandler(logger);

class ToursController extends BaseController {
	async getToursByFilter(req, res) {
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
			condition.is_deleted = false;

			const tokenFromHeader = auth.getJwtToken(req);
			const account = jwt.decode(tokenFromHeader);
			if (!account || account.payload.level_id !== constants.LEVEL_ADMIN) {
				condition.is_shown = true;
				condition.status = constants.TOUR_PUBLISHED;
			}
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
				condition.city_id = { [Op.in]: cityIds };
			}
			if (req.query.city_id) {
				condition.city_id = req.query.city_id;
			}
			if (req.query.category_id) {
				condition.category_id = req.query.category_id;
			}
			if (req.query.transport_id) {
				condition.transport_id = req.query.transport_id;
			}
			if (req.query.status) {
				condition.status = req.query.status;
			}
			if (req.query.name) {
				condition.name = { [Op.substring]: req.query.name };
			}
			if (!req.query.host_name) {
				req.query.host_name = '';
			}

			const allTours = await super.getAllList(req, 'Tour', {
				where: condition,
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
				},
				{
					model: models.ToursHost,
					as: 'toursHosts',
					required: false,
					where: {
						is_deleted: false,
					},
					include: [{
						model: models.Order,
						as: 'orders',
						required: false,
						where: {
							is_deleted: false,
						},
						include: [{
							model: models.ToursReview,
							as: 'toursReviews',
							required: false,
							where: {
								is_deleted: false,
							},
						}],
					}],
				}],
			});

			// GET RATING OF TOURS
			for (let indexTour = 0; indexTour < allTours.length; indexTour += 1) {
				let rating = 0;
				let numberOfReviews = 0;
				for (let indexToursHost = 0; indexToursHost < allTours[indexTour].toursHosts.length; indexToursHost += 1) {
					for (let indexOrder = 0; indexOrder < allTours[indexTour].toursHosts[indexToursHost].orders.length; indexOrder += 1) {
						for (let indexReview = 0; indexReview < allTours[indexTour].toursHosts[indexToursHost].orders[indexOrder].toursReviews.length; indexReview += 1) {
							rating += allTours[indexTour].toursHosts[indexToursHost].orders[indexOrder].toursReviews[indexReview].rating;
							numberOfReviews += 1;
						}
					}
				}
				allTours[indexTour].dataValues.rating = rating === 0 ? 0 : rating / numberOfReviews;
				allTours[indexTour].dataValues.number_of_reviews = numberOfReviews;
			}

			// GET NUMBER OF COMPLETED ORDERS OF TOURS
			for (let indexTour = 0; indexTour < allTours.length; indexTour += 1) {
				let numberOfCompletedOrders = 0;
				for (let indexToursHost = 0; indexToursHost < allTours[indexTour].toursHosts.length; indexToursHost += 1) {
					for (let indexOrder = 0; indexOrder < allTours[indexTour].toursHosts[indexToursHost].orders.length; indexOrder += 1) {
						if (allTours[indexTour].toursHosts[indexToursHost].orders[indexOrder].status === constants.ORDER_FINISHED) {
							numberOfCompletedOrders += 1;
						}
					}
				}
				allTours[indexTour].dataValues.number_of_completed_orders = numberOfCompletedOrders;
			}

			const totalPage = Math.ceil(allTours.length / limit);

			if (page > totalPage) {
				page = totalPage;
				startIndex = (page - 1) * limit;
			}

			let tours;
			const orderType = Number(req.query.order_type);
			switch (orderType) {
			case 1: // id DESC
				tours = allTours.sort((tour1, tour2) => tour2.tour_id - tour1.tour_id);
				break;
			case 2: // id ASC
				tours = allTours.sort((tour1, tour2) => tour1.tour_id - tour2.tour_id);
				break;
			case 3: // name DESC
				tours = allTours.sort((tour1, tour2) => tour2.name.localeCompare(tour1.name));
				break;
			case 4: // name ASC
				tours = allTours.sort((tour1, tour2) => tour1.name.localeCompare(tour2.name));
				break;
			case 5: // list_price DESC
				tours = allTours.sort((tour1, tour2) => tour2.list_price - tour1.list_price);
				break;
			case 6: // list_price ASC
				tours = allTours.sort((tour1, tour2) => tour1.list_price - tour2.list_price);
				break;
			case 7: // sale_price DESC
				tours = allTours.sort((tour1, tour2) => tour2.sale_price - tour1.sale_price);
				break;
			case 8: // sale_price ASC
				tours = allTours.sort((tour1, tour2) => tour1.sale_price - tour2.sale_price);
				break;
			case 9: // max_people DESC
				tours = allTours.sort((tour1, tour2) => tour2.max_people - tour1.max_people);
				break;
			case 10: // max_people ASC
				tours = allTours.sort((tour1, tour2) => tour1.max_people - tour2.max_people);
				break;
			case 11: // duration DESC
				tours = allTours.sort((tour1, tour2) => tour2.duration - tour1.duration);
				break;
			case 12: // duration ASC
				tours = allTours.sort((tour1, tour2) => tour1.duration - tour2.duration);
				break;
			case 13: // rating DESC
				tours = allTours.sort((tour1, tour2) => tour2.dataValues.rating - tour1.dataValues.rating);
				break;
			case 14: // rating ASC
				tours = allTours.sort((tour1, tour2) => tour1.dataValues.rating - tour2.dataValues.rating);
				break;
			case 15: // number_of_completed_orders DESC
				tours = allTours.sort((tour1, tour2) => tour2.dataValues.number_of_completed_orders - tour1.dataValues.number_of_completed_orders);
				break;
			case 16: // number_of_completed_orders ASC
				tours = allTours.sort((tour1, tour2) => tour1.dataValues.number_of_completed_orders - tour2.dataValues.number_of_completed_orders);
				break;
			case 17: // approved rejected unpublished
				tours = allTours.sort((tour1, tour2) => tour2.status - tour1.status || tour2.tour_id - tour1.tour_id);
				break;
			case 18: // unpublished rejected approved
				tours = allTours.sort((tour1, tour2) => tour1.status - tour2.status || tour1.tour_id - tour2.tour_id);
				break;
			default:
				tours = allTours;
			}
			const offset = startIndex > 0 ? startIndex : 0;
			tours = tours.slice(offset, offset + limit);

			const result = {
				total: allTours.length,
				per_page: limit,
				current_page: page,
				last_page: totalPage,
				from: startIndex + 1,
				to: startIndex + tours.length,
				data: tours,
			};
			return requestHandler.sendSuccess(res, 20001, 'Get data success')(result);
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}

	async getTour(req, res) {
		try {
			const condition = {};
			condition.tour_id = req.params.id;
			condition.is_deleted = false;

			const tokenFromHeader = auth.getJwtToken(req);
			const account = jwt.decode(tokenFromHeader);
			// if (!account || account.payload.level_id === 2) {
			// 	condition.is_shown = true;
			// 	condition.status = constants.TOUR_PUBLISHED;
			// }

			const tour = await super.getByCustomOptions(req, 'Tour', {
				where: condition,
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
					include: [{
						model: models.UsersLanguage,
						as: 'usersLanguages',
						required: false,
						where: {
							is_deleted: false,
						},
						include: [{
							model: models.Language,
							as: 'language',
						}],
					}],
				}, {
					model: models.Category,
					as: 'category',
				}, {
					model: models.Transport,
					as: 'transport',
				},
				// {
				// 	model: models.ToursBenefit,
				// 	as: 'toursBenefits',
				// 	required: false,
				// 	where: {
				// 		is_deleted: false,
				// 	},
				// 	include: [{
				// 		model: models.Benefit,
				// 		as: 'benefit',
				// 		required: false,
				// 		where: {
				// 			is_deleted: false,
				// 		},
				// 	}],
				// },
				{
					model: models.ToursHost,
					as: 'toursHosts',
					required: false,
					where: {
						is_deleted: false,
					},
					include: [{
						model: models.User,
						as: 'host',
						attributes: ['user_id', 'email', 'user_name', 'level_id', 'is_tour_guide', 'avatar'],
						include: [{
							model: models.UsersLanguage,
							as: 'usersLanguages',
							required: false,
							where: {
								is_deleted: false,
							},
							include: [{
								model: models.Language,
								as: 'language',
							}],
						}],
					}, {
						model: models.ToursSchedule,
						as: 'toursSchedule',
					}, {
						model: models.Order,
						as: 'orders',
						required: false,
						where: {
							is_deleted: false,
						},
						include: [{
							model: models.ToursReview,
							as: 'toursReviews',
							required: false,
							where: {
								is_deleted: false,
							},
						}],
					}],
				},
				// {
				// 	model: models.ToursPlace,
				// 	as: 'toursPlaces',
				// 	required: false,
				// 	where: {
				// 		status: constants.TOURS_EDIT_APPROVED,
				// 		is_deleted: false,
				// 	},
				// }, {
				// 	model: models.ToursImage,
				// 	as: 'toursImages',
				// 	required: false,
				// 	where: {
				// 		status: constants.TOURS_EDIT_APPROVED,
				// 		is_deleted: false,
				// 	},
				// }
				],
			});
			if (tour) {
				// CHECK IF USER HAS PERMISSION TO VIEW TOUR
				if (tour.status !== constants.TOUR_PUBLISHED || !tour.is_shown) {
					if (!account || !((account.payload.level_id === constants.LEVEL_HOST && tour.host_id === account.payload.user_id) || account.payload.level_id === constants.LEVEL_ADMIN)) {
						return requestHandler.sendSuccess(res, 40001, 'No permission')();
					}
				}

				// GET BENEFITS OF TOUR
				const findAllToursBenefits = () => super.getAllList(req, 'ToursBenefit', {
					where: {
						tour_id: tour.tour_id,
						is_deleted: false,
					},
					include: [{
						model: models.Benefit,
						as: 'benefit',
						required: false,
						where: {
							is_deleted: false,
						},
					}],
				});

				// GET PLACES OF TOUR
				const findAllToursPlaces = () => super.getAllList(req, 'ToursPlace', {
					where: {
						tour_id: tour.tour_id,
						status: constants.TOURS_EDIT_APPROVED,
						is_deleted: false,
					},
				});

				// GET IMAGES OF TOUR
				const findAllToursImages = () => super.getAllList(req, 'ToursImage', {
					where: {
						tour_id: tour.tour_id,
						status: constants.TOURS_EDIT_APPROVED,
						is_deleted: false,
					},
				});

				const [toursBenefits, toursPlaces, toursImages] = await Promise.all([findAllToursBenefits(), findAllToursPlaces(), findAllToursImages()]);

				tour.dataValues.toursBenefits = toursBenefits;
				tour.dataValues.toursPlaces = toursPlaces;
				tour.dataValues.toursImages = toursImages;

				// GET ALL SUPPORTED LANGUAGES OF TOUR
				const languages = [];
				for (let indexToursHost = 0; indexToursHost < tour.toursHosts.length; indexToursHost += 1) {
					for (let indexUsersLanguage = 0; indexUsersLanguage < tour.toursHosts[indexToursHost].host.usersLanguages.length; indexUsersLanguage += 1) {
						languages.push(tour.toursHosts[indexToursHost].host.usersLanguages[indexUsersLanguage].language.name);
					}
				}
				tour.dataValues.languages = languages;

				// GET RATING OF TOUR
				let rating = 0;
				let numberOfReviews = 0;
				for (let indexToursHost = 0; indexToursHost < tour.toursHosts.length; indexToursHost += 1) {
					for (let indexOrder = 0; indexOrder < tour.toursHosts[indexToursHost].orders.length; indexOrder += 1) {
						for (let indexReview = 0; indexReview < tour.toursHosts[indexToursHost].orders[indexOrder].toursReviews.length; indexReview += 1) {
							rating += tour.toursHosts[indexToursHost].orders[indexOrder].toursReviews[indexReview].rating;
							numberOfReviews += 1;
						}
					}
				}
				tour.dataValues.rating = rating === 0 ? 0 : rating / numberOfReviews;

				// GET NUMBER OF COMPLETED ORDERS OF TOURS
				let numberOfCompletedOrders = 0;
				for (let indexToursHost = 0; indexToursHost < tour.toursHosts.length; indexToursHost += 1) {
					for (let indexOrder = 0; indexOrder < tour.toursHosts[indexToursHost].orders.length; indexOrder += 1) {
						if (tour.toursHosts[indexToursHost].orders[indexOrder].status === constants.ORDER_FINISHED) {
							numberOfCompletedOrders += 1;
						}
					}
				}
				tour.dataValues.number_of_completed_orders = numberOfCompletedOrders;

				// FILTER TOUR_HOSTS, TOUR_PLACES, TOUR_IMAGES
				if (!account || account.payload.level_id === constants.LEVEL_USER) {
					tour.dataValues.toursHosts = tour.dataValues.toursHosts.filter((toursHost) => toursHost.is_agreed === true);
					// tour.dataValues.toursPlaces = tour.dataValues.toursPlaces.filter((toursPlace) => toursPlace.status === constants.TOURS_EDIT_APPROVED);
					// tour.dataValues.toursImages = tour.dataValues.toursImages.filter((toursImage) => toursImage.status === constants.TOURS_EDIT_APPROVED);
				}
				return requestHandler.sendSuccess(res, 20001, 'Get data success')(tour);
			}
			return requestHandler.sendSuccess(res, 20002, 'No result')();
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}

	async updateShowStatusTour(req, res) {
		try {
			const tokenFromHeader = auth.getJwtToken(req);
			const account = jwt.decode(tokenFromHeader);

			const tour = await super.getByCustomOptions(req, 'Tour', {
				where: {
					tour_id: req.params.id,
					is_deleted: false,
				},
			});
			if (tour) {
				if (tour.host_id !== account.payload.user_id) {
					return requestHandler.sendFailure(res, 40001, 'No permission')();
				}
				tour.is_shown = !tour.is_shown;
				if (tour.save()) {
					return requestHandler.sendSuccess(res, 20001, 'Success')(tour);
				}
				return requestHandler.sendFailure(res, 40001, 'Unable to process the contained instructions')();
			}
			return requestHandler.sendFailure(res, 20002, 'No result')();
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}

	async updateStatusOfTour(req, res) {
		try {
			const tour = await super.getByCustomOptions(req, 'Tour', {
				where: {
					tour_id: req.params.id,
					is_deleted: false,
				},
			});
			if (tour) {
				if (req.body.status < 0 || req.body.status > 2) {
					return requestHandler.sendFailure(res, 40001, 'Field status: 0, 1, 2')();
				}
				tour.status = req.body.status;
				if (tour.save()) {
					return requestHandler.sendSuccess(res, 20001, 'Success')(tour);
				}
				return requestHandler.sendFailure(res, 40001, 'Unable to process the contained instructions')();
			}
			return requestHandler.sendFailure(res, 20002, 'No result')();
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}

	async createTour(req, res) {
		try {
			const tokenFromHeader = auth.getJwtToken(req);
			const account = jwt.decode(tokenFromHeader);

			// CHECK IF CITY_ID EXISTS
			const city = await super.getByCustomOptions(req, 'City', {
				where: {
					city_id: req.body.city_id,
					is_deleted: false,
				},
			});
			if (!city) {
				return requestHandler.sendFailure(res, 40002, 'Field city_id does not exist')();
			}

			// CHECK IF CATEGORY_ID EXISTS
			const category = await super.getByCustomOptions(req, 'Category', {
				where: {
					category_id: req.body.category_id,
					is_deleted: false,
				},
			});
			if (!category) {
				return requestHandler.sendFailure(res, 40002, 'Field category_id does not exist')();
			}

			// CHECK IF TRANSPORT_ID EXISTS
			const transport = await super.getByCustomOptions(req, 'Transport', {
				where: {
					transport_id: req.body.transport_id,
					is_deleted: false,
				},
			});
			if (!transport) {
				return requestHandler.sendFailure(res, 40002, 'Field transport_id does not exist')();
			}

			// CHECK IF SALE_PRICE < LIST_PRICE
			if (req.body.sale_price > req.body.list_price) {
				return requestHandler.sendFailure(res, 40002, 'Field sale_price can not greater than list_price')();
			}

			const createdTour = await super.create(req, 'Tour', {
				name: req.body.name,
				description: req.body.description,
				city_id: req.body.city_id,
				host_id: account.payload.user_id,
				list_price: req.body.list_price,
				sale_price: req.body.sale_price,
				max_people: req.body.max_people,
				duration: req.body.duration,
				meeting_address: req.body.meeting_address,
				category_id: req.body.category_id,
				transport_id: req.body.transport_id,
				cover_image: req.body.cover_image,
				is_shown: true,
				status: constants.TOUR_UNPUBLISHED,
			});
			if (createdTour) {
				// ADD HOST TO TOURS_HOSTS TABLE DATA
				const createdToursHost = await super.create(req, 'ToursHost', {
					tour_id: createdTour.dataValues.tour_id,
					host_id: account.payload.user_id,
					is_agreed: true,
				});

				// CREATE TOURS_BENEFITS DATA
				const toursBenefitsData = req.body.tours_benefits;
				for (let index = 0; index < toursBenefitsData.length; index += 1) {
					toursBenefitsData[index].tour_id = createdTour.dataValues.tour_id;
				}
				const createdToursBenefits = await super.bulkCreate(req, 'ToursBenefit', toursBenefitsData);

				// CREATE TOURS_PLACES DATA
				const toursPlacesData = req.body.tours_places;
				for (let index = 0; index < toursPlacesData.length; index += 1) {
					toursPlacesData[index].tour_id = createdTour.dataValues.tour_id;
					toursPlacesData[index].numerical_order = index;
					toursPlacesData[index].status = constants.TOURS_EDIT_APPROVED;
				}
				const createdToursPlaces = await super.bulkCreate(req, 'ToursPlace', toursPlacesData);

				// CREATE TOURS_IMAGES DATA
				const toursImagesData = req.body.tours_images;
				for (let index = 0; index < toursImagesData.length; index += 1) {
					toursImagesData[index].tour_id = createdTour.dataValues.tour_id;
					toursImagesData[index].status = constants.TOURS_EDIT_APPROVED;
				}
				const createdToursImages = await super.bulkCreate(req, 'ToursImage', toursImagesData);

				if (createdToursHost && createdToursBenefits && createdToursPlaces && createdToursImages) {
					return requestHandler.sendSuccess(res, 20001, 'Success')(createdTour);
				}
				return requestHandler.sendFailure(res, 40001, 'Unable to process the contained instructions')();
			}
			return requestHandler.sendFailure(res, 40001, 'Unable to process the contained instructions')();
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}

	async updateTour(req, res) {
		try {
			const tokenFromHeader = auth.getJwtToken(req);
			const account = jwt.decode(tokenFromHeader);

			// CHECK IF CITY_ID EXISTS
			const city = await super.getByCustomOptions(req, 'City', {
				where: {
					city_id: req.body.city_id,
					is_deleted: false,
				},
			});
			if (!city) {
				return requestHandler.sendFailure(res, 40002, 'Field city_id does not exist')();
			}

			// CHECK IF CATEGORY_ID EXISTS
			const category = await super.getByCustomOptions(req, 'Category', {
				where: {
					category_id: req.body.category_id,
					is_deleted: false,
				},
			});
			if (!category) {
				return requestHandler.sendFailure(res, 40002, 'Field category_id does not exist')();
			}

			// CHECK IF TRANSPORT_ID EXISTS
			const transport = await super.getByCustomOptions(req, 'Transport', {
				where: {
					transport_id: req.body.transport_id,
					is_deleted: false,
				},
			});
			if (!transport) {
				return requestHandler.sendFailure(res, 40002, 'Field transport_id does not exist')();
			}

			// CHECK IF SALE_PRICE < LIST_PRICE
			if (req.body.sale_price > req.body.list_price) {
				return requestHandler.sendFailure(res, 40002, 'Field sale_price can not greater than list_price')();
			}

			// CHECK IF TOUR_ID EXISTS
			const tour = await super.getByCustomOptions(req, 'Tour', {
				where: {
					tour_id: req.params.id,
					is_deleted: false,
				},
				include: [{
					model: models.ToursBenefit,
					as: 'toursBenefits',
					required: false,
					where: {
						is_deleted: false,
					},
				}, {
					model: models.ToursPlace,
					as: 'toursPlaces',
					required: false,
					where: {
						status: constants.TOURS_EDIT_APPROVED,
						is_deleted: false,
					},
				}, {
					model: models.ToursImage,
					as: 'toursImages',
					required: false,
					where: {
						status: constants.TOURS_EDIT_APPROVED,
						is_deleted: false,
					},
				}],
			});

			if (!tour) {
				return requestHandler.sendFailure(res, 40002, 'Field tour_id does not exist')();
			}

			// CHECK PERMISSION
			if (account.payload.user_id !== tour.host_id) {
				return requestHandler.sendFailure(res, 40001, 'No permission')();
			}

			// UPDATE DATA THAT DO NOT NEED ADMIN TO APPROVE [BEGIN]
			tour.list_price = req.body.list_price;
			tour.sale_price = req.body.sale_price;
			tour.max_people = req.body.max_people;
			tour.duration = req.body.duration;

			// IF TOUR'S STATUS IS REJECTED, UPDATE TO UNPUBLISHED
			if (tour.status === constants.TOUR_REJECTED) {
				tour.status = constants.TOUR_UNPUBLISHED;
			}

			for (let index = 0; index < tour.toursBenefits.length; index += 1) {
				tour.toursBenefits[index].is_deleted = true;
				tour.toursBenefits[index].save();
			}
			// CHECK IF ALL BENEFIT_IDS EXIST
			const benefits = await super.getAllList(req, 'Benefit', {
				where: {
					is_deleted: false,
				},
			});
			const benefitIds = [];
			for (let index = 0; index < benefits.length; index += 1) {
				benefitIds.push(benefits[index].benefit_id);
			}
			const toursBenefitsData = req.body.tours_benefits;
			for (let index = 0; index < toursBenefitsData.length; index += 1) {
				if (!benefitIds.includes(toursBenefitsData[index].benefit_id)) {
					return requestHandler.sendFailure(res, 40001, 'At least one benefit_id does not exist')();
				}
				toursBenefitsData[index].tour_id = tour.tour_id;
			}
			const createdToursBenefits = await super.bulkCreate(req, 'ToursBenefit', toursBenefitsData);
			// UPDATE DATA THAT DO NOT NEED ADMIN TO APPROVE [END]

			// IF TOUR IS UNPUBLISHED, UPDATE DIRECTLY TO TOUR TABLE [BEGIN]
			if (tour.status === constants.TOUR_UNPUBLISHED) {
				tour.name = req.body.name;
				tour.description = req.body.description;
				tour.city_id = req.body.city_id;
				tour.meeting_address = req.body.meeting_address;
				tour.category_id = req.body.category_id;
				tour.transport_id = req.body.transport_id;
				tour.cover_image = req.body.cover_image;

				for (let index = 0; index < tour.toursPlaces.length; index += 1) {
					tour.toursPlaces[index].is_deleted = true;
					tour.toursPlaces[index].save();
				}
				const toursPlacesData = req.body.tours_places;
				for (let index = 0; index < toursPlacesData.length; index += 1) {
					toursPlacesData[index].tour_id = tour.tour_id;
					toursPlacesData[index].numerical_order = index;
					toursPlacesData[index].status = constants.TOURS_EDIT_APPROVED;
				}
				const createdToursPlaces = await super.bulkCreate(req, 'ToursPlace', toursPlacesData);
				if (tour.save() && createdToursBenefits && createdToursPlaces) {
					tour.dataValues.has_data_changed = false;
					return requestHandler.sendSuccess(res, 20001, 'Success')(tour);
				}
			}
			// IF TOUR IS UNPUBLISHED, UPDATE DIRECTLY TO TOUR TABLE [END]

			// IF TOUR_ID EXIST IN TOURS_EDITS TABLE, MODIFY THAT RECORD [BEGIN]
			const toursEdit = await super.getByCustomOptions(req, 'ToursEdit', {
				where: {
					tour_id: req.params.id,
					status: constants.TOURS_EDIT_PENDING,
					is_deleted: false,
				},
				include: [{
					model: models.ToursPlace,
					as: 'toursPlaces',
					required: false,
					where: {
						status: constants.TOURS_EDIT_PENDING,
						is_deleted: false,
					},
				}],
			});
			if (toursEdit) {
				toursEdit.name = req.body.name;
				toursEdit.description = req.body.description;
				toursEdit.city_id = req.body.city_id;
				toursEdit.meeting_address = req.body.meeting_address;
				toursEdit.category_id = req.body.category_id;
				toursEdit.transport_id = req.body.transport_id;
				toursEdit.cover_image = req.body.cover_image;
				// DELETE OLD PLACES
				for (let index = 0; index < toursEdit.toursPlaces.length; index += 1) {
					toursEdit.toursPlaces[index].is_deleted = true;
					toursEdit.toursPlaces[index].save();
				}
				// ADD NEW PLACES
				const toursPlacesData = req.body.tours_places;
				for (let index = 0; index < toursPlacesData.length; index += 1) {
					toursPlacesData[index].tour_id = tour.tour_id;
					toursPlacesData[index].tours_edit_id = toursEdit.tours_edit_id;
					toursPlacesData[index].numerical_order = index;
					toursPlacesData[index].status = constants.TOURS_EDIT_PENDING;
				}
				const createdToursPlaces = await super.bulkCreate(req, 'ToursPlace', toursPlacesData);
				if (tour.save() && toursEdit.save() && createdToursBenefits && createdToursPlaces) {
					tour.dataValues.has_data_changed = false;
					return requestHandler.sendSuccess(res, 20001, 'Success')(tour);
				}
			}
			// IF TOUR_ID EXIST IN TOURS_EDITS TABLE, MODIFY THAT RECORD [END]

			// CHECK IF THERE IS UPDATED DATA THAT NEED ADMIN TO APPROVE
			let isDataChanged = false;
			if (tour.name !== req.body.name
				|| tour.description !== req.body.description
				|| tour.city_id !== req.body.city_id
				|| tour.meeting_address !== req.body.meeting_address
				|| tour.category_id !== req.body.category_id
				|| tour.transport_id !== req.body.transport_id
				|| tour.cover_image !== req.body.cover_image) {
				isDataChanged = true;
			}
			if (tour.toursPlaces.length === req.body.tours_places.length) {
				for (let index = 0; index < req.body.tours_places.length; index += 1) {
					if (tour.toursPlaces[index].place_name !== req.body.tours_places[index].place_name
						|| tour.toursPlaces[index].description !== req.body.tours_places[index].description) {
						isDataChanged = true;
						break;
					}
				}
			} else {
				isDataChanged = true;
			}

			// IF TOUR_ID DOES NOT EXIST IN TOURS_EDITS TABLE, CREATE NEW RECORD
			if (isDataChanged) {
				const createdToursEdit = await super.create(req, 'ToursEdit', {
					tour_id: tour.tour_id,
					name: req.body.name,
					description: req.body.description,
					city_id: req.body.city_id,
					meeting_address: req.body.meeting_address,
					category_id: req.body.category_id,
					transport_id: req.body.transport_id,
					cover_image: req.body.cover_image,
					status: constants.TOURS_EDIT_PENDING,
				});
				if (createdToursEdit) {
					// CREATE TOURS_PLACES DATA
					const toursPlacesData = req.body.tours_places;
					for (let index = 0; index < toursPlacesData.length; index += 1) {
						toursPlacesData[index].tour_id = tour.tour_id;
						toursPlacesData[index].tours_edit_id = createdToursEdit.tours_edit_id;
						toursPlacesData[index].numerical_order = index;
						toursPlacesData[index].status = constants.TOURS_EDIT_PENDING;
					}
					const createdToursPlaces = await super.bulkCreate(req, 'ToursPlace', toursPlacesData);
					if (tour.save() && createdToursBenefits && createdToursPlaces) {
						tour.dataValues.has_data_changed = true;
						return requestHandler.sendSuccess(res, 20001, 'Success')(tour);
					}
					return requestHandler.sendFailure(res, 40001, 'Unable to process the contained instructions')();
				}
			}

			if (tour.save() && createdToursBenefits) {
				tour.dataValues.has_data_changed = false;
				return requestHandler.sendSuccess(res, 20001, 'Success')(tour);
			}
			return requestHandler.sendFailure(res, 40001, 'Unable to process the contained instructions')();
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}

	async deleteTour(req, res) {
		try {
			const tokenFromHeader = auth.getJwtToken(req);
			const account = jwt.decode(tokenFromHeader);

			// CHECK IF TOUR_ID EXISTS
			const tour = await super.getByCustomOptions(req, 'Tour', {
				where: {
					tour_id: req.params.id,
					is_deleted: false,
				},
				include: [{
					model: models.ToursBenefit,
					as: 'toursBenefits',
					required: false,
					where: {
						is_deleted: false,
					},
				}, {
					model: models.ToursHost,
					as: 'toursHosts',
					required: false,
					where: {
						is_deleted: false,
					},
					include: [{
						model: models.Order,
						as: 'orders',
						required: false,
						where: {
							is_deleted: false,
						},
						include: [{
							model: models.ToursReview,
							as: 'toursReviews',
							required: false,
							where: {
								is_deleted: false,
							},
						}],
					}]
				}, {
					model: models.ToursPlace,
					as: 'toursPlaces',
					required: false,
					where: {
						is_deleted: false,
					},
				}, {
					model: models.ToursImage,
					as: 'toursImages',
					required: false,
					where: {
						is_deleted: false,
					},
				}, {
					model: models.ToursEdit,
					as: 'toursEdits',
					required: false,
					where: {
						is_deleted: false,
					},
				}],
			});

			if (!tour) {
				return requestHandler.sendFailure(res, 40002, 'Field tour_id does not exist')();
			}

			// CHECK PERMISSION
			if (account.payload.level_id !== constants.LEVEL_ADMIN && account.payload.user_id !== tour.host_id) {
				return requestHandler.sendFailure(res, 40001, 'No permission')();
			}

			tour.is_deleted = true;

			for (let index = 0; index < tour.toursBenefits.length; index += 1) {
				tour.toursBenefits[index].is_deleted = true;
				tour.toursBenefits[index].save();
			}
			for (let index = 0; index < tour.toursHosts.length; index += 1) {
				tour.toursHosts[index].is_deleted = true;
				tour.toursHosts[index].save();

				for (let indexOrder = 0; indexOrder < tour.toursHosts[index].orders.length; indexOrder += 1) {
					for (let indexReview = 0; indexReview < tour.toursHosts[index].orders[indexOrder].toursReviews.length; indexReview += 1) {
						tour.toursHosts[index].orders[indexOrder].toursReviews[indexReview].is_deleted = true;
						tour.toursHosts[index].orders[indexOrder].toursReviews[indexReview].save();
					}
				}
			}
			for (let index = 0; index < tour.toursPlaces.length; index += 1) {
				tour.toursPlaces[index].is_deleted = true;
				tour.toursPlaces[index].save();
			}
			for (let index = 0; index < tour.toursImages.length; index += 1) {
				tour.toursImages[index].is_deleted = true;
				tour.toursImages[index].save();
			}
			for (let index = 0; index < tour.toursEdits.length; index += 1) {
				tour.toursEdits[index].is_deleted = true;
				tour.toursEdits[index].save();
			}

			if (tour.save()) {
				return requestHandler.sendSuccess(res, 20001, 'Success')(tour);
			}
			return requestHandler.sendFailure(res, 40001, 'Unable to process the contained instructions')();
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}

	async getMasterData(req, res) {
		try {
			const benefits = await super.getAllList(req, 'Benefit', {
				where: {
					is_deleted: false,
				},
			});
			const categories = await super.getAllList(req, 'Category', {
				where: {
					is_deleted: false,
				},
			});
			const transports = await super.getAllList(req, 'Transport', {
				where: {
					is_deleted: false,
				},
			});
			if (benefits.length || categories.length || transports.length) {
				const data = {
					benefits,
					categories,
					transports,
				};
				return requestHandler.sendSuccess(res, 20001, 'Get Success')(data);
			}
			return requestHandler.sendSuccess(res, 20002, 'No result')();
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}

	// eslint-disable-next-line class-methods-use-this, consistent-return
	async uploadImages(req, res) {
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
				return service.uploadFile(req, file.file.path, `${process.env.AWS_S3_ALBUM_TOUR_COVER_IMAGE_NAME}/${newName}`, fileType, res);
			});
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}
}
module.exports = new ToursController();
