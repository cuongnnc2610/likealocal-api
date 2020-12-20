/* eslint-disable max-len */
const { Tour, Benefit } = require('../models');

module.exports = {
	// eslint-disable-next-line no-unused-vars
	up: async (queryInterface, Sequelize) => {
		const data = [];
		const findAllTour = () => Tour.findAll({
			where: {
				is_deleted: false,
			},
		});
		const findAllBenefit = () => Benefit.findAll({
			where: {
				is_deleted: false,
			},
		});
		const [tours, benefits] = await Promise.all([findAllTour(), findAllBenefit()]);
		for (let indexTour = 0; indexTour < tours.length; indexTour += 1) {
			const numberOfBenefits = Math.floor(Math.random() * (10 - 4 + 1) + 4);
			const benefitIds = new Set();
			for (let indexImage = 0; indexImage < numberOfBenefits; indexImage += 1) {
				const benefitId = benefits[Math.floor(Math.random() * (benefits.length - 1 - 0 + 1) + 0)].benefit_id;
				if (!benefitIds.has(benefitId)) {
					data.push({
						tour_id: tours[indexTour].tour_id,
						benefit_id: benefitId,
						is_included: Math.random() >= 0.5,
						is_deleted: false,
						created_at: new Date(),
					});
					benefitIds.add(benefitId);
				}
			}
		}
		return queryInterface.bulkInsert('tours_benefits', data, {});
	},
	// eslint-disable-next-line no-unused-vars
	down: (queryInterface, Sequelize) => queryInterface.bulkDelete('tours_benefits', null, {}),
};
