/* eslint-disable max-len */
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');
const auth = require('../utils/auth');
const RequestHandler = require('../utils/RequestHandler');
const Logger = require('../utils/logger');
const BaseController = require('./BaseController');
const stringUtil = require('../utils/stringUtil');
const models = require('../models');
const constants = require('../utils/constants');

const logger = new Logger();
const requestHandler = new RequestHandler(logger);

const paypalPayout = require('@paypal/payouts-sdk');
let clientId =  process.env.PAYPAL_CLIENT_ID;
let clientSecret = process.env.PAYPAL_CLIENT_SECRET;
let environment = new paypalPayout.core.SandboxEnvironment(clientId, clientSecret);
let client = new paypalPayout.core.PayPalHttpClient(environment);

class OrdersController extends BaseController {
	async getOrders(req, res) {
		try {
			let page = req.query.page ? Number(req.query.page) : 1;
			const limit = req.query.limit ? Number(req.query.limit) : 10;
			let startIndex = (page - 1) * limit;
			const condition = {};
			condition.is_deleted = false;
			if (req.query.order_id) {
				condition.order_id = req.query.order_id;
			}
			if (req.query.fullname) {
				condition.fullname = req.query.fullname;
			}
			if (req.query.email) {
				condition.email = req.query.email;
			}
			if (req.query.phone_number) {
				condition.phone_number = req.query.phone_number;
			}
			if (req.query.date_time) {
				condition.date_time = {
					[Op.gte]: new Date(`${req.query.date_time}T00:00:00.000+00:00`),
					[Op.lte]: new Date(`${req.query.date_time}T23:59:59.000+00:00`),
				};
			}
			if (req.query.status) {
				condition.status = req.query.status;
			}
			if (req.query.is_cancelled) {
				condition.is_cancelled = req.query.is_cancelled === 'true';
			}
			if (req.query.is_paid_to_system) {
				condition.is_paid_to_system = req.query.is_paid_to_system === 'true';
			}
			if (req.query.is_paid_to_host) {
				condition.is_paid_to_host = req.query.is_paid_to_host === 'true';
			}
			if (!req.query.tour_name) {
				req.query.tour_name = '';
			}
			if (!req.query.host_name) {
				req.query.host_name = '';
			}
			if (!req.query.user_name) {
				req.query.user_name = '';
			}
			if (req.query.created_at) {
				condition.createdAt = {
					[Op.gte]: new Date(`${req.query.created_at}T00:00:00.000+00:00`),
					[Op.lte]: new Date(`${req.query.created_at}T23:59:59.000+00:00`),
				};
			}

			// IF THE REQUEST IS FROM USER, GET ALL ORDERS OF THAT USER
			const tokenFromHeader = auth.getJwtToken(req);
			const account = jwt.decode(tokenFromHeader);
			if (account.payload.level_id !== constants.LEVEL_ADMIN) {
				condition.user_id = account.payload.user_id;
			}

			const allOrders = await super.getAllList(req, 'Order', {
				where: condition,
				include: [{
					model: models.ToursHost,
					as: 'toursHost',
					include: [{
						model: models.Tour,
						as: 'tour',
						where: {
							name: { [Op.substring]: req.query.tour_name },
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
						}],
					}, {
						model: models.User,
						as: 'host',
						attributes: ['user_id', 'email', 'user_name', 'level_id', 'is_tour_guide', 'avatar', 'phone_number'],
						where: {
							user_name: { [Op.substring]: req.query.host_name },
						},
					}],
				}, {
					model: models.User,
					as: 'user',
					attributes: ['user_id', 'email', 'user_name', 'level_id', 'is_tour_guide', 'avatar', 'phone_number'],
					where: {
						user_name: { [Op.substring]: req.query.user_name },
					},
				}, {
					model: models.Coupon,
					as: 'coupon',
				}, {
					model: models.Language,
					as: 'language',
				}],
				order: [['order_id', 'DESC']],
			});

			const totalPage = Math.ceil(allOrders.length / limit);

			if (page > totalPage) {
				page = totalPage;
				startIndex = (page - 1) * limit;
			}

			let orders;
			const orderType = Number(req.query.order_type);
			switch (orderType) {
			case 1: // id DESC
				orders = allOrders.sort((order1, order2) => order2.order_id - order1.order_id);
				break;
			case 2: // id ASC
				orders = allOrders.sort((order1, order2) => order1.order_id - order2.order_id);
				break;
			case 3: // price DESC
				orders = allOrders.sort((order1, order2) => order2.price - order1.price);
				break;
			case 4: // price ASC
				orders = allOrders.sort((order1, order2) => order1.price - order2.price);
				break;
			case 5: // unconfirmed confirmed finished
				orders = allOrders.sort((order1, order2) => order2.status - order1.status || order2.order_id - order1.order_id);
				break;
			case 6: // finished confirmed unconfirmed
				orders = allOrders.sort((order1, order2) => order1.status - order2.status || order1.order_id - order2.order_id);
				break;
			default:
				orders = allOrders;
			}

			const offset = startIndex > 0 ? startIndex : 0;
			orders = orders.slice(offset, offset + limit);

			const result = {
				total: allOrders.length,
				per_page: limit,
				current_page: page,
				last_page: totalPage,
				from: startIndex + 1,
				to: startIndex + orders.length,
				data: orders,
			};

			return requestHandler.sendSuccess(res, 20001, 'Success')(result);
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}

