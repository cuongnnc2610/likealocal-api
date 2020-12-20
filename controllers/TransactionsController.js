/* eslint-disable max-len */
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const RequestHandler = require('../utils/RequestHandler');
const Logger = require('../utils/logger');
const BaseController = require('./BaseController');
const models = require('../models');
const auth = require('../utils/auth');
const constants = require('../utils/constants');

const logger = new Logger();
const requestHandler = new RequestHandler(logger);

class TransactionsController extends BaseController {
	async getTransactions(req, res) {
		try {
			const tokenFromHeader = auth.getJwtToken(req);
			const account = jwt.decode(tokenFromHeader);
			if (account.payload.level_id === constants.LEVEL_USER) {
				return requestHandler.sendFailure(res, 40001, 'No permission')();
			}

			let page = req.query.page ? Number(req.query.page) : 1;
			const limit = req.query.limit ? Number(req.query.limit) : 10;
			let startIndex = (page - 1) * limit;
			const condition = {};
			condition.is_deleted = false;

			if (account.payload.level_id === constants.LEVEL_HOST) {
				condition.host_id = account.payload.user_id;
			}
			if (req.query.order_id) {
				condition.order_id = req.query.order_id;
			}
			if (req.query.transaction_type_id) {
				condition.transaction_type_id = req.query.transaction_type_id;
			}
			let requiredHost = true;
			if (!req.query.host_email) {
				req.query.host_email = '';
				requiredHost = false;
			}
			let requiredUser = true;
			if (!req.query.user_email) {
				req.query.user_email = '';
				requiredUser = false;
			}
			if (req.query.created_at) {
				condition.createdAt = {
					[Op.gte]: new Date(`${req.query.created_at}T00:00:00.000+00:00`),
					[Op.lte]: new Date(`${req.query.created_at}T23:59:59.000+00:00`),
				};
			}

			const allTransactions = await super.getAllList(req, 'Transaction', {
				where: condition,
				include: [{
					model: models.TransactionType,
					as: 'transactionType',
				}, {
					model: models.Order,
					as: 'order',
					required: requiredUser,
					include: [{
						model: models.User,
						as: 'user',
						attributes: ['user_id', 'email', 'user_name', 'level_id', 'is_tour_guide', 'avatar'],
						required: requiredUser,
						where: {
							email: { [Op.substring]: req.query.user_email },
						},
					}, {
						model: models.ToursHost,
						as: 'toursHost',
						include: [{
							model: models.Tour,
							as: 'tour',
						}],
					}],
				}, {
					model: models.User,
					as: 'host',
					attributes: ['user_id', 'email', 'user_name', 'level_id', 'is_tour_guide', 'avatar'],
					required: requiredHost,
					where: {
						email: { [Op.substring]: req.query.host_email },
					},
				}],
			});

			const totalPage = Math.ceil(allTransactions.length / limit);

			if (page > totalPage) {
				page = totalPage;
				startIndex = (page - 1) * limit;
			}

			let transactions;
			const orderType = Number(req.query.order_type);
			switch (orderType) {
			case 1: // id DESC (created_at DESC)
				transactions = allTransactions.sort((transaction1, transaction2) => transaction2.transaction_id - transaction1.transaction_id);
				break;
			case 2: // id ASC (created_at ASC)
				transactions = allTransactions.sort((transaction1, transaction2) => transaction1.transaction_id - transaction2.transaction_id);
				break;
			default:
				transactions = allTransactions;
			}

			const offset = startIndex > 0 ? startIndex : 0;
			transactions = transactions.slice(offset, offset + limit);

			const result = {
				total: allTransactions.length,
				per_page: limit,
				current_page: page,
				last_page: totalPage,
				from: startIndex + 1,
				to: startIndex + transactions.length,
				data: transactions,
			};

			return requestHandler.sendSuccess(res, 20001, 'Get data success')(result);
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}

	async getCurrentBalanceOfSystem(req, res) {
		try {
			const currentBalance = await super.getByCustomOptions(req, 'Transaction', {
				where: {
					is_deleted: false,
				},
				order: [['transaction_id', 'DESC']],
				limit: 1,
			});

			const result = {
				available_balance: currentBalance ? currentBalance.available_balance : 0,
				unavailable_balance: currentBalance ? currentBalance.unavailable_balance : 0,
			};
			return requestHandler.sendSuccess(res, 20001, 'Get data success')(result);
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}

	async updateTransactionStatus(req, res) {
		try {
			console.log(req.body);
			// CHECK IF TRANSACTION EXISTS
			const transaction = await super.getByCustomOptions(req, 'Transaction', {
				where: {
					payout_batch_id: req.body.resource.payout_batch_id,
					is_deleted: false,
				},
			});
			if (!transaction) {
				return requestHandler.sendFailure(res, 40002, 'Transport does not existed')();
			}

			// SET STATUS
			switch (req.body.event_type) {
				case 'PAYMENT.PAYOUTS-ITEM.SUCCEEDED':
					transaction.status = constants.TRANSACTION_STATUS_SUCCEEDED;
					break;
				case 'PAYMENT.PAYOUTS-ITEM.FAILED':
					transaction.status = constants.TRANSACTION_STATUS_FAILED;

					// REVERT HOST BALANCE
					const user = await super.getByCustomOptions(req, 'User', {
						where: {
							user_id: transaction.host_id,
							is_deleted: false,
						},
					});
					user.balance += transaction.amount;
					await user.save();
					break;
				case 'PAYMENT.PAYOUTS-ITEM.UNCLAIMED':
					transaction.status = constants.TRANSACTION_STATUS_UNCLAIMED;
					break;
				default:
					break;
			}

			transaction.transaction_number = req.body.resource.transaction_id;
			transaction.transaction_fee = req.body.resource.payout_item_fee.value;
			if (transaction.save()) {
				return requestHandler.sendSuccess(res, 20001, 'Get success')(transaction);
			}
			return requestHandler.sendFailure(res, 40001, 'Unable to process the contained instructions')();
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}
}
module.exports = new TransactionsController();
