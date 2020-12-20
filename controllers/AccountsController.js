/* eslint-disable max-len */
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const formidable = require('formidable');
const BaseController = require('./BaseController');
const RequestHandler = require('../utils/RequestHandler');
const stringUtil = require('../utils/stringUtil');
const Logger = require('../utils/logger');
const auth = require('../utils/auth');
const config = require('../config/app');
const models = require('../models');
const service = require('../utils/service');
const columnName = require('../utils/columnName');
const constants = require('../utils/constants');

const logger = new Logger();
const requestHandler = new RequestHandler(logger);

class AccountsController extends BaseController {
	async getProfile(req, res) {
		try {
			const tokenFromHeader = auth.getJwtToken(req);
			const account = jwt.decode(tokenFromHeader);

			const user = await super.getByCustomOptions(req, 'User', {
				where: {
					user_id: account.payload.user_id,
					is_verified: true,
					is_deleted: false,
				},
				include: [{
					model: models.Level,
					as: 'level',
				}, {
					model: models.UsersLanguage,
					as: 'usersLanguages',
					include: [{
						model: models.Language,
						as: 'language',
					}],
				}, {
					model: models.City,
					as: 'city',
					include: [{
						model: models.Country,
						as: 'country',
					}],
				}],
			});
			if (!user) {
				requestHandler.sendFailure(res, 42801, 'Account does not exist')();
			}
			const profile = _.omit(user.dataValues, ['password', 'one_time_password', 'one_time_password_period', 'is_deleted', 'createdAt', 'updatedAt']);

			return requestHandler.sendSuccess(res, 20001, 'Get data success')(profile);
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}

	async updateProfile(req, res) {
		try {
			const data = req.body;
			const tokenFromHeader = auth.getJwtToken(req);
			const account = jwt.decode(tokenFromHeader);

			const user = await super.getByCustomOptions(req, 'User', {
				where: {
					user_id: account.payload.user_id,
					is_verified: true,
					is_deleted: false,
				},
			});
			if (!user) {
				requestHandler.sendFailure(res, 40308, 'Account does not exist')();
			}

			// CHECK IF CITY_ID EXISTS
			if (data.city_id) {
				const city = await super.getByCustomOptions(req, 'City', {
					where: {
						city_id: data.city_id,
						is_deleted: false,
					},
				});
				if (!city) {
					return requestHandler.sendFailure(res, 40322, 'Field city_id does not exist')();
				}
			}
			
			// CHECK IF LANGUAGE_ID EXISTS
			let languageIds;
			if (data.language_ids) {
				languageIds = req.body.language_ids.replace(/ /g, '').split(',');
				if (req.body.language_ids.length) {
					for (let indexLanguage = 0; indexLanguage < languageIds.length; indexLanguage += 1) {
						if (languageIds[indexLanguage].length === 0) {
							return requestHandler.sendFailure(res, 43902, 'Field language_ids is incorrect format')();
						}
						for (let indexChar = 0; indexChar < languageIds[indexLanguage].length; indexChar += 1) {
							// eslint-disable-next-line no-restricted-globals
							if (isNaN(languageIds[indexLanguage][indexChar])) {
								return requestHandler.sendFailure(res, 43902, 'Field language_ids is incorrect format')();
							}
						}
					}

					// CHECK IF ALL LANGUAGE_ID EXISTS
					const languages = await super.getAllList(req, 'Language', {
						where: {
							language_id: { [Op.in]: languageIds },
						},
					});
					if (languages.length !== languageIds.length) {
						return requestHandler.sendFailure(res, 20002, 'At least one of language_ids does not exist')();
					}
				}
			}
			const dataUpdate = {
				user_name: data.user_name,
				avatar: data.avatar,
				introduction_video: data.introduction_video,
				self_introduction: data.self_introduction,
				city_id: data.city_id,
				phone_number: data.phone_number,
			};

			const updatedUser = await super.updateByCustomWhere(req, 'User', dataUpdate, {
				where: {
					user_id: account.payload.user_id,
					is_verified: true,
					is_deleted: false,
				},
			});
			if (!_.isNull(updatedUser)) {
				await super.deleteByCustomOptions(req, 'UsersLanguage', {
					where: {
						user_id: account.payload.user_id,
					},
				});
				if (req.body.language_ids && req.body.language_ids.length) {
					const createdUsersLanguages = await Promise.all(languageIds.map(async (languageId) => {
						const dataUsersLanguage = {
							user_id: account.payload.user_id,
							language_id: languageId,
						};
						await super.create(req, 'UsersLanguage', dataUsersLanguage);
					}));
					if (createdUsersLanguages) {
						return requestHandler.sendSuccess(res, 20001, 'Update profile success')(dataUpdate);
					}
					return requestHandler.sendFailure(res, 40001, 'Unable to process the contained instructions')();
				}
				return requestHandler.sendSuccess(res, 20001, 'Update profile success')(dataUpdate);
			}
			return requestHandler.sendFailure(res, 40001, 'Unable to process the contained instructions')();
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}

	async requestToBeHost(req, res) {
		try {
			const tokenFromHeader = auth.getJwtToken(req);
			const account = jwt.decode(tokenFromHeader);

			const user = await super.getByCustomOptions(req, 'User', {
				where: {
					user_id: account.payload.user_id,
					is_verified: true,
					is_deleted: false,
				},
			});
			if (!user) {
				requestHandler.sendFailure(res, 40308, 'Account does not exist')();
			}

			const formData = new formidable.IncomingForm();
			formData.parse(req, async (err, fields, file) => {
				if (err) {
					return requestHandler.sendFailure(res, 40001, err.message)();
				}

				// CHECK IF CITY_ID EXISTS
				if (fields.city_id) {
					const city = await super.getByCustomOptions(req, 'City', {
						where: {
							city_id: fields.city_id,
							is_deleted: false,
						},
					});
					if (!city) {
						return requestHandler.sendFailure(res, 40322, 'Field city_id does not exist')();
					}
				}
				
				// CHECK IF LANGUAGE_ID EXISTS
				let languageIds = [];
				if (fields.language_ids) {
					languageIds = fields.language_ids.replace(/ /g, '').split(',');
					if (fields.language_ids.length) {
						for (let indexLanguage = 0; indexLanguage < languageIds.length; indexLanguage += 1) {
							if (languageIds[indexLanguage].length === 0) {
								return requestHandler.sendFailure(res, 43902, 'Field language_ids is incorrect format')();
							}
							for (let indexChar = 0; indexChar < languageIds[indexLanguage].length; indexChar += 1) {
								// eslint-disable-next-line no-restricted-globals
								if (isNaN(languageIds[indexLanguage][indexChar])) {
									return requestHandler.sendFailure(res, 43902, 'Field language_ids is incorrect format')();
								}
							}
						}

						// CHECK IF ALL LANGUAGE_ID EXISTS
						const languages = await super.getAllList(req, 'Language', {
							where: {
								language_id: { [Op.in]: languageIds },
							},
						});
						if (languages.length !== languageIds.length) {
							return requestHandler.sendFailure(res, 20002, 'At least one of language_ids does not exist')();
						}
					}
				}

				// UPLOAD INTRODUCTION VIDEO
				let introductionVideoLink = null;
				if (file.introduction_video && file.introduction_video.name) {
					const fileName = file.introduction_video.name;
					const fileType = file.introduction_video.type;
					const name = fileName.substr(0, fileName.lastIndexOf('.'));
					const extension = fileName.substr(fileName.lastIndexOf('.'));
					if (extension !== '.mp4' && extension !== '.webm' && extension !== '.ogg') {
						return requestHandler.sendFailure(res, 40001, 'Invalid introduction video')();
					}
					const newName = name + new Date().getTime() + extension;
					introductionVideoLink = await service.getFileLink(req, file.introduction_video.path, `${process.env.AWS_S3_ALBUM_INTRODUCTION_VIDEO_NAME}/${newName}`, fileType, res);
				}

				const dataUpdate = {
					user_name: fields.user_name,
					introduction_video: introductionVideoLink ? introductionVideoLink : user.introduction_video,
					self_introduction: fields.self_introduction,
					city_id: fields.city_id,
					phone_number: fields.phone_number,
					request_status: constants.HOST_REQUEST_PENDING,
				};

				const updatedUser = await super.updateByCustomWhere(req, 'User', dataUpdate, {
					where: {
						user_id: account.payload.user_id,
						is_verified: true,
						is_deleted: false,
					},
				});
				if (!_.isNull(updatedUser)) {
					await super.deleteByCustomOptions(req, 'UsersLanguage', {
						where: {
							user_id: account.payload.user_id,
						},
					});
					if (fields.language_ids && fields.language_ids.length) {
						const createdUsersLanguages = await Promise.all(languageIds.map(async (languageId) => {
							const dataUsersLanguage = {
								user_id: account.payload.user_id,
								language_id: languageId,
							};
							await super.create(req, 'UsersLanguage', dataUsersLanguage);
						}));
						if (createdUsersLanguages) {
							return requestHandler.sendSuccess(res, 20001, 'Update profile success')();
						}
						return requestHandler.sendFailure(res, 40001, 'Unable to process the contained instructions')();
					}
					return requestHandler.sendSuccess(res, 20001, 'Update profile success')();
				}
				return requestHandler.sendFailure(res, 40001, 'Unable to process the contained instructions')();
			});


			// const data = stringUtil.trimObject(req.body);
			// const tokenFromHeader = auth.getJwtToken(req);
			// const account = jwt.decode(tokenFromHeader);

			// const user = await super.getByCustomOptions(req, 'User', {
			// 	where: {
			// 		user_id: account.payload.user_id,
			// 		is_verified: true,
			// 		is_deleted: false,
			// 	},
			// });
			// if (!user) {
			// 	requestHandler.sendFailure(res, 40308, 'Account does not exist')();
			// }

			// // CHECK IF CITY_ID EXISTS
			// if (data.city_id) {
			// 	const city = await super.getByCustomOptions(req, 'City', {
			// 		where: {
			// 			city_id: data.city_id,
			// 			is_deleted: false,
			// 		},
			// 	});
			// 	if (!city) {
			// 		return requestHandler.sendFailure(res, 40322, 'Field city_id does not exist')();
			// 	}
			// }
			
			// // CHECK IF LANGUAGE_ID EXISTS
			// if (data.language_ids) {
			// 	const languageIds = req.body.language_ids.replace(/ /g, '').split(',');
			// 	if (req.body.language_ids.length) {
			// 		for (let indexLanguage = 0; indexLanguage < languageIds.length; indexLanguage += 1) {
			// 			if (languageIds[indexLanguage].length === 0) {
			// 				return requestHandler.sendFailure(res, 43902, 'Field language_ids is incorrect format')();
			// 			}
			// 			for (let indexChar = 0; indexChar < languageIds[indexLanguage].length; indexChar += 1) {
			// 				// eslint-disable-next-line no-restricted-globals
			// 				if (isNaN(languageIds[indexLanguage][indexChar])) {
			// 					return requestHandler.sendFailure(res, 43902, 'Field language_ids is incorrect format')();
			// 				}
			// 			}
			// 		}

			// 		// CHECK IF ALL LANGUAGE_ID EXISTS
			// 		const languages = await super.getAllList(req, 'Language', {
			// 			where: {
			// 				language_id: { [Op.in]: languageIds },
			// 			},
			// 		});
			// 		if (languages.length !== languageIds.length) {
			// 			return requestHandler.sendFailure(res, 20002, 'At least one of language_ids does not exist')();
			// 		}
			// 	}
			// }
			// const dataUpdate = {
			// 	user_name: data.user_name,
			// 	avatar: data.avatar,
			// 	introduction_video: data.introduction_video,
			// 	self_introduction: data.self_introduction,
			// 	city_id: data.city_id,
			// 	phone_number: data.phone_number,
			// 	request_status: data.request_status,
			// };

			// const updatedUser = await super.updateByCustomWhere(req, 'User', dataUpdate, {
			// 	where: {
			// 		user_id: account.payload.user_id,
			// 		is_verified: true,
			// 		is_deleted: false,
			// 	},
			// });
			// if (!_.isNull(updatedUser)) {
			// 	await super.deleteByCustomOptions(req, 'UsersLanguage', {
			// 		where: {
			// 			user_id: account.payload.user_id,
			// 		},
			// 	});
			// 	if (req.body.language_ids && req.body.language_ids.length) {
			// 		const createdUsersLanguages = await Promise.all(languageIds.map(async (languageId) => {
			// 			const dataUsersLanguage = {
			// 				user_id: account.payload.user_id,
			// 				language_id: languageId,
			// 			};
			// 			await super.create(req, 'UsersLanguage', dataUsersLanguage);
			// 		}));
			// 		if (createdUsersLanguages) {
			// 			return requestHandler.sendSuccess(res, 20001, 'Update profile success')();
			// 		}
			// 		return requestHandler.sendFailure(res, 40001, 'Unable to process the contained instructions')();
			// 	}
			// 	return requestHandler.sendSuccess(res, 20001, 'Update profile success')();
			// }
			// return requestHandler.sendFailure(res, 40001, 'Unable to process the contained instructions')();
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}

	async changePassword(req, res) {
		try {
			const data = req.body;
			const tokenFromHeader = auth.getJwtToken(req);
			const account = jwt.decode(tokenFromHeader);

			const user = await super.getByCustomOptions(req, 'User', {
				where: {
					user_id: account.payload.user_id,
					is_verified: true,
					is_deleted: false,
				},
			});
			if (!user) {
				return requestHandler.sendFailure(res, 40505, 'Account does not exist')();
			}

			// CHECK IF PASSWORD IS CORRECT
			let isCorrect = false;
			await bcrypt.compare(req.body.password, user.password).then((r) => {
				isCorrect = r;
			});
			if (!isCorrect) {
				return requestHandler.sendFailure(res, 40501, 'Incorrect PASSWORD')();
			}

			user.password = bcrypt.hashSync(data.new_password, config.auth.saltRounds);
			if (user.save()) {
				return requestHandler.sendSuccess(res, 20001, 'Update password success')();
			}
			return requestHandler.sendFailure(res, 40001, 'Unable to process the contained instructions')();
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}

	async getUsers(req, res) {
		try {
			let page = req.query.page ? Number(req.query.page) : 1;
			const limit = req.query.limit ? Number(req.query.limit) : 10;
			let startIndex = (page - 1) * limit;
			const condition = {};
			condition.is_deleted = false;
			// condition.level_id = { [Op.in]: [2, 3] };
			if (req.query.email) {
				condition.email = { [Op.substring]: req.query.email };
			}
			if (req.query.user_name) {
				condition.user_name = { [Op.substring]: req.query.user_name };
			}
			if (req.query.level_id) {
				condition.level_id = Number(req.query.level_id);
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
				condition.city_id = Number(req.query.city_id);
			}
			if (req.query.is_tour_guide) {
				condition.is_tour_guide = req.query.is_tour_guide === 'true';
			}
			if (req.query.is_verified) {
				condition.is_verified = req.query.is_verified === 'true';
			}
			if (req.query.created_at) {
				condition.createdAt = {
					[Op.gte]: new Date(`${req.query.created_at}T00:00:00.000+00:00`),
					[Op.lte]: new Date(`${req.query.created_at}T23:59:59.000+00:00`),
				};
			}

			const allUsers = await super.getAllList(req, 'User', {
				where: condition,
				include: [{
					model: models.Level,
					as: 'level',
				}, {
					model: models.City,
					as: 'city',
					include: [{
						model: models.Country,
						as: 'country',
					}],
				}, {
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
				}, {
					model: models.Order,
					as: 'orders',
				}, {
					model: models.Tour,
					as: 'tours',
				}],
			});

			allUsers.forEach((user) => {
				user.dataValues = _.omit(user.dataValues, ['password', 'one_time_password', 'one_time_password_period', 'is_deleted']);
			});

			const totalPage = Math.ceil(allUsers.length / limit);

			if (page > totalPage) {
				page = totalPage;
				startIndex = (page - 1) * limit;
			}

			let users;
			const orderType = Number(req.query.order_type);
			switch (orderType) {
			case 1: // id DESC (created_at DESC)
				users = allUsers.sort((user1, user2) => user2.user_id - user1.user_id);
				break;
			case 2: // id ASC (created_at ASC)
				users = allUsers.sort((user1, user2) => user1.user_id - user2.user_id);
				break;
			case 3: // user_name DESC
				users = allUsers.sort((user1, user2) => user2.user_name.localeCompare(user1.user_name));
				break;
			case 4: // user_name ASC
				users = allUsers.sort((user1, user2) => user1.user_name.localeCompare(user2.user_name));
				break;
			case 5: // email DESC
				users = allUsers.sort((user1, user2) => user2.email.localeCompare(user1.email));
				break;
			case 6: // email ASC
				users = allUsers.sort((user1, user2) => user1.email.localeCompare(user2.email));
				break;
			case 7: // number of orders DESC
				users = allUsers.sort((user1, user2) => user2.orders.length - user1.orders.length);
				break;
			case 8: // number of orders ASC
				users = allUsers.sort((user1, user2) => user1.orders.length - user2.orders.length);
				break;
			case 9: // number of tours DESC
				users = allUsers.sort((user1, user2) => user2.tours.length - user1.tours.length);
				break;
			case 10: // number of tours ASC
				users = allUsers.sort((user1, user2) => user1.tours.length - user2.tours.length);
				break;
			case 11: // updated_at DESC
				users = allUsers.sort((user1, user2) => user2.updatedAt.getTime() - user1.updatedAt.getTime());
				break;
			case 12: // updated_at ASC
				users = allUsers.sort((user1, user2) => user1.updatedAt.getTime() - user2.updatedAt.getTime());
				break;
			default:
				users = allUsers;
			}

			const offset = startIndex > 0 ? startIndex : 0;
			users = users.slice(offset, offset + limit);

			const result = {
				total: allUsers.length,
				per_page: limit,
				current_page: page,
				last_page: totalPage,
				from: startIndex + 1,
				to: startIndex + users.length,
				data: users,
			};

			return requestHandler.sendSuccess(res, 20001, 'Get data success')(result);
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}

	async getUser(req, res) {
		try {
			const user = await super.getByCustomOptions(req, 'User', {
				where: {
					user_id: req.params.id,
					is_deleted: false,
				},
				include: [{
					model: models.Level,
					as: 'level',
				}, {
					model: models.City,
					as: 'city',
					include: [{
						model: models.Country,
						as: 'country',
					}],
				}, {
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
				}, {
					model: models.Order,
					as: 'orders',
				}],
			});
			if (user) {
				// CHECK PERMISSION
				const tokenFromHeader = auth.getJwtToken(req);
				const account = jwt.decode(tokenFromHeader);
				if (user.level_id !== constants.LEVEL_HOST && (!account || account.payload.level_id !== constants.LEVEL_ADMIN)) {
					return requestHandler.sendFailure(res, 40001, 'No permission')();
				}

				// GET ALL TOURS OF THIS HOST
				const tours = await super.getAllList(req, 'Tour', {
					where: {
						host_id: req.params.id,
						is_shown: true,
						status: constants.TOUR_PUBLISHED,
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
				for (let indexTour = 0; indexTour < tours.length; indexTour += 1) {
					let rating = 0;
					let numberOfReviews = 0;
					for (let indexToursHost = 0; indexToursHost < tours[indexTour].toursHosts.length; indexToursHost += 1) {
						for (let indexOrder = 0; indexOrder < tours[indexTour].toursHosts[indexToursHost].orders.length; indexOrder += 1) {
							for (let indexReview = 0; indexReview < tours[indexTour].toursHosts[indexToursHost].orders[indexOrder].toursReviews.length; indexReview += 1) {
								rating += tours[indexTour].toursHosts[indexToursHost].orders[indexOrder].toursReviews[indexReview].rating;
								numberOfReviews += 1;
							}
						}
					}
					tours[indexTour].dataValues.rating = rating === 0 ? 0 : rating / numberOfReviews;
					tours[indexTour].dataValues.number_of_reviews = numberOfReviews;
				}

				// GET ALL HOSTS REVIEWS OF THIS HOST
				const hostsReviews = await super.getAllList(req, 'HostsReview', {
					where: {
						host_id: req.params.id,
						is_deleted: false,
					},
				});
				user.dataValues.number_of_reviews = hostsReviews.length;
				user.dataValues.rating = Number((hostsReviews.reduce((a, b) => a + (b['rating'] || 0), 0) / hostsReviews.length).toFixed(2));
				
				user.dataValues = _.omit(user.dataValues, ['password', 'one_time_password', 'one_time_password_period', 'is_deleted']);
				const data = {
					user: user,
					tours: tours
				}
				return requestHandler.sendSuccess(res, 20001, 'Get data success')(data);
			}
			return requestHandler.sendSuccess(res, 20002, 'No result')();
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}

	async updateTourGuideStatusUser(req, res) {
		try {
			const user = await super.getByCustomOptions(req, 'User', {
				where: {
					user_id: req.params.id,
					is_deleted: false,
				},
			});
			if (!user) {
				return requestHandler.sendFailure(res, 40505, 'Account does not exist')();
			}

			// CHECK IF USER IS HOST
			if (user.level_id !== constants.LEVEL_HOST) {
				return requestHandler.sendFailure(res, 40002, 'User is not host')();
			}

			user.is_tour_guide = !user.is_tour_guide;
			if (user.save()) {
				return requestHandler.sendSuccess(res, 20001, 'Success')();
			}
			return requestHandler.sendFailure(res, 40001, 'Unable to process the contained instructions')();
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}

	async deleteUser(req, res) {
		try {
			const user = await super.getByCustomOptions(req, 'User', {
				where: {
					user_id: req.params.id,
					is_deleted: false,
				},
				include: [{
					model: models.UsersLanguage,
					as: 'usersLanguages',
					required: false,
					where: {
						is_deleted: false,
					},
				}, {
					model: models.HostsReview,
					as: 'hostsReviews',
					required: false,
					where: {
						is_deleted: false,
					},
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
				}, {
					model: models.Tour,
					as: 'tours',
					required: false,
					where: {
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
							model: models.ToursSchedule,
							as: 'toursSchedule',
							required: false,
							where: {
								is_deleted: false,
							},
						}],
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
					}],
				}],
			});
			if (!user) {
				return requestHandler.sendFailure(res, 40505, 'Account does not exist')();
			}

			// DELETE USER
			user.is_deleted = true;
			if (user.save()) {
				// DELETE ALL ASSOCIATION MODELS
				for (let index = 0; index < user.usersLanguages.length; index += 1) {
					user.usersLanguages[index].is_deleted = true;
					user.usersLanguages[index].save();
				}
				for (let index = 0; index < user.hostsReviews.length; index += 1) {
					user.hostsReviews[index].is_deleted = true;
					user.hostsReviews[index].save();
				}
				for (let indexOrder = 0; indexOrder < user.orders.length; indexOrder += 1) {
					for (let index = 0; index < user.orders[indexOrder].toursReviews.length; index += 1) {
						user.orders[indexOrder].toursReviews[index].is_deleted = true;
						user.orders[indexOrder].toursReviews[index].save();
					}
				}
				for (let indexTour = 0; indexTour < user.tours.length; indexTour += 1) {
					user.tours[indexTour].is_deleted = true;
					user.tours[indexTour].save();
					for (let indexBenefit = 0; indexBenefit < user.tours[indexTour].toursBenefits.length; indexBenefit += 1) {
						user.tours[indexTour].toursBenefits[indexBenefit].is_deleted = true;
						user.tours[indexTour].toursBenefits[indexBenefit].save();
					}
					for (let indexHost = 0; indexHost < user.tours[indexTour].toursHosts.length; indexHost += 1) {
						user.tours[indexTour].toursHosts[indexHost].is_deleted = true;
						user.tours[indexTour].toursHosts[indexHost].save();
						user.tours[indexTour].toursHosts[indexHost].toursSchedule.is_deleted = true;
						user.tours[indexTour].toursHosts[indexHost].toursSchedule.save();
					}
					for (let indexPlace = 0; indexPlace < user.tours[indexTour].toursPlaces.length; indexPlace += 1) {
						user.tours[indexTour].toursPlaces[indexPlace].is_deleted = true;
						user.tours[indexTour].toursPlaces[indexPlace].save();
					}
					for (let indexImage = 0; indexImage < user.tours[indexTour].toursImages.length; indexImage += 1) {
						user.tours[indexTour].toursImages[indexImage].is_deleted = true;
						user.tours[indexTour].toursImages[indexImage].save();
					}
				}
				return requestHandler.sendSuccess(res, 20001, 'Success')();
			}
			return requestHandler.sendFailure(res, 40001, 'Unable to process the contained instructions')();
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}

	// eslint-disable-next-line consistent-return
	async uploadAvatar(req, res) {
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
				const fileLink = await service.getFileLink(req, file.file.path, `${process.env.AWS_S3_ALBUM_AVATAR_IMAGE_NAME}/${newName}`, fileType, res);

				// UPDATE AVATAR
				const tokenFromHeader = auth.getJwtToken(req);
				const account = jwt.decode(tokenFromHeader);

				const user = await super.getByCustomOptions(req, 'User', {
					where: {
						user_id: account.payload.user_id,
						is_verified: true,
						is_deleted: false,
					},
				});
				if (!user) {
					requestHandler.sendFailure(res, 42801, 'Account does not exist')();
				}

				user.avatar = fileLink;
				if (user.save()) {
					return requestHandler.sendSuccess(res, 20001, 'Success')(user);
				}
				return requestHandler.sendFailure(res, 40001, 'Unable to process the contained instructions')();
			});
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}

	// eslint-disable-next-line class-methods-use-this, consistent-return
	async uploadIntroductionVideo(req, res) {
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
				if (extension !== '.mp4' && extension !== '.webm' && extension !== '.ogg') {
					return requestHandler.sendFailure(res, 40001, 'Invalid file')();
				}
				const newName = name + new Date().getTime() + extension;
				const introductionVideoLink = await service.getFileLink(req, file.file.path, `${process.env.AWS_S3_ALBUM_INTRODUCTION_VIDEO_NAME}/${newName}`, fileType, res);

				// UPDATE INTRODUCTION VIDEO
				const tokenFromHeader = auth.getJwtToken(req);
				const account = jwt.decode(tokenFromHeader);

				const user = await super.getByCustomOptions(req, 'User', {
					where: {
						user_id: account.payload.user_id,
						is_verified: true,
						is_deleted: false,
					},
				});
				if (!user) {
					requestHandler.sendFailure(res, 42801, 'Account does not exist')();
				}

				user.introduction_video = introductionVideoLink;
				if (user.save()) {
					return requestHandler.sendSuccess(res, 20001, 'Success')(user);
				}
				return requestHandler.sendFailure(res, 40001, 'Unable to process the contained instructions')();
			});
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}

	async deleteAvatar(req, res) {
		try {
			// CHECK IF ACCOUNT EXISTS
			const user = await super.getByCustomOptions(req, 'User', {
				where: {
					user_id: req.params.id,
					is_deleted: false,
				},
			});
			if (!user) {
				return requestHandler.sendFailure(res, 40505, 'Account does not exist')();
			}

			// GET DEFAULT AVATAR
			const systemSettingAvatar = await super.getByCustomOptions(req, 'SystemSetting', {
				where: {
					name: columnName.DEFAULT_USER_AVATAR,
					is_deleted: false,
				},
			});

			// RETURN TO DEFAULT AVATAR
			user.avatar = systemSettingAvatar.value;
			if (user.save()) {
				return requestHandler.sendSuccess(res, 20001, 'Success')(user);
			}
			return requestHandler.sendFailure(res, 40001, 'Unable to process the contained instructions')();
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}
}
module.exports = new AccountsController();
