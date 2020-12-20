/* eslint-disable max-len */
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');
const auth = require('../utils/auth');
const paypal = require('paypal-rest-sdk');
paypal.configure({
	mode: 'sandbox',
	client_id: process.env.PAYPAL_CLIENT_ID,
	client_secret: process.env.PAYPAL_CLIENT_SECRET,
});

const paypalPayout = require('@paypal/payouts-sdk');
let clientId =  process.env.PAYPAL_CLIENT_ID;
let clientSecret = process.env.PAYPAL_CLIENT_SECRET;
let environment = new paypalPayout.core.SandboxEnvironment(clientId, clientSecret);
let client = new paypalPayout.core.PayPalHttpClient(environment);


const RequestHandler = require('../utils/RequestHandler');
const Logger = require('../utils/logger');
const BaseController = require('./BaseController');
const constants = require('../utils/constants');
const models = require('../models');
const stringUtil = require('../utils/stringUtil');

const logger = new Logger();
const requestHandler = new RequestHandler(logger);

class PaymentsController extends BaseController {
	// eslint-disable-next-line class-methods-use-this, consistent-return
	async createRequest(req, res) {
		try {
			const order = await super.getByCustomOptions(req, 'Order', {
				where: {
					order_id: req.body.order_id,
					status: { [Op.in]: [constants.ORDER_UNCONFIRMED, constants.ORDER_CONFIRMED] },
					is_cancelled: false,
					is_paid_to_system: false,
					is_deleted: false,
				},
				include: [{
					model: models.ToursHost,
					as: 'toursHost',
					include: [{
						model: models.Tour,
						as: 'tour',
					}],
				}],
			});
			if (!order) {
				return requestHandler.sendFailure(res, 40001, 'Field order_id does not exist')();
			}
			const createPaymentJson = {
				intent: 'sale',
				payer: {
					payment_method: 'paypal',
				},
				redirect_urls: {
					return_url: 'http://localhost:8080/api/payments/process',
					cancel_url: 'http://localhost:4200/cancel',
				},
				transactions: [{
					item_list: {
						items: [{
							name: order.toursHost.tour.name,
							sku: order.toursHost.tour.name,
							price: (order.price - order.discount),
							currency: 'USD',
							quantity: 1,
						}],
					},
					amount: {
						currency: 'USD',
						total: (order.price - order.discount),
					},
					description: 'Pay for tour',
				}],
			};

			paypal.payment.create(createPaymentJson, (error, payment) => {
				if (error) {
					return requestHandler.sendFailure(res, 40001, error)();
				}
				const approvalUrl = payment.links.find((link) => link.rel === 'approval_url').href;
				if (approvalUrl) {
					return res.redirect(approvalUrl);
				}
				return requestHandler.sendFailure(res, 40001, 'No approval_url found')();
			});
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}

	// eslint-disable-next-line class-methods-use-this, consistent-return
	async processRequest(req, res) {
		try {
			const { paymentId } = req.query;
			const payerId = { payer_id: req.query.PayerID };

			paypal.payment.execute(paymentId, payerId, (error, payment) => {
				if (error) {
					return requestHandler.sendFailure(res, 40001, error.message)();
				}
				if (payment.state === 'approved') {
					return requestHandler.sendSuccess(res, 20001, 'Success')(payment);
				}
				return requestHandler.sendFailure(res, 40001, `Payment not successful: ${payment.state}`)();
			});
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}

	async requestWithdraw(req, res) {
		try {
			const senderBatchId = 'batchIdlikealocal' + req.body.receiver + new Date().getTime() + stringUtil.generateString(5, false);
			const senderItemId = 'itemIdlikealocal' + req.body.receiver + new Date().getTime() + stringUtil.generateString(5, false);
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
						value: req.body.amount_value,
					},
					receiver: req.body.receiver,
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
			const tokenFromHeader = auth.getJwtToken(req);
			const account = jwt.decode(tokenFromHeader);
			const transaction = await super.create(req, 'Transaction', {
				amount: req.body.amount_value,
				transaction_fee: 0.25,
				host_id: account.payload.user_id,
				transaction_number: null,
				transaction_type_id: constants.TRANSACTION_TYPE_HOST_WITHDRAW,
				receiver: req.body.receiver,
				payout_batch_id: response.result.batch_header.payout_batch_id,
				status: constants.TRANSACTION_STATUS_PENDING,
				available_balance: currentBalance.available_balance,
				unavailable_balance: Number((currentBalance.unavailable_balance - req.body.amount_value).toFixed(2)),
			});
			if (transaction) {
				// UPDATE HOST BALANCE
				const user = await super.getByCustomOptions(req, 'User', {
					where: {
						user_id: account.payload.user_id,
						is_deleted: false,
					},
				});
				user.balance = Number((user.balance - req.body.amount_value).toFixed(2));
				if (user.save()) {
					return requestHandler.sendSuccess(res, 20001, 'Success')(response);
				}
				return requestHandler.sendFailure(res, 40001, 'Unable to process the contained instructions')();
			}
			return requestHandler.sendFailure(res, 40001, 'Unable to process the contained instructions')();
		} catch(error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}
}
module.exports = new PaymentsController();