	async getHostOrders(req, res) {
		try {
			let page = req.query.page ? Number(req.query.page) : 1;
			const limit = req.query.limit ? Number(req.query.limit) : 10;
			let startIndex = (page - 1) * limit;
			const condition = {};
			condition.is_deleted = false;
			if (req.query.order_id) {
				condition.order_id = req.query.order_id;
			}
			if (req.query.fullname) {
				condition.fullname = req.query.fullname;
			}
			if (req.query.email) {
				condition.email = req.query.email;
			}
			if (req.query.phone_number) {
				condition.phone_number = req.query.phone_number;
			}
			if (req.query.date_time) {
				condition.date_time = {
					[Op.gte]: new Date(`${req.query.date_time}T00:00:00.000+00:00`),
					[Op.lte]: new Date(`${req.query.date_time}T23:59:59.000+00:00`),
				};
			}
			if (req.query.status) {
				condition.status = req.query.status;
			}
			if (req.query.is_cancelled) {
				condition.is_cancelled = req.query.is_cancelled === 'true';
			}
			if (req.query.is_paid_to_system) {
				condition.is_paid_to_system = req.query.is_paid_to_system === 'true';
			}
			if (req.query.is_paid_to_host) {
				condition.is_paid_to_host = req.query.is_paid_to_host === 'true';
			}
			if (!req.query.tour_name) {
				req.query.tour_name = '';
			}
			if (!req.query.host_name) {
				req.query.host_name = '';
			}
			if (!req.query.user_name) {
				req.query.user_name = '';
			}
			if (req.query.created_at) {
				condition.createdAt = {
					[Op.gte]: new Date(`${req.query.created_at}T00:00:00.000+00:00`),
					[Op.lte]: new Date(`${req.query.created_at}T23:59:59.000+00:00`),
				};
			}

			// GET ALL TOURS OF HOST
			const tokenFromHeader = auth.getJwtToken(req);
			const account = jwt.decode(tokenFromHeader);
			const tours = await super.getAllList(req, 'Tour', {
				where: {
					host_id: account.payload.user_id,
					is_deleted: false,
				}
			});
			const tourIds = tours.map(tour => tour.tour_id);

			let hostOfOrderCondition = {};
			// GET ORDERS OF THIS HOST AND ORDERS OF OTHER HOSTS WHICH TOUR BELONG TO THIS HOST 
			if (req.query.host_of_order === '0') {
				hostOfOrderCondition = {
					[Op.or]: [
						{ host_id: account.payload.user_id },
						{ tour_id: { [Op.in]: tourIds },},
					],	
				};
			}
			// GET ORDERS OF THIS HOST
			if (req.query.host_of_order === '1') {
				hostOfOrderCondition.host_id = account.payload.user_id;
			}
			// GET ORDERS OF OTHER HOSTS WHICH TOUR BELONG TO THIS HOST 
			if (req.query.host_of_order === '2') {
				hostOfOrderCondition.host_id = { [Op.ne]: account.payload.user_id }
				hostOfOrderCondition.tour_id = { [Op.in]: tourIds }
			}

			// GET ALL ORDERS
			const allOrders = await super.getAllList(req, 'Order', {
				where: condition,
				include: [{
					model: models.ToursHost,
					as: 'toursHost',
					required: true,
					where: hostOfOrderCondition,
					include: [{
						model: models.Tour,
						as: 'tour',
						where: {
							name: { [Op.substring]: req.query.tour_name },
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
						}],
					}, {
						model: models.User,
						as: 'host',
						attributes: ['user_id', 'email', 'user_name', 'level_id', 'is_tour_guide', 'avatar', 'phone_number'],
						where: {
							user_name: { [Op.substring]: req.query.host_name },
						},
					}],
				}, {
					model: models.User,
					as: 'user',
					attributes: ['user_id', 'email', 'user_name', 'level_id', 'is_tour_guide', 'avatar', 'phone_number'],
					where: {
						user_name: { [Op.substring]: req.query.user_name },
					},
				}, {
					model: models.Coupon,
					as: 'coupon',
				}, {
					model: models.Language,
					as: 'language',
				}],
				order: [['order_id', 'DESC']],
			});

			const totalPage = Math.ceil(allOrders.length / limit);

			if (page > totalPage) {
				page = totalPage;
				startIndex = (page - 1) * limit;
			}

			let orders;
			const orderType = Number(req.query.order_type);
			switch (orderType) {
			case 1: // id DESC
				orders = allOrders.sort((order1, order2) => order2.order_id - order1.order_id);
				break;
			case 2: // id ASC
				orders = allOrders.sort((order1, order2) => order1.order_id - order2.order_id);
				break;
			case 3: // price DESC
				orders = allOrders.sort((order1, order2) => order2.price - order1.price);
				break;
			case 4: // price ASC
				orders = allOrders.sort((order1, order2) => order1.price - order2.price);
				break;
			case 5: // unconfirmed confirmed finished
				orders = allOrders.sort((order1, order2) => order2.status - order1.status || order2.order_id - order1.order_id);
				break;
			case 6: // finished confirmed unconfirmed
				orders = allOrders.sort((order1, order2) => order1.status - order2.status || order1.order_id - order2.order_id);
				break;
			default:
				orders = allOrders;
			}

			const offset = startIndex > 0 ? startIndex : 0;
			orders = orders.slice(offset, offset + limit);

			const result = {
				total: allOrders.length,
				per_page: limit,
				current_page: page,
				last_page: totalPage,
				from: startIndex + 1,
				to: startIndex + orders.length,
				data: orders,
			};

			return requestHandler.sendSuccess(res, 20001, 'Success')(result);
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}

