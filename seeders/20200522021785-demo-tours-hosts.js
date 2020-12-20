/* eslint-disable max-len */
const { User, Tour } = require('../models');

module.exports = {
	// eslint-disable-next-line no-unused-vars
	up: async (queryInterface, Sequelize) => {
		const data = [];
		const findAllTour = () => Tour.findAll({
			where: {
				is_deleted: false,
			},
			include: [{
				model: User,
				as: 'host',
			}],
		});
		const findAllHost = () => User.findAll({
			where: {
				level_id: 3,
				is_deleted: false,
			},
		});
		const [tours, hosts] = await Promise.all([findAllTour(), findAllHost()]);
		for (let indexTour = 0; indexTour < tours.length; indexTour += 1) {
			const tourOwnerId = tours[indexTour].host.user_id;
			data.push({
				tour_id: tours[indexTour].tour_id,
				host_id: tourOwnerId,
				is_agreed: true,
				is_deleted: false,
				created_at: new Date(),
			});
			const numberOfHosts = Math.floor(Math.random() * (6 - 0 + 1) + 0);
			const hostIds = new Set();
			hostIds.add(tourOwnerId);
			for (let indexHost = 0; indexHost < numberOfHosts; indexHost += 1) {
				const hostId = hosts[Math.floor(Math.random() * (hosts.length - 1 - 0 + 1) + 0)].user_id;
				if (!hostIds.has(hostId)) {
					data.push({
						tour_id: tours[indexTour].tour_id,
						host_id: hostId,
						is_agreed: Math.random() >= 0.5,
						is_deleted: false,
						created_at: new Date(),
					});
					hostIds.add(hostId);
				}
			}
		}
		return queryInterface.bulkInsert('tours_hosts', data, {});
	},
	// eslint-disable-next-line no-unused-vars
	down: (queryInterface, Sequelize) => queryInterface.bulkDelete('tours_hosts', null, {}),
};
