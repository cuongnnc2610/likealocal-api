/* eslint-disable max-len */
const { ToursHost } = require('../models');

function randomEverydayRecurringHours() {
	const hours = [
		'08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
		'08:30', '09:30', '10:30', '11:30', '12:30', '13:30', '14:30', '15:30', '16:30', '17:30', '18:30'];
	const hoursSet = new Set();
	const numberOfHours = Math.floor(Math.random() * (8 - 1 + 1) + 1);
	for (let index = 0; index < numberOfHours; index += 1) {
		hoursSet.add(hours[Math.floor(Math.random() * (hours.length - 1 - 0 + 1) + 0)]);
	}
	return Array.from(hoursSet).sort();
}

function randomEveryweekRecurringDays() {
	// SUNDAY: 0: MONDAY: 1, TUESDAY: 2,... SATURDAY: 6
	const weekday = [0, 1, 2, 3, 4, 5, 6];
	let weekdaysSet = new Set();
	const numberOfDays = Math.floor(Math.random() * (4 - 1 + 1) + 1);
	for (let index = 0; index < numberOfDays; index += 1) {
		weekdaysSet.add(weekday[Math.floor(Math.random() * (weekday.length - 1 - 0 + 1) + 0)]);
	}
	weekdaysSet = Array.from(weekdaysSet).sort();
	const data = [];
	for (let index = 0; index < weekdaysSet.length; index += 1) {
		data.push({
			weekday: weekdaysSet[index],
			time: randomEverydayRecurringHours(),
		});
	}
	return JSON.stringify(data);
}

function randomDatetimes() {
	const dates = [
		'2020-11-01', '2020-11-02', '2020-11-03', '2020-11-04', '2020-11-05', '2020-11-06', '2020-11-07', '2020-11-08', '2020-11-09', '2020-11-10',
		'2020-11-11', '2020-11-12', '2020-11-13', '2020-11-14', '2020-11-15', '2020-11-16', '2020-11-17', '2020-11-18', '2020-11-19', '2020-11-20',
		'2020-11-21', '2020-11-22', '2020-11-23', '2020-11-24', '2020-11-25', '2020-11-26', '2020-11-27', '2020-11-28', '2020-11-29', '2020-11-30',
		'2020-12-01', '2020-12-02', '2020-12-03', '2020-12-04', '2020-12-05', '2020-12-06', '2020-12-07', '2020-12-08', '2020-12-09', '2020-12-10',
		'2020-12-11', '2020-12-12', '2020-12-13', '2020-12-14', '2020-12-15', '2020-12-16', '2020-12-17', '2020-12-18', '2020-12-19', '2020-12-20',
		'2020-12-21', '2020-12-22', '2020-12-23', '2020-12-24', '2020-12-25', '2020-12-26', '2020-12-27', '2020-12-28', '2020-12-29', '2020-12-30',
		'2021-01-01', '2021-01-02', '2021-01-03', '2021-01-04', '2021-01-05', '2021-01-06', '2021-01-07', '2021-01-08', '2021-01-09', '2021-01-10',
		'2021-01-11', '2021-01-12', '2021-01-13', '2021-01-14', '2021-01-15', '2021-01-16', '2021-01-17', '2021-01-18', '2021-01-19', '2021-01-20',
		'2021-01-21', '2021-01-22', '2021-01-23', '2021-01-24', '2021-01-25', '2021-01-26', '2021-01-27', '2021-01-28', '2021-01-29', '2021-01-30',
	];
	let datesSet = new Set();
	const numberOfDates = Math.floor(Math.random() * (8 - 1 + 1) + 1);
	for (let index = 0; index < numberOfDates; index += 1) {
		datesSet.add(dates[Math.floor(Math.random() * (dates.length - 1 - 0 + 1) + 0)]);
	}
	datesSet = Array.from(datesSet).sort();
	const data = [];
	for (let index = 0; index < datesSet.length; index += 1) {
		data.push({
			date: datesSet[index],
			time: randomEverydayRecurringHours(),
		});
	}
	return JSON.stringify(data);
}

module.exports = {
	// eslint-disable-next-line no-unused-vars
	up: async (queryInterface, Sequelize) => {
		const data = [];
		const toursHosts = await ToursHost.findAll({
			where: {
				is_deleted: false,
			},
		});
		for (let index = 0; index < toursHosts.length; index += 1) {
			let includedDatetimes = null;
			let excludedDatetimes = null;
			let everyweekRecurringDays = null;
			let everydayRecurringHours = null;
			let recurringUnit = null;
			const isRecurring = Math.random() >= 0.3;
			if (isRecurring) {
				// eslint-disable-next-line no-nested-ternary
				recurringUnit = Math.random() <= 0.33 ? 'DAY' : Math.random() >= 0.5 ? 'WEEK' : 'DAYWEEK';
				if (recurringUnit === 'DAY' || recurringUnit === 'DAYWEEK') {
					everydayRecurringHours = JSON.stringify(randomEverydayRecurringHours());
				}
				if (recurringUnit === 'WEEK' || recurringUnit === 'DAYWEEK') {
					everyweekRecurringDays = randomEveryweekRecurringDays();
				}
				excludedDatetimes = Math.random() >= 0.2 ? randomDatetimes() : null;
			}
			includedDatetimes = Math.random() >= 0.2 ? randomDatetimes() : null;
			data.push({
				tours_host_id: toursHosts[index].tours_host_id,
				included_datetimes: includedDatetimes,
				excluded_datetimes: excludedDatetimes,
				everyweek_recurring_days: everyweekRecurringDays,
				everyday_recurring_hours: everydayRecurringHours,
				recurring_unit: recurringUnit,
				is_recurring: isRecurring,
				// start_date: ,
				// end_date: ,
				is_blocked: Math.random() >= 0.8,
				is_deleted: false,
				created_at: new Date(),
			});
		}
		return queryInterface.bulkInsert('tours_schedules', data, {});
	},
	// eslint-disable-next-line no-unused-vars
	down: (queryInterface, Sequelize) => queryInterface.bulkDelete('tours_schedules', null, {}),
};