	async confirmOrder(req, res) {
		try {
			const tokenFromHeader = auth.getJwtToken(req);
			const account = jwt.decode(tokenFromHeader);

			const order = await super.getByCustomOptions(req, 'Order', {
				where: {
					order_id: req.params.id,
					is_deleted: false,
				},
				include: [{
					model: models.ToursHost,
					as: 'toursHost',
				}],
			});
			if (order) {
				// CHECK PERMISSION
				if (order.toursHost.host_id !== account.payload.user_id || order.status !== constants.ORDER_UNCONFIRMED) {
					return requestHandler.sendFailure(res, 40001, 'No permission')();
				}
				order.status = constants.ORDER_CONFIRMED;
				if (order.save()) {
					return requestHandler.sendSuccess(res, 20001, 'Success')(order);
				}
				return requestHandler.sendFailure(res, 40001, 'Unable to process the contained instructions')();
			}
			return requestHandler.sendFailure(res, 20002, 'No result')();
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}

	async cancelOrder(req, res) {
		try {
			const tokenFromHeader = auth.getJwtToken(req);
			const account = jwt.decode(tokenFromHeader);

			const order = await super.getByCustomOptions(req, 'Order', {
				where: {
					order_id: req.params.id,
					is_deleted: false,
				},
				include: [{
					model: models.ToursHost,
					as: 'toursHost',
					include: [{
						model: models.Tour,
						as: 'tour',
						include: [{
							model: models.City,
							as: 'city',
						}],
					}],
				}],
			});
			if (order) {
				// CHECK PERMISSION (ADMIN, ORDER'S HOST, ORDER'S USER)
				if (account.payload.level_id !== constants.LEVEL_ADMIN && order.toursHost.host_id !== account.payload.user_id && order.user_id !== account.payload.user_id) {
					return requestHandler.sendFailure(res, 40001, 'No permission')();
				}
				// ORDER'S HOST AND ORDER'S USER CAN NOT CANCEL IF ORDER'S STATUS IS FINISHED
				if (order.status === constants.ORDER_FINISHED && (account.payload.level_id === constants.LEVEL_USER || account.payload.level_id === constants.LEVEL_HOST)) {
					return requestHandler.sendFailure(res, 40001, 'Cannot cancel if order\'s status is finished')();
				}

				order.is_cancelled = true;

				// CHECK IF THIS ORDER WILL BE REFUNDED
				let willBeRefunded = false;
				const departureDate = new Date(order.date_time.toISOString().slice(0, -1) + order.toursHost.tour.city.utc_offset);
				const currentDate = new Date();
				currentDate.setUTCDate(currentDate.getUTCDate() + 7);
				if (order.is_paid_to_system && (account.payload.level_id === constants.LEVEL_ADMIN || order.toursHost.host_id === account.payload.user_id || currentDate < departureDate)) {
					willBeRefunded = true;
				}

				// BACK MONEY
				if (willBeRefunded) {
					const transactionToSendBack = await super.getByCustomOptions(req, 'Transaction', {
						where: {
							order_id: req.params.id,
							transaction_type_id: constants.TRANSACTION_TYPE_USER_PAYS_SYSTEM,
							is_deleted: false,
						},
					});
					console.log(transactionToSendBack.sender);
					console.log(transactionToSendBack.amount);
					const senderBatchId = 'batchIdlikealocal' + transactionToSendBack.sender + new Date().getTime() + stringUtil.generateString(5, false);
					const senderItemId = 'itemIdlikealocal' + transactionToSendBack.sender + new Date().getTime() + stringUtil.generateString(5, false);
					let requestBody = {
						sender_batch_header: {
							recipient_type: "EMAIL",
							email_message: "SDK payouts",
							note: "Enjoy your Payout!!",
							sender_batch_id: senderBatchId,
							email_subject: "This is a test transaction from SDK"
						},
						items: [{
							note: "Your Payout!",
							amount: {
								currency: "USD",
								value: transactionToSendBack.amount,
							},
							receiver: transactionToSendBack.sender,
							sender_item_id: senderItemId
						}]
					}

					let request = new paypalPayout.payouts.PayoutsPostRequest();
					request.requestBody(requestBody);
					let response = await client.execute(request);

					// GET LATEST TRANSACTION RECORD
					const currentBalance = await super.getByCustomOptions(req, 'Transaction', {
						where: {
							is_deleted: false,
						},
						order: [['transaction_id', 'DESC']],
						limit: 1,
					});

					// CREATE TRANSACTION
					// const amount = Number((order.price - order.discount * order.price / 100).toFixed(2));
					const transaction = await super.create(req, 'Transaction', {
						order_id: order.order_id,
						amount: transactionToSendBack.amount,
						transaction_fee: 0,
						host_id: null,
						transaction_number: null,
						transaction_type_id: constants.TRANSACTION_TYPE_SYSTEM_REFUNDS_TO_USER,
						sender: null,
						receiver: transactionToSendBack.sender,
						payout_batch_id: response.result.batch_header.payout_batch_id,
						status: constants.TRANSACTION_STATUS_PENDING,
						available_balance: Number((currentBalance.available_balance - transactionToSendBack.amount).toFixed(2)),
						unavailable_balance: currentBalance.unavailable_balance,
					});

					if (transaction) {
						order.is_refunded = true;
						if (order.save()) {
							return requestHandler.sendSuccess(res, 20001, 'Success')(order);
						}
					}
				}
				if (order.save()) {
					return requestHandler.sendSuccess(res, 20001, 'Success')(order);
				}
				return requestHandler.sendFailure(res, 40001, 'Unable to process the contained instructions')();
			}
			return requestHandler.sendFailure(res, 20002, 'No result')();
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}

	async finishOrder(req, res) {
		try {
			const tokenFromHeader = auth.getJwtToken(req);
			const account = jwt.decode(tokenFromHeader);

			const order = await super.getByCustomOptions(req, 'Order', {
				where: {
					order_id: req.params.id,
					is_deleted: false,
				},
				include: [{
					model: models.ToursHost,
					as: 'toursHost',
					include: [{
						model: models.Tour,
						as: 'tour',
						include: [{
							model: models.City,
							as: 'city',
						}],
					}],
				}],
			});
			if (order) {
				// CHECK PERMISSION
				if (order.toursHost.host_id !== account.payload.user_id || !order.is_paid_to_system) {
					return requestHandler.sendFailure(res, 40001, 'No permission')();
				}

				// CHECK IF CURRENT TIME >= START TIME OF ORDER + DURATION
				const currentDate = new Date();
				currentDate.setHours(currentDate.getHours() + stringUtil.utcOffsetToFloat(order.toursHost.tour.city.utc_offset));
				const orderTime = order.date_time;
				orderTime.setHours(orderTime.getHours() + order.toursHost.tour.duration);
				if (currentDate < orderTime) {
					return requestHandler.sendFailure(res, 40001, 'Cannot complete tour before end time')();
				}

				order.status = constants.ORDER_FINISHED;
				if (order.save()) {
					return requestHandler.sendSuccess(res, 20001, 'Success')(order);
				}
				return requestHandler.sendFailure(res, 40001, 'Unable to process the contained instructions')();
			}
			return requestHandler.sendFailure(res, 20002, 'No result')();
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}

	async completeOrder(req, res) {
		try {
			const tokenFromHeader = auth.getJwtToken(req);
			const account = jwt.decode(tokenFromHeader);

			const order = await super.getByCustomOptions(req, 'Order', {
				where: {
					order_id: req.params.id,
					is_deleted: false,
				},
				include: [{
					model: models.ToursHost,
					as: 'toursHost',
					include: [{
						model: models.Tour,
						as: 'tour',
						include: [{
							model: models.City,
							as: 'city',
						}],
					}],
				}],
			});
			if (order) {
				order.is_paid_to_host = true;

				// GET LATEST TRANSACTION RECORD
				const currentBalance = await super.getByCustomOptions(req, 'Transaction', {
					where: {
						is_deleted: false,
					},
					order: [['transaction_id', 'DESC']],
					limit: 1,
				});

				// PAY FOR HOST AND TOUR's OWNER (IF ANY)
				if (order.toursHost.host_id === order.toursHost.tour.host_id) {
					const amountForTourOwner = Number(((order.price - order.discount * order.price / 100) * 80 / 100).toFixed(2));
					const transactionForTourOwner = await super.create(req, 'Transaction', {
						order_id: order.order_id,
						amount: amountForTourOwner,
						transaction_fee: 0,
						host_id: order.toursHost.tour.host_id,
						transaction_number: null,
						transaction_type_id: constants.TRANSACTION_TYPE_SYSTEM_ALLOWS_HOST_TO_WITHDRAW_FOR_TOUR,
						receiver: null,
						payout_batch_id: null,
						status: constants.TRANSACTION_STATUS_SUCCEEDED,
						available_balance: Number((currentBalance.available_balance - amountForTourOwner).toFixed(2)),
						unavailable_balance: Number((currentBalance.unavailable_balance + amountForTourOwner).toFixed(2)),
					});
	
					if (transactionForTourOwner && order.save()) {
						return requestHandler.sendSuccess(res, 20001, 'Success')(order);
					}
				} else {
					const amountForTourOwner = Number(((order.price - order.discount * order.price / 100) * 10 / 100).toFixed(2));
					const amountForHost = Number(((order.price - order.discount * order.price / 100) * 70 / 100).toFixed(2));
					const transactionForTourOwner = await super.create(req, 'Transaction', {
						order_id: order.order_id,
						amount: amountForTourOwner,
						transaction_fee: 0,
						host_id: order.toursHost.tour.host_id,
						transaction_number: null,
						transaction_type_id: constants.TRANSACTION_TYPE_SYSTEM_ALLOWS_HOST_TO_WITHDRAW_FOR_COMMISSION,
						receiver: null,
						payout_batch_id: null,
						status: constants.TRANSACTION_STATUS_SUCCEEDED,
						available_balance: Number((currentBalance.available_balance - amountForTourOwner).toFixed(2)),
						unavailable_balance: Number((currentBalance.unavailable_balance + amountForTourOwner).toFixed(2)),
					});

					const transactionForHost = await super.create(req, 'Transaction', {
						order_id: order.order_id,
						amount: amountForHost,
						transaction_fee: 0,
						host_id: order.toursHost.host_id,
						transaction_number: null,
						transaction_type_id: constants.TRANSACTION_TYPE_SYSTEM_ALLOWS_HOST_TO_WITHDRAW_FOR_TOUR,
						receiver: null,
						payout_batch_id: null,
						status: constants.TRANSACTION_STATUS_SUCCEEDED,
						available_balance: Number((currentBalance.available_balance - amountForHost).toFixed(2)),
						unavailable_balance: Number((currentBalance.unavailable_balance + amountForHost).toFixed(2)),
					});
	
					if (transactionForTourOwner && transactionForHost && order.save()) {
						return requestHandler.sendSuccess(res, 20001, 'Success')(order);
					}
				}
				return requestHandler.sendFailure(res, 40001, 'Unable to process the contained instructions')();
			}
			return requestHandler.sendFailure(res, 20002, 'No result')();
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}

	async getOrder(req, res) {
		try {
			const tokenFromHeader = auth.getJwtToken(req);
			const account = jwt.decode(tokenFromHeader);

			const order = await super.getByCustomOptions(req, 'Order', {
				where: {
					order_id: req.params.id,
					is_deleted: false,
				},
				include: [{
					model: models.ToursHost,
					as: 'toursHost',
					include: [{
						model: models.Tour,
						as: 'tour',
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
						}],
					}, {
						model: models.User,
						as: 'host',
						attributes: ['user_id', 'email', 'user_name', 'level_id', 'is_tour_guide', 'avatar', 'phone_number'],
					}],
				}, {
					model: models.User,
					as: 'user',
					attributes: ['user_id', 'email', 'user_name', 'level_id', 'is_tour_guide', 'avatar', 'phone_number'],
				}, {
					model: models.Coupon,
					as: 'coupon',
				}, {
					model: models.Language,
					as: 'language',
				}],
			});
			if (order) {
				// CHECK PERMISSION
				if (order.user_id !== account.payload.user_id && order.toursHost.host_id !== account.payload.user_id && account.payload.level_id !== constants.LEVEL_ADMIN) {
					return requestHandler.sendFailure(res, 40001, 'No permission')();
				}
				return requestHandler.sendSuccess(res, 20001, 'Get data success')(order);
			}
			return requestHandler.sendSuccess(res, 20002, 'No result')();
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}

	async createOrder(req, res) {
		try {
			const tokenFromHeader = auth.getJwtToken(req);
			let account = null;
			if (tokenFromHeader !== null) {
				account = jwt.decode(tokenFromHeader);
			}

			// CHECK IF TOURS_HOST_ID EXISTS
			const toursHost = await super.getByCustomOptions(req, 'ToursHost', {
				where: {
					tours_host_id: req.body.tours_host_id,
					is_deleted: false,
				},
				include: [{
					model: models.Tour,
					as: 'tour',
				}, {
					model: models.User,
					as: 'host',
					include: [{
						model: models.UsersLanguage,
						as: 'usersLanguages',
					}],
				}],
			});
			if (!toursHost) {
				return requestHandler.sendFailure(res, 40002, 'Field tours_host_id does not exist')();
			}

			// CHECK IF LANGUAGE_ID EXISTS AND IF HOST SPEAKS THAT LANGUAGE
			const language = await super.getByCustomOptions(req, 'Language', {
				where: {
					language_id: req.body.language_id,
					is_deleted: false,
				},
			});
			if (!language) {
				return requestHandler.sendFailure(res, 40002, 'Field language_id does not exist')();
			}
			if (toursHost.host.usersLanguages.findIndex(usersLanguage => usersLanguage.language_id === req.body.language_id) === -1) {
				return requestHandler.sendFailure(res, 40002, 'This language is not supported by this host')();
			}

			// CHECK IF COUPON EXISTS
			let coupon;
			if (req.body.coupon) {
				coupon = await super.getByCustomOptions(req, 'Coupon', {
					where: {
						code: req.body.coupon,
						is_deleted: false,
					},
				});
				if (!coupon) {
					return requestHandler.sendFailure(res, 40002, 'Field coupon does not exist')();
				}
			}

			const createdOrder = await super.create(req, 'Order', {
				tours_host_id: req.body.tours_host_id,
				user_id: (account !== null) ? account.payload.user_id : null,
				fullname: req.body.fullname,
				email: req.body.email,
				phone_number: req.body.phone_number,
				language_id: req.body.language_id,
				number_of_people: req.body.number_of_people,
				price: toursHost.tour.sale_price,
				date_time: req.body.date_time,
				coupon_id: coupon ? coupon.coupon_id : null,
				discount: coupon ? coupon.discount : 0,
				status: constants.ORDER_UNCONFIRMED,
				is_cancelled: false,
				is_paid_to_system: false,	// MISS CASE USER PAY FIRST ====================================================
				is_paid_to_host: false,
			});
			if (createdOrder) {
				return requestHandler.sendSuccess(res, 20001, 'Success')(createdOrder);
			}
			return requestHandler.sendFailure(res, 40001, 'Unable to process the contained instructions')();
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}

	async confirmPaid(req, res) {
		try {
			const tokenFromHeader = auth.getJwtToken(req);
			const account = jwt.decode(tokenFromHeader);

			const order = await super.getByCustomOptions(req, 'Order', {
				where: {
					order_id: req.params.id,
					is_deleted: false,
				},
			});
			if (order) {
				// CHECK PERMISSION
				if (order.user_id !== account.payload.user_id) {
					return requestHandler.sendFailure(res, 40001, 'No permission')();
				}
				// CAN NOT CONFIRM PAID IF ORDER IS PAID
				if (order.is_paid_to_system) {
					return requestHandler.sendFailure(res, 40001, 'This order is paid')();
				}

				order.is_paid_to_system = true;
				if (order.save()) {
					// GET LASTEST TRANSACTION RECORD
					const currentBalance = await super.getByCustomOptions(req, 'Transaction', {
						where: {
							is_deleted: false,
						},
						order: [['transaction_id', 'DESC']],
						limit: 1,
					});

					// CREATE TRANSACTION
					const amount = Number((order.price - order.discount * order.price / 100).toFixed(2));
					const transaction = await super.create(req, 'Transaction', {
						order_id: req.params.id,
						amount: amount,
						transaction_fee: req.body.transaction_fee,
						transaction_number: req.body.transaction_number,
						transaction_type_id: constants.TRANSACTION_TYPE_USER_PAYS_SYSTEM,
						status: constants.TRANSACTION_STATUS_SUCCEEDED,
						sender: req.body.sender,
						available_balance: currentBalance.available_balance + amount,
						unavailable_balance: currentBalance.unavailable_balance,
					});
					if (transaction) {
						return requestHandler.sendSuccess(res, 20001, 'Success')(order);
					}
					return requestHandler.sendFailure(res, 40001, 'Unable to process the contained instructions')();
				}
				return requestHandler.sendFailure(res, 40001, 'Unable to process the contained instructions')();
			}
			return requestHandler.sendFailure(res, 20002, 'No result')();
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}
}
module.exports = new OrdersController();
