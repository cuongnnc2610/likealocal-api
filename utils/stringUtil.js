const _ = require('lodash');
const auth = require('./auth');

module.exports = {
	generateString(number = 8, hasSpace = false) {
		let text = '';
		const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

		for (let i = 0; i < number; i += 1) {
			if (hasSpace && Math.random() >= 0.8 && text[text.length - 1] !== ' ') {
				text += ' ';
			} else {
				text += possible.charAt(Math.floor(Math.random() * possible.length));
			}
		}
		return text;
	},

	generateNumber(number = 6) {
		let text = '';
		const possible = '0123456789';

		for (let i = 0; i < number; i += 1) {
			text += possible.charAt(Math.floor(Math.random() * possible.length));
		}
		return text;
	},

	formatDateYYYYMMDD(date) {
		const month = (date.getUTCMonth() + 1) > 9 ? (date.getUTCMonth() + 1) : `0${date.getUTCMonth() + 1}`;
		const day = date.getUTCDate() > 9 ? date.getUTCDate() : `0${date.getUTCDate()}`;
		return `${date.getFullYear()}-${month}-${day}`;
	},

	formatTimeHHMM(date) {
		const hour = date.getUTCHours() > 9 ? date.getUTCHours() : `0${date.getUTCHours()}`;
		const minute = date.getUTCMinutes() > 9 ? date.getUTCMinutes() : `0${date.getUTCMinutes()}`;
		return `${hour}:${minute}`;
	},

	getFirstDateOfMonth(formatedDate) {
		const year = formatedDate.substring(0, 4);
		const month = formatedDate.substring(5, 7);
		return `${year}-${month}-01`;
	},

	getLastDateOfMonth(formatedDate) {
		let year = formatedDate.substring(0, 4);
		let month = formatedDate.substring(5, 7);
		if (month !== '12') {
			month = (Number(month) + 1).toString();
		} else {
			year = (Number(year) + 1).toString();
			month = '01';
		}
		const lastDayOfMonth = new Date(new Date(`${year}-${month}-01 00:00:00`).getTime() - 1);
		month = (lastDayOfMonth.getUTCMonth() + 1) > 9 ? (lastDayOfMonth.getUTCMonth() + 1) : `0${lastDayOfMonth.getUTCMonth() + 1}`;
		return `${year}-${month}-${lastDayOfMonth.getUTCDate()}`;
	},

	timeHHMMToFloat(time) {
		const integralPart = Number(time.substring(0, 2));
		const fractionalPart = time.substring(3, 5) === '30' ? 0.5 : 0;
		return integralPart + fractionalPart;
	},

	timeFloatToHHMM(time) {
		const hour = Math.floor(time) > 9 ? Math.floor(time) : `0${Math.floor(time)}`;
		const minute = time - Math.floor(time) > 0 ? '30' : '00';
		return `${hour}:${minute}`;
	},

	getTimesBetween(time, duration, breakTime = 0) {
		const timesList = [];
		time = module.exports.timeHHMMToFloat(time);
		const endTime = time + duration + breakTime;
		while (time <= endTime) {
			timesList.push(module.exports.timeFloatToHHMM(time));
			time += 0.5;
		}
		return timesList;
	},

	utcOffsetToFloat(utcOffset) {
		const integralPart = Number(utcOffset.substring(1, 3));
		const fractionalPart = utcOffset.substring(4, 6) === '30' ? 0.5 : 0;
		const offsetInFloat = utcOffset.substring(0, 1) === '+' ? integralPart + fractionalPart : -(integralPart + fractionalPart);
		return offsetInFloat;
	},

	formatId(num, size) {
		let s = `${num}`;
		while (s.length < size) s = `0${s}`;
		return s;
	},

	trimObject(object) {
		Object.keys(object).forEach((key) => {
			const val = object[key];
			if (!_.isNumber(val)) {
				object[key] = val.trim();
			}
		});

		return object;
	},

	timeClientToTimeDB(req, timeRequestOnClient) {
		const dateOnServer = new Date();

		// eslint-disable-next-line max-len
		const timeDB = new Date(
			new Date(timeRequestOnClient).getTime()
        + Math.abs(dateOnServer.getTimezoneOffset() * 60 * 1000)
        + auth.getTimezoneOffset(req) * 60 * 1000,
		);

		return timeDB;
	},

	timeClientToTimestampUTC(req, timeRequestOnClient) {
		const dateOnServer = new Date();

		// eslint-disable-next-line max-len
		const timeDB = new Date(
			new Date(timeRequestOnClient).getTime()
        + Math.abs(dateOnServer.getTimezoneOffset() * 60 * 1000)
        + auth.getTimezoneOffset(req) * 60 * 1000,
		);

		return timeDB.getTime();
	},

	timeDBToTimeClient(req, timeOnDB) {
		// eslint-disable-next-line max-len
		const timeClient = new Date(
			new Date(timeOnDB).getTime() - auth.getTimezoneOffset(req) * 60 * 1000,
		);

		return timeClient;
	},

	timeDBToTimeServer(timeOnDB) {
		const dateOnServer = new Date();

		// eslint-disable-next-line max-len
		const timeClient = new Date(
			new Date(timeOnDB).getTime()
        + Math.abs(dateOnServer.getTimezoneOffset() * 60 * 1000),
		);
		// eslint-disable-next-line max-len

		return timeClient;
	},

	timeDBToTimestampUTC(timeOnDB) {
		const dateOnServer = new Date();

		// eslint-disable-next-line max-len
		const timestamp = new Date(
			new Date(timeOnDB).getTime()
        + Math.abs(dateOnServer.getTimezoneOffset() * 60 * 1000),
		).getTime();

		return timestamp;
	},
};
