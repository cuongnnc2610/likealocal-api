const _ = require('lodash');
const RequestHandler = require('../utils/RequestHandler');
const Logger = require('../utils/logger');
const BaseController = require('./BaseController');

const logger = new Logger();
const requestHandler = new RequestHandler(logger);

class SystemSettingsController extends BaseController {
	async getAllSystemSettings(req, res) {
		try {
			const systemSettings = await super.getAllList(req, 'SystemSetting', {
				where: {
					is_deleted: false,
				},
			});
			if (!systemSettings) {
				return requestHandler.sendSuccess(res, 20002, 'No results')();
			}

			const data = {};
			data.systemSettings = [];
			systemSettings.forEach((result) => {
				const systemSetting = _.omit(result.dataValues, ['createdAt', 'updatedAt']);
				systemSetting.name = _.capitalize(systemSetting.name.toLowerCase().replace(/_/g, ' '));
				data.systemSettings.push(systemSetting);
			});

			return requestHandler.sendSuccess(res, 20001, 'Get success')(data);
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}

	async updateSystemSetting(req, res) {
		try {
			// CHECK IF SYSTEM_SETTING_ID EXISTS
			const systemSetting = await super.getByCustomOptions(req, 'SystemSetting', {
				where: {
					system_setting_id: req.params.id,
					is_deleted: false,
				},
			});
			if (!systemSetting) {
				return requestHandler.sendFailure(res, 40002, 'Field system_setting_id does not exist')();
			}

			// UPDATE SYSTEM SETTING
			systemSetting.value = req.body.value;
			if (systemSetting.save()) {
				return requestHandler.sendSuccess(res, 20001, 'Get success')(systemSetting);
			}
			return requestHandler.sendFailure(res, 40001, 'Unable to process the contained instructions')();
		} catch (error) {
			return requestHandler.sendFailure(res, 40001, error.message)();
		}
	}
}
module.exports = new SystemSettingsController();
