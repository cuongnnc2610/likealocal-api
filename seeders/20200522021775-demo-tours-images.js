/* eslint-disable max-len */
const { Tour } = require('../models');

module.exports = {
	// eslint-disable-next-line no-unused-vars
	up: async (queryInterface, Sequelize) => {
		const data = [];
		const images = [
			'https://withlocals-com-res.cloudinary.com/image/upload/w_830,h_467,c_fill,g_auto,q_auto,dpr_1.0,f_auto/6cfa4cac8063554679265cba1e28dd9a',
			'https://withlocals-com-res.cloudinary.com/image/upload/w_830,h_467,c_fill,g_auto,q_auto,dpr_1.0,f_auto/2aef463264e35dbb8b5b4646dab3f5cf',
			'https://withlocals-com-res.cloudinary.com/image/upload/w_830,h_467,c_fill,g_auto,q_auto,dpr_1.0,f_auto/d8a984074e80a718ee84230592900f9b',
			'https://withlocals-com-res.cloudinary.com/image/upload/w_830,h_467,c_fill,g_auto,q_auto,dpr_1.0,f_auto/8b7447b6acfe94ee5300c35eb6fbe72e',
			'https://withlocals-com-res.cloudinary.com/image/upload/w_830,h_467,c_fill,g_auto,q_auto,dpr_1.0,f_auto/c8b425f762bf0fcb807336a7c5657214',
			'https://withlocals-com-res.cloudinary.com/image/upload/w_830,h_467,c_fill,g_auto,q_auto,dpr_1.0,f_auto/903c6f14aef4de308c2430f91844b732',
			'https://withlocals-com-res.cloudinary.com/image/upload/w_830,h_467,c_fill,g_auto,q_auto,dpr_1.0,f_auto/ec408824d7b3efa29768611b2b121318',
			'https://withlocals-com-res.cloudinary.com/image/upload/w_830,h_467,c_fill,g_auto,q_auto,dpr_1.0,f_auto/774247aa43d5b99da476c919c6aa365e',
			'https://withlocals-com-res.cloudinary.com/image/upload/w_830,h_467,c_fill,g_auto,q_auto,dpr_1.0,f_auto/5a582e653cabb4572e35fa57c7ba5af7',
			'https://withlocals-com-res.cloudinary.com/image/upload/w_830,h_467,c_fill,g_auto,q_auto,dpr_1.0,f_auto/89934beae182108c838e53e027e50f28',
			'https://withlocals-com-res.cloudinary.com/image/upload/w_830,h_467,c_fill,g_auto,q_auto,dpr_1.0,f_auto/c8b425f762bf0fcb807336a7c5657214',
			'https://withlocals-com-res.cloudinary.com/image/upload/w_750,h_424,c_fill,g_auto,q_auto,dpr_1.0,f_auto/f02bdc7f48aebfef21974c6831da64ab',
			'https://withlocals-com-res.cloudinary.com/image/upload/w_750,h_424,c_fill,g_auto,q_auto,dpr_1.0,f_auto/3473e2f2da014bd976bc07cdfa86a1fe',
			'https://withlocals-com-res.cloudinary.com/image/upload/w_750,h_424,c_fill,g_auto,q_auto,dpr_1.0,f_auto/aaf5c3888e3c2d3654da51b335d3af57',
			'https://withlocals-com-res.cloudinary.com/image/upload/w_750,h_424,c_fill,g_auto,q_auto,dpr_1.0,f_auto/467b0ac40e32e1e049ca6f478865f73d',
			'https://withlocals-com-res.cloudinary.com/image/upload/w_830,h_467,c_fill,g_auto,q_auto,dpr_1.0,f_auto/05cc277325656a7b2d1a0330928ffcb3',
			'https://withlocals-com-res.cloudinary.com/image/upload/w_830,h_467,c_fill,g_auto,q_auto,dpr_1.0,f_auto/1f107ab98df5886d8b32d4d17538171a',
			'https://withlocals-com-res.cloudinary.com/image/upload/w_830,h_467,c_fill,g_auto,q_auto,dpr_1.0,f_auto/0d050f851df7931a3cb5c6ff7f7f9b45',
			'https://withlocals-com-res.cloudinary.com/image/upload/w_830,h_467,c_fill,g_auto,q_auto,dpr_1.0,f_auto/5f5307c81ac3c09150e408a96da2f779',
			'https://withlocals-com-res.cloudinary.com/image/upload/w_830,h_467,c_fill,g_auto,q_auto,dpr_1.0,f_auto/5ef7ebcb1fbf9fc4eaee7b47dba70607',
			'https://withlocals-com-res.cloudinary.com/image/upload/w_750,h_424,c_fill,g_auto,q_auto,dpr_1.0,f_auto/c356d9f2c9535d4dee876f10893083d4',
			'https://withlocals-com-res.cloudinary.com/image/upload/w_750,h_424,c_fill,g_auto,q_auto,dpr_1.0,f_auto/7a9e244e87f4836c1f357891664ddc44',
			'https://withlocals-com-res.cloudinary.com/image/upload/w_750,h_424,c_fill,g_auto,q_auto,dpr_1.0,f_auto/9311a078b4f81274e64e4a25cc17dd00',
			'https://withlocals-com-res.cloudinary.com/image/upload/w_750,h_424,c_fill,g_auto,q_auto,dpr_1.0,f_auto/b52b763b23ee1c098d22f61c8ca666e8',
		];
		const findAllTour = () => Tour.findAll({
			where: {
				is_deleted: false,
			},
		});
		const [tours] = await Promise.all([findAllTour()]);
		for (let indexTour = 0; indexTour < tours.length; indexTour += 1) {
			const numberOfImages = Math.floor(Math.random() * (10 - 4 + 1) + 4);
			for (let indexImage = 0; indexImage < numberOfImages; indexImage += 1) {
				data.push({
					tour_id: tours[indexTour].tour_id,
					path: images[Math.floor(Math.random() * (images.length - 1 - 0 + 1) + 0)],
					status: Math.floor(Math.random() * (2 - 0 + 1) + 0),
					is_deleted: false,
					created_at: new Date(),
				});
			}
		}
		return queryInterface.bulkInsert('tours_images', data, {});
	},
	// eslint-disable-next-line no-unused-vars
	down: (queryInterface, Sequelize) => queryInterface.bulkDelete('tours_images', null, {}),
};
