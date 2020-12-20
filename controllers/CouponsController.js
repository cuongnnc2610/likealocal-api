/* eslint-disable max-len */
/* eslint-disable no-await-in-loop */
const { Op } = require('sequelize');
const RequestHandler = require('../utils/RequestHandler');
const Logger = require('../utils/logger');
const BaseController = require('./BaseController');

const logger = new Logger();
const requestHandler = new RequestHandler(logger);

class CouponsController extends BaseController {
	async getCoupons(req, res) {
		try {
			let page = req.query.page ? Number(req.query.page) : 1;
			const limit = req.query.limit ? Number(req.query.limit) : 10;
			let startIndex = (page - 1) * limit;
			const condition = {};
			condition.is_deleted = false;
			if (req.query.code) {
				condition.code = { [Op.substring]: req.query.code };
			}
			if (req.query.is_available) {
				condition.is_available = req.query.is_available === 'true';
			}
			const allCoupons = await super.getAllList(req, 'Coupon', {
				where: condition,
			});

			const totalPage = Math.ceil(allCoupons.length / limit);

			if (page > totalPage) {
				page = totalPage;
				startIndex = (page - 1) * limit;
			}

			for (let index = 0; index < allCoupons.length; index += 1) {
				const orders = await super.getAllList(req, 'Order', {
					where: {
						coupon_id: allCoupons[index].coupon_id,
						is_deleted: false,
					},
				});
				allCoupons[index].dataValues.used_quantity = orders.length;
			}

			let coupons;
			const orderType = Number(req.query.order_type);
			switch (orderType) {
			case 1: // id DESC
				coupons = allCoupons.sort((coupon1, coupon2) => coupon2.coupon_id - coupon1.coupon_id);
				break;
			case 2: // id ASC
				coupons = allCoupons.sort((coupon1, coupon2) => coupon1.coupon_id - coupon2.coupon_id);
				break;
			case 3: // code DESC
				coupons = allCoupons.sort((coupon1, coupon2) => coupon2.code.localeCompare(coupon1.code));
				break;
			case 4: // code ASC
				coupons = allCoupons.sort((coupon1, coupon2) => coupon1.code.localeCompare(coupon2.code));
				break;
			case 5: // discount DESC
				coupons = allCoupons.sort((coupon1, coupon2) => coupon2.discount - coupon1.discount);
				break;
			case 6: // discount ASC
				coupons = allCoupons.sort((coupon1, coupon2) => coupon1.discount - coupon2.discount);
				break;
			case 7: // total_quantity DESC
				coupons = allCoupons.sort((coupon1, coupon2) => coupon2.total_quantity - coupon1.total_quantity);
				break;
			case 8: // total_quantity ASC
				coupons = allCoupons.sort((coupon1, coupon2) => coupon1.total_quantity - coupon2.total_quantity);
				break;
			case 9: // used_quantity DESC
				coupons = allCoupons.sort((coupon1, coupon2) => coupon2.dataValues.used_quantity - coupon1.dataValues.used_quantity);
				break;
			case 10: // used_quantity ASC
				coupons = allCoupons.sort((coupon1, coupon2) => coupon1.dataValues.used_quantity - coupon2.dataValues.used_quantity);
				break;
			default:
				coupons = allCoupons;
			}
			const offset = startIndex > 0 ? startIndex : 0;
			coupons = coupons.slice(offset, offset + limit);

			const result = {
				total: allCoupons.length,
				per_page: limit,
				current_page: page,
				last_page: totalPage,
				from: startIndex + 1,
				to: startIndex + coupons.length,
				data: coupons,
			};

			return requestHandler.sendSuccess(res, 20001, 'Success')(result);
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}

	async verifyCoupon(req, res) {
		try {
			// CHECK IF COUPON EXISTS
			const coupon = await super.getByCustomOptions(req, 'Coupon', {
				where: {
					code: req.query.code,
					is_deleted: false,
				},
			});
			if (!coupon) {
				return requestHandler.sendFailure(res, 40002, 'Coupon does not exist')();
			}

			// COUNT USED_QUANTITY OF COUPON
			const orders = await super.getAllList(req, 'Order', {
				where: {
					coupon_id: coupon.coupon_id,
					is_deleted: false,
				},
			});
			coupon.dataValues.used_quantity = orders.length;
			if (coupon.total_quantity > orders.length && coupon.is_available) {
				coupon.dataValues.is_available = true;
			} else {
				coupon.dataValues.is_available = false;
			}
			return requestHandler.sendSuccess(res, 20001, 'Success')(coupon);
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}

	async createCoupon(req, res) {
		try {
			// CHECK IF COUPON EXISTS
			const coupon = await super.getByCustomOptions(req, 'Coupon', {
				where: {
					code: req.body.code,
					is_deleted: false,
				},
			});
			if (coupon) {
				return requestHandler.sendFailure(res, 40002, 'Coupon existed')();
			}

			// CREATE COUPON
			const createdCoupon = await super.create(req, 'Coupon', {
				code: req.body.code,
				discount: req.body.discount,
				total_quantity: req.body.total_quantity,
				// used_quantity: 0,
				is_available: req.body.is_available,
			});
			if (createdCoupon) {
				return requestHandler.sendSuccess(res, 20001, 'Get success')(createdCoupon);
			}
			return requestHandler.sendFailure(res, 40001, 'Unable to process the contained instructions')();
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}

	async updateCoupon(req, res) {
		try {
			// CHECK IF COUPON_ID EXISTS
			const coupon = await super.getByCustomOptions(req, 'Coupon', {
				where: {
					coupon_id: req.params.id,
					is_deleted: false,
				},
			});
			if (!coupon) {
				return requestHandler.sendFailure(res, 40002, 'Field coupon_id does not exist')();
			}

			// CHECK IF TOTAL_QUANTITY > USED_QUANTITY
			const orders = await super.getAllList(req, 'Order', {
				where: {
					coupon_id: req.params.id,
					is_deleted: false,
				},
			});
			if (req.body.total_quantity < orders.length) {
				return requestHandler.sendFailure(res, 40002, 'Field total_quantity < used_quantity')();
			}

			// UPDATE COUPON
			coupon.code = req.body.code;
			coupon.discount = req.body.discount;
			coupon.total_quantity = req.body.total_quantity;
			coupon.is_available = req.body.is_available;
			if (coupon.save()) {
				return requestHandler.sendSuccess(res, 20001, 'Get success')(coupon);
			}
			return requestHandler.sendFailure(res, 40001, 'Unable to process the contained instructions')();
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}

	async deleteCoupon(req, res) {
		try {
			// CHECK IF COUPON_ID EXISTS
			const coupon = await super.getByCustomOptions(req, 'Coupon', {
				where: {
					coupon_id: req.params.id,
					is_deleted: false,
				},
			});
			if (!coupon) {
				return requestHandler.sendFailure(res, 40002, 'Field coupon_id does not exist')();
			}

			coupon.is_deleted = true;
			if (coupon.save()) {
				return requestHandler.sendSuccess(res, 20001, 'Get success')(coupon);
			}
			return requestHandler.sendFailure(res, 40001, 'Unable to process the contained instructions')();
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}
}
module.exports = new CouponsController();
