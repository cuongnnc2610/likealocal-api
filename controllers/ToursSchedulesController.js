/* eslint-disable max-len */
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');
const auth = require('../utils/auth');
const RequestHandler = require('../utils/RequestHandler');
const Logger = require('../utils/logger');
const BaseController = require('./BaseController');
const stringUtil = require('../utils/stringUtil');
const columnName = require('../utils/columnName');
const constants = require('../utils/constants');
const models = require('../models');

const logger = new Logger();
const requestHandler = new RequestHandler(logger);

class ToursSchedulesController extends BaseController {
	async getAvailableSchedulesInDateAndMonth(req, res) {
		try {
			const toursSchedule = await super.getByCustomOptions(req, 'ToursSchedule', {
				where: {
					tours_host_id: req.query.tours_host_id,
					is_blocked: false,
					is_deleted: false,
				},
				include: [{
					model: models.ToursHost,
					as: 'toursHost',
				}],
			});
			if (!toursSchedule) {
				return requestHandler.sendSuccess(res, 20002, 'No result')();
			}

			// GET NUMBER OF DAYS TO BOOK TOUR IN ADVANCED
			const systemSetting = await super.getByCustomOptions(req, 'SystemSetting', {
				where: {
					name: columnName.NUMBER_OF_DAYS_TO_BOOK_TOUR_IN_ADVANCED,
					is_deleted: false,
				},
			});
			const numberOfDaysToBookTourInAdvanced = systemSetting ? Number(systemSetting.value) : constants.NUMBER_OF_DAYS_TO_BOOK_TOUR_IN_ADVANCED;

			const requestedDate = req.query.date;

			const data = {};
			data.times_in_date = null;
			data.dates_in_month = [];

			// GET CURRENT DATE YYYY-MM-DD
			const currentDate = new Date();
			const formatedCurrentDate = stringUtil.formatDateYYYYMMDD(currentDate);

			// GET FIRST START DATE THAT USER CAN BOOK A NEW TOUR
			const firstStartDate = new Date(`${formatedCurrentDate}T00:00:00.000+00:00`);
			firstStartDate.setDate(firstStartDate.getUTCDate() + numberOfDaysToBookTourInAdvanced);
			const formatedFirstStartDate = stringUtil.formatDateYYYYMMDD(firstStartDate);

			// FILTER INCLUDED_DATETIMES, EXCLUDED_DATETIMES
			let includedDatetimes = toursSchedule.included_datetimes;
			let excludedDatetimes = toursSchedule.excluded_datetimes;
			if (includedDatetimes) {
				includedDatetimes = includedDatetimes.filter((includedDatetime) => includedDatetime.date > formatedFirstStartDate);
				includedDatetimes = includedDatetimes.filter((includedDatetime) => includedDatetime.date.substring(5, 7) === requestedDate.substring(5, 7) && includedDatetime.date.substring(0, 4) === requestedDate.substring(0, 4));
			}
			if (excludedDatetimes) {
				excludedDatetimes = excludedDatetimes.filter((excludedDatetime) => excludedDatetime.date > formatedFirstStartDate);
				excludedDatetimes = excludedDatetimes.filter((excludedDatetime) => excludedDatetime.date.substring(5, 7) === requestedDate.substring(5, 7) && excludedDatetime.date.substring(0, 4) === requestedDate.substring(0, 4));
			}

			if (!toursSchedule.is_recurring) {
				data.dates_in_month = includedDatetimes;
			} else {
				// DETERMINE THE TIME RANGE TO QUERY ALL SCHEDULE IN MONTH
				const firstDateOfMonth = stringUtil.getFirstDateOfMonth(requestedDate);
				const lastDateOfMonth = stringUtil.getLastDateOfMonth(requestedDate);
				const year = requestedDate.substring(0, 4);
				const month = requestedDate.substring(5, 7);

				if (toursSchedule.recurring_unit === columnName.DAY || toursSchedule.recurring_unit === columnName.DAYWEEK) {
					for (let index = Number(firstDateOfMonth.substring(8, 10)); index <= Number(lastDateOfMonth.substring(8, 10)); index += 1) {
						const day = (index > 9 ? index : `0${index}`).toString();
						const formatedDate = `${year}-${month}-${day}`;
						data.dates_in_month.push({
							date: formatedDate,
							time: toursSchedule.everyday_recurring_hours,
						});
					}
				}

				if (toursSchedule.recurring_unit === columnName.WEEK || toursSchedule.recurring_unit === columnName.DAYWEEK) {
					for (let indexDay = Number(firstDateOfMonth.substring(8, 10)); indexDay <= Number(lastDateOfMonth.substring(8, 10)); indexDay += 1) {
						const day = (indexDay > 9 ? indexDay : `0${indexDay}`).toString();
						const formatedDate = `${year}-${month}-${day}`;
						const date = new Date(`${year}-${month}-${day}T00:00:00.000+00:00`);
						const weekdaytime = toursSchedule.everyweek_recurring_days.find((everyweekRecurringDay) => everyweekRecurringDay.weekday === date.getUTCDay());
						if (weekdaytime) {
							const index = data.dates_in_month.findIndex((dateInMonth) => dateInMonth.date === formatedDate);
							if (index !== -1) {
								data.dates_in_month[index].time = Array.from(new Set(data.dates_in_month[index].time.concat(weekdaytime.time).sort()));
							} else {
								data.dates_in_month.push({
									date: formatedDate,
									time: weekdaytime.time,
								});
							}
						}
					}
				}

				// ADD INCLUDED_DATETIMES
				if (includedDatetimes) {
					for (let indexDate = 0; indexDate < includedDatetimes.length; indexDate += 1) {
						const index = data.dates_in_month.findIndex((dateInMonth) => dateInMonth.date === includedDatetimes[indexDate].date);
						if (index !== -1) {
							data.dates_in_month[index].time = Array.from(new Set(data.dates_in_month[index].time.concat(includedDatetimes[indexDate].time).sort()));
						} else {
							data.dates_in_month.push(includedDatetimes[indexDate]);
						}
					}
				}

				// REMOVE EXCLUDED_DATETIMES
				if (excludedDatetimes) {
					for (let indexDate = 0; indexDate < excludedDatetimes.length; indexDate += 1) {
						const index = data.dates_in_month.findIndex((dateInMonth) => dateInMonth.date === excludedDatetimes[indexDate].date);
						console.log(excludedDatetimes[indexDate]);
						console.log(data.dates_in_month[index]);
						if (index !== -1) {
							for (let indexTime = 0; indexTime < excludedDatetimes[indexDate].time.length; indexTime += 1) {
								data.dates_in_month[index].time = data.dates_in_month[index].time.filter((time) => time !== excludedDatetimes[indexDate].time[indexTime]);
							}
							if (!data.dates_in_month[index].time.length) {
								data.dates_in_month.splice(index, 1);
							}
						}
					}
				}
			}

			// REMOVE DATETIME THAT HAS CONFIRMED ORDER OR PAID ORDER OF THE HOST
			const toursHosts = await super.getAllList(req, 'ToursHost', {
				where: {
					host_id: toursSchedule.toursHost.host_id,
					is_deleted: false,
				},
			});
			const toursHostIds = [];
			for (let index = 0; index < toursHosts.length; index += 1) {
				toursHostIds.push(toursHosts[index].tours_host_id);
			}

			const orders = await super.getAllList(req, 'Order', {
				where: {
					tours_host_id: { [Op.in]: toursHostIds },
					status: { [Op.in]: [2, 3] },
					is_cancelled: false,
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
			if (orders.length) {
				// GET NUMBER OF DAYS TO BOOK TOUR IN ADVANCED
				const systemSettingBreakTime = await super.getByCustomOptions(req, 'SystemSetting', {
					where: {
						name: columnName.TOUR_BREAK_TIME_DURATION_IN_HOUR,
						is_deleted: false,
					},
				});
				const breakTime = systemSettingBreakTime ? Number(systemSettingBreakTime.value) : constants.TOUR_BREAK_TIME_DURATION_IN_HOUR;
				for (let index = 0; index < orders.length; index += 1) {
					const { duration } = orders[index].toursHost.tour;
					const formatedDate = stringUtil.formatDateYYYYMMDD(orders[index].date_time);
					const formatedTime = stringUtil.formatTimeHHMM(orders[index].date_time);
					const timesList = stringUtil.getTimesBetween(formatedTime, duration, breakTime);
					data.dates_in_month = data.dates_in_month.filter((datetime) => {
						if (datetime.date !== formatedDate) {
							return datetime;
						}
						datetime.time = datetime.time.filter((time) => !timesList.includes(time));
						return datetime;
					});
				}
			}

			if (data.dates_in_month.length) {
				for (let index = 0; index < data.dates_in_month.length; index += 1) {
					if (!data.dates_in_month[index].time.length) {
						data.dates_in_month.splice(index, 1);
					}
				}
				data.dates_in_month.sort();
			}
			data.times_in_date = data.dates_in_month.find((dateInMonth) => dateInMonth.date === requestedDate) ? data.dates_in_month.find((dateInMonth) => dateInMonth.date === requestedDate).time : null;

			if (!data.dates_in_month.length && !data.times_in_date) {
				return requestHandler.sendSuccess(res, 20002, 'No result')();
			}
			return requestHandler.sendSuccess(res, 20001, 'Success')(data);
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}

	async toggleBlockStatusOfToursSchedule(req, res) {
		try {
			const toursSchedule = await super.getByCustomOptions(req, 'ToursSchedule', {
				where: {
					tours_host_id: req.params.id,
					is_deleted: false,
				},
				include: [{
					model: models.ToursHost,
					as: 'toursHost',
				}],
			});
			if (!toursSchedule) {
				return requestHandler.sendSuccess(res, 20002, 'No result')();
			}

			// CHECK PERMISSION
			const tokenFromHeader = auth.getJwtToken(req);
			const account = jwt.decode(tokenFromHeader);
			if (toursSchedule.toursHost.host_id !== account.payload.user_id) {
				return requestHandler.sendFailure(res, 40001, 'No permission')();
			}

			// UPDATE BLOCK STATUS
			toursSchedule.is_blocked = !toursSchedule.is_blocked;
			if (toursSchedule.save()) {
				return requestHandler.sendSuccess(res, 20001, 'Success')(toursSchedule);
			}
			return requestHandler.sendFailure(res, 40001, 'Unable to process the contained instructions')();
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}

	async updateToursSchedule(req, res) {
		try {
			// CHECK PERMISSION
			const toursHost = await super.getByCustomOptions(req, 'ToursHost', {
				where: {
					tours_host_id: req.params.id,
					is_deleted: false,
				},
			});
			const tokenFromHeader = auth.getJwtToken(req);
			const account = jwt.decode(tokenFromHeader);
			if (toursHost.host_id !== account.payload.user_id) {
				return requestHandler.sendFailure(res, 40001, 'No permission')();
			}

			const toursSchedule = await super.getByCustomOptions(req, 'ToursSchedule', {
				where: {
					tours_host_id: req.params.id,
					is_deleted: false,
				},
				include: [{
					model: models.ToursHost,
					as: 'toursHost',
				}],
			});
			if (!toursSchedule) {
				// CREATE
				const createdToursSchedule = await super.create(req, 'ToursSchedule', {
					tours_host_id: req.params.id,
					included_datetimes: JSON.stringify(req.body.included_datetimes),
					excluded_datetimes: JSON.stringify(req.body.excluded_datetimes),
					everyweek_recurring_days: JSON.stringify(req.body.everyweek_recurring_days),
					everyday_recurring_hours: JSON.stringify(req.body.everyday_recurring_hours),
					recurring_unit: req.body.recurring_unit,
					is_recurring: req.body.is_recurring,
					is_blocked: false,
				});
				return requestHandler.sendSuccess(res, 20001, 'Sucess')(createdToursSchedule);
			}

			// UPDATE
			toursSchedule.included_datetimes = JSON.stringify(req.body.included_datetimes);
			toursSchedule.excluded_datetimes = JSON.stringify(req.body.excluded_datetimes);
			toursSchedule.everyweek_recurring_days = JSON.stringify(req.body.everyweek_recurring_days);
			toursSchedule.everyday_recurring_hours = JSON.stringify(req.body.everyday_recurring_hours);
			toursSchedule.recurring_unit = req.body.recurring_unit;
			toursSchedule.is_recurring = req.body.is_recurring;
			if (toursSchedule.save()) {
				return requestHandler.sendSuccess(res, 20001, 'Success')(toursSchedule);
			}
			return requestHandler.sendFailure(res, 40001, 'Unable to process the contained instructions')();
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}
}
module.exports = new ToursSchedulesController();
