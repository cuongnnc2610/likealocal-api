/* eslint-disable max-len */
const {	User, Order, TransactionType, ToursHost, Tour } = require('../models');
const stringUtil = require('../utils/stringUtil');
const constants = require('../utils/constants');

module.exports = {
	// eslint-disable-next-line no-unused-vars
	up: async (queryInterface, Sequelize) => {
		const data = [];
		const findAllHosts = () => User.findAll({
			where: {
				level_id: 3,
				is_deleted: false,
			},
		});
		const findAllOrders = () => Order.findAll({
			where: {
				is_deleted: false,
			},
			include: [{
				model: ToursHost,
				as: 'toursHost',
				include: [{
					model: Tour,
					as: 'tour',
				}],
			}, {
				model: User,
				as: 'user',
			}],
		});

		const findAllTransactionTypes = () => TransactionType.findAll({
			where: {
				is_deleted: false,
			},
		});
		const [hosts, orders, transactionTypes] = await Promise.all([findAllHosts(), findAllOrders(), findAllTransactionTypes()]);
		let createdAt = 1570265800000; // Sat Oct 05 2019 08:56:40
		let availableBalance = 0;
		let unavailableBalance = 0;
		// for (let index = 0; index < 400; index += 1) {
		// 	const transactionTypeId = Math.random() >= 0.4 ? 1 : transactionTypes[Math.floor(Math.random() * (transactionTypes.length - 1 - 0 + 1) + 0)].transaction_type_id;
		// 	const amount = Number((Math.random() * (30 - 5 + 1) + 5).toFixed(2));
		// 	switch (transactionTypeId) {
		// 	case constants.TRANSACTION_TYPE_USER_PAYS_SYSTEM:
		// 		availableBalance += amount;
		// 		break;
		// 	case constants.TRANSACTION_TYPE_SYSTEM_REFUNDS_TO_USER:
		// 		availableBalance -= amount;
		// 		unavailableBalance += amount;
		// 		break;
		// 	case constants.TRANSACTION_TYPE_SYSTEM_ALLOWS_HOST_TO_WITHDRAW_FOR_TOUR:
		// 		availableBalance -= amount;
		// 		unavailableBalance += amount;
		// 		break;
		// 	case constants.TRANSACTION_TYPE_SYSTEM_ALLOWS_HOST_TO_WITHDRAW_FOR_COMMISSION:
		// 		availableBalance -= amount;
		// 		unavailableBalance += amount;
		// 		break;
		// 	case constants.TRANSACTION_TYPE_HOST_WITHDRAW:
		// 		unavailableBalance -= amount;
		// 		break;
		// 	default:
		// 		break;
		// 	}
		// 	data.push({
		// 		order_id: (transactionTypeId !== constants.TRANSACTION_TYPE_HOST_WITHDRAW) ? orders[Math.floor(Math.random() * (orders.length - 1 - 0 + 1) + 0)].order_id : null,
		// 		amount,
		// 		transaction_fee: Math.random() * (1 - 0.1 + 1) + 0.1,
		// 		host_id: (transactionTypeId !== constants.TRANSACTION_TYPE_USER_PAYS_SYSTEM && transactionTypeId !== constants.TRANSACTION_TYPE_SYSTEM_REFUNDS_TO_USER) ? hosts[Math.floor(Math.random() * (hosts.length - 1 - 0 + 1) + 0)].user_id : null,
		// 		transaction_number: (transactionTypeId !== constants.TRANSACTION_TYPE_SYSTEM_ALLOWS_HOST_TO_WITHDRAW_FOR_TOUR && transactionTypeId !== constants.TRANSACTION_TYPE_SYSTEM_ALLOWS_HOST_TO_WITHDRAW_FOR_COMMISSION) ? stringUtil.generateString(17, false).toUpperCase() : null,
		// 		transaction_type_id: transactionTypeId,
		// 		status: constants.TRANSACTION_STATUS_SUCCEEDED,
		// 		receiver: transactionTypeId === constants.TRANSACTION_TYPE_HOST_WITHDRAW ? stringUtil.generateString(10, false) + '@gmail.com' : null,
		// 		payout_batch_id: stringUtil.generateString(13, false).toUpperCase(),
		// 		available_balance: availableBalance,
		// 		unavailable_balance: unavailableBalance,
		// 		created_at: new Date(createdAt),
		// 		updated_at: new Date(createdAt),
		// 	});
		// 	createdAt += Math.floor(Math.random() * (172800000 - 3600000 + 1) + 3600000);
		// }
		for (let index = 0; index < orders.length; index++) {
			if (orders[index].is_paid_to_system) {
				const transactionFee = Math.random() * (1 - 0.1 + 1) + 0.1;
				availableBalance += Number((orders[index].price - orders[index].discount * orders[index].price / 100).toFixed(2) - transactionFee);
				data.push({
					order_id: orders[index].order_id,
					amount: Number((orders[index].price - orders[index].discount * orders[index].price / 100).toFixed(2)),
					transaction_fee: transactionFee,
					host_id: null,
					transaction_number: stringUtil.generateString(17, false).toUpperCase(),
					transaction_type_id: constants.TRANSACTION_TYPE_USER_PAYS_SYSTEM,
					status: constants.TRANSACTION_STATUS_SUCCEEDED,
					sender: 'likealocal' + orders[index].user.email,
					receiver: null,
					payout_batch_id: stringUtil.generateString(13, false).toUpperCase(),
					available_balance: availableBalance,
					unavailable_balance: unavailableBalance,
					created_at: new Date(createdAt),
					updated_at: new Date(createdAt),
				});
				if (orders[index].is_cancelled && Math.random() >= 0.8) {
					availableBalance -= Number((orders[index].price - orders[index].discount * orders[index].price / 100).toFixed(2));
					data.push({
						order_id: orders[index].order_id,
						amount: Number((orders[index].price - orders[index].discount * orders[index].price / 100).toFixed(2)),
						transaction_fee: 0,
						host_id: null,
						transaction_number: null,
						transaction_type_id: constants.TRANSACTION_TYPE_SYSTEM_REFUNDS_TO_USER,
						status: constants.TRANSACTION_STATUS_SUCCEEDED,
						sender: null,
						receiver: null,
						payout_batch_id: null,
						available_balance: availableBalance,
						unavailable_balance: unavailableBalance,
						created_at: new Date(createdAt),
						updated_at: new Date(createdAt),
					});
				}
			}
			if (orders[index].is_paid_to_host) {
				const amount = orders[index].toursHost.host_id !== orders[index].toursHost.tour.host_id ? 
					Number(((orders[index].price - orders[index].discount * orders[index].price / 100) * 70 / 100).toFixed(2))
					: Number(((orders[index].price - orders[index].discount * orders[index].price / 100) * 80 / 100).toFixed(2));
				availableBalance -= amount;
				unavailableBalance += amount;
				data.push({
					order_id: orders[index].order_id,
					amount: amount,
					transaction_fee: 0,
					host_id: orders[index].toursHost.host_id,
					transaction_number: null,
					transaction_type_id: constants.TRANSACTION_TYPE_SYSTEM_ALLOWS_HOST_TO_WITHDRAW_FOR_TOUR,
					status: constants.TRANSACTION_STATUS_SUCCEEDED,
					sender: null,
					receiver: null,
					payout_batch_id: null,
					available_balance: availableBalance,
					unavailable_balance: unavailableBalance,
					created_at: new Date(createdAt),
					updated_at: new Date(createdAt),
				});
				if (orders[index].toursHost.host_id !== orders[index].toursHost.tour.host_id) {
					const amount = Number(((orders[index].price - orders[index].discount * orders[index].price / 100) * 10 / 100).toFixed(2));
					availableBalance -= amount;
					unavailableBalance += amount;
					data.push({
						order_id: orders[index].order_id,
						amount: amount,
						transaction_fee: 0,
						host_id: orders[index].toursHost.tour.host_id,
						transaction_number: null,
						transaction_type_id: constants.TRANSACTION_TYPE_SYSTEM_ALLOWS_HOST_TO_WITHDRAW_FOR_COMMISSION,
						status: constants.TRANSACTION_STATUS_SUCCEEDED,
						sender: null,
						receiver: null,
						payout_batch_id: null,
						available_balance: availableBalance,
						unavailable_balance: unavailableBalance,
						created_at: new Date(createdAt),
						updated_at: new Date(createdAt),
					});
				}
			}
			if (Math.random() >= 0.8) {
				const transactionFee = Math.random() * (1 - 0.1 + 1) + 0.1;
				const amount = Number((Math.random() * (30 - 5 + 1) + 5).toFixed(2));
				unavailableBalance -= (amount + transactionFee);
				data.push({
					order_id: null,
					amount: amount,
					transaction_fee: transactionFee,
					host_id: orders[index].toursHost.host_id,
					transaction_number: stringUtil.generateString(17, false).toUpperCase(),
					transaction_type_id: constants.TRANSACTION_TYPE_HOST_WITHDRAW,
					status: constants.TRANSACTION_STATUS_SUCCEEDED,
					sender: null,
					receiver: stringUtil.generateString(10, false).toLowerCase() + '@gmail.com',
					payout_batch_id: stringUtil.generateString(13, false).toUpperCase(),
					available_balance: availableBalance,
					unavailable_balance: unavailableBalance,
					created_at: new Date(createdAt),
					updated_at: new Date(createdAt),
				});
			}
		}
		return queryInterface.bulkInsert('transactions', data, {});
	},
	// eslint-disable-next-line no-unused-vars
	down: (queryInterface, Sequelize) => queryInterface.bulkDelete('transactions', null, {}),
};
