/* eslint-disable max-len */
const {
	User, Coupon, ToursHost, Language, UsersLanguage
} = require('../models');
const stringUtil = require('../utils/stringUtil');
const constants = require('../utils/constants');

module.exports = {
	// eslint-disable-next-line no-unused-vars
	up: async (queryInterface, Sequelize) => {
		const data = [];
		const findAllCoupons = () => Coupon.findAll({
			where: {
				is_deleted: false,
			},
		});
		const findAllToursHosts = () => ToursHost.findAll({
			where: {
				is_deleted: false,
			},
			include: [{
				model: User,
				as: 'host',
				include: [{
					model: UsersLanguage,
					as: 'usersLanguages',
				}],
			}],
		});
		const findAllUsers = () => User.findAll({
			where: {
				level_id: 2,
				is_deleted: false,
			},
		});
		const [coupons, toursHosts, users] = await Promise.all([findAllCoupons(), findAllToursHosts(), findAllUsers()]);
		let dateTime = 1596268800000;
		let createdAt = new Date(dateTime);
		createdAt.setDate(createdAt.getUTCDate() - 100);
		createdAt = createdAt.getTime();
		for (let index = 0; index < 4000; index += 1) {
			const indexToursHost = Math.floor(Math.random() * (toursHosts.length - 1 - 0 + 1) + 0);
			const indexCoupon = Math.random() >= 0.5 ? null : Math.floor(Math.random() * (coupons.length - 1 - 0 + 1) + 0);
			const status = Math.floor(Math.random() * (2 - 0 + 1) + 0);
			const isPaidToSystem = (status === constants.ORDER_FINISHED) ? true : Math.random() >= 0.5;
			const isPaidToHost = (status === constants.ORDER_FINISHED) ? Math.random() >= 0.5 : false;
			const isCancelled = isPaidToHost ? false : Math.random() >= 0.8;
			data.push({
				tours_host_id: toursHosts[indexToursHost].tours_host_id,
				user_id: users[Math.floor(Math.random() * (users.length - 1 - 0 + 1) + 0)].user_id,
				fullname: stringUtil.generateString(Math.floor(Math.random() * (20 - 10 + 1) + 10), true),
				email: `${stringUtil.generateString(Math.floor(Math.random() * (20 - 6 + 1) + 6), false)}@gmail.com`.toLowerCase(),
				phone_number: `0${stringUtil.generateNumber(9)}`,
				language_id: toursHosts[indexToursHost].host.usersLanguages[0].language_id,
				number_of_people: Math.floor(Math.random() * (10 - 1 + 1) + 1),
				price: (Math.random() * (80 - 40 + 1) + 40).toFixed(2),
				date_time: new Date(dateTime),
				coupon_id: indexCoupon === null ? null : coupons[indexCoupon].coupon_id,
				discount: indexCoupon === null ? 0 : coupons[indexCoupon].discount,
				note: null,
				status,
				is_cancelled: isCancelled,
				is_refunded: isPaidToSystem && isCancelled ? Math.random() >= 0.8 : false,
				is_paid_to_system: isPaidToSystem,
				is_paid_to_host: isPaidToHost,
				is_deleted: false,
				created_at: new Date(createdAt),
			});
			createdAt += Math.floor(Math.random() * (172800000 - 3600000 + 1) + 3600000);
			dateTime = Math.random() >= 0.2 ? dateTime + Math.floor(Math.random() * (10 - 1 + 1) + 1) * 3600000 : dateTime - Math.floor(Math.random() * (15 - 3 + 1) + 3) * 3600000;
		}
		return queryInterface.bulkInsert('orders', data, {});
	},
	// eslint-disable-next-line no-unused-vars
	down: (queryInterface, Sequelize) => queryInterface.bulkDelete('orders', null, {}),
};
