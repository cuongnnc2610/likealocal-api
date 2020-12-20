/* eslint-disable max-len */
const bcrypt = require('bcrypt');
const config = require('../config/app');
const { City } = require('../models');
const stringUtil = require('../utils/stringUtil');
const constants = require('../utils/constants');

module.exports = {
	// eslint-disable-next-line no-unused-vars
	up: async (queryInterface, Sequelize) => {
		const cities = await City.findAll();
		let createdAt = 1601485200000;
		let updatedAt = 1601539200000;
		const data = [];
		const avatars = [
			'https://withlocals-com-res.cloudinary.com/image/upload/w_806,h_453,c_fill,g_auto,q_auto,dpr_2.0,f_auto/4a4911c1bc77e6fca5543f1af90ac511',
			'https://likealocal-stagingbucket.s3.ap-southeast-1.amazonaws.com/tour-cover/local1602743270730.jpg',
			'https://likealocal-stagingbucket.s3.ap-southeast-1.amazonaws.com/tour-cover/tourguide1602743243931.jpg',
			'https://withlocals-com-res.cloudinary.com/image/upload/w_806,h_453,c_fill,g_auto,q_auto,dpr_2.0,f_auto/b4e336775f06489fc9c1e3474458249c',
			'https://withlocals-com-res.cloudinary.com/image/upload/w_806,h_453,c_fill,g_auto,q_auto,dpr_2.0,f_auto/f00a09801b8f004018d183d5348eff65',
			'https://withlocals-com-res.cloudinary.com/image/upload/w_806,h_453,c_fill,g_auto,q_auto,dpr_2.0,f_auto/711033fbbc80ff0a3642211458aec94b',
			'https://withlocals-com-res.cloudinary.com/image/upload/w_806,h_453,c_fill,g_auto,q_auto,dpr_2.0,f_auto/d6e7d76059c6eeeb17d602c9092d20d0',
			'https://withlocals-com-res.cloudinary.com/image/upload/w_806,h_453,c_fill,g_auto,q_auto,dpr_2.0,f_auto/ec93bc0be320f187b30cc5ecc1650b8c',
			'https://withlocals-com-res.cloudinary.com/image/upload/w_806,h_453,c_fill,g_auto,q_auto,dpr_2.0,f_auto/3adc4c79fedc5baf8df437024f05e0fa',
			'https://withlocals-com-res.cloudinary.com/image/upload/w_806,h_453,c_fill,g_auto,q_auto,dpr_2.0,f_auto/6601c580b5427a3ba079ae7aa2a3ae8f',
			'https://withlocals-com-res.cloudinary.com/image/upload/w_806,h_453,c_fill,g_auto,q_auto,dpr_2.0,f_auto/604af8de4497ba75e3f00ed991884ec2'
		];
		const introductionVideos = [
			'https://withlocals-com-res.cloudinary.com/video/upload/c_scale,w_1024/v1537174688/host/the-Netherlands/Amsterdam/mmm-amsterdam-s-best-family-food-tour-491c9917/Carolina-J-85cbac60/originals_video_mhTtohzCa7s.mp4',
			'https://likealocal-stagingbucket.s3.ap-southeast-1.amazonaws.com/introduction-video/tnpl3vpj.vasiliki1602758780110.webm',
			'https://likealocal-stagingbucket.s3-ap-southeast-1.amazonaws.com/introduction-video/originals_video_SeL8H6Ustl01606571288583.mp4',
			'https://withlocals-com-res.cloudinary.com/video/upload/c_scale,w_1024/v1537173930/host/the-Netherlands/Amsterdam/amsterdam-s-favorite-food-tour-3132dea7/Marten-K-1262a004/originals_video_HFP2Dmpf5sk.mp4',
			'https://withlocals-com-res.cloudinary.com/video/upload/c_scale,w_1024/v1537183095/host/the-Netherlands/Amsterdam/skip-the-line-rijksmuseum-dutch-masterpieces-tour-d79aaeee/Claire-H-6f6975d5/originals_video_ahXcViytpQ8.mp4',
			'https://withlocals-com-res.cloudinary.com/video/upload/c_scale,w_1024/v1582821189/host/Netherlands/Amsterdam/default/Rolf-L-3e55368e/r88t6bq8.rolf.mp4',
			'https://withlocals-com-res.cloudinary.com/video/upload/c_scale,w_1024/v1537183058/host/the-Netherlands/Amsterdam/skip-the-line-rijksmuseum-dutch-masterpieces-tour-d79aaeee/Merel-C-440d2846/originals_video_3S19zqSt2do.mp4',
			'https://withlocals-com-res.cloudinary.com/video/upload/c_scale,w_1024/v1524614629/host/the-Netherlands/Amsterdam/highlights-hidden-gems-of-amsterdam-73d6d9f0/Arunabha-S-c817dcc2/withlocals_originals_arunabha_sengupta.mp4',
			'https://withlocals-com-res.cloudinary.com/video/upload/c_scale,w_1024/v1524615036/host/the-Netherlands/Amsterdam/lekker-amsterdam-s-best-family-food-tour-491c9917/Christa-M-d4a8fc8d/withlocals_originals_christa_mieras.mp4',
		];
		const selfIntroductions = [
			'I grew up in a village just outside of Amsterdam and moved to the city when I was 18 to study social sciences and european studies. I loved living here; especially all the fine culture that this city has to offer. After graduating from the University of Amsterdam I spent some time working in a great variety of fields such as science, music, spirituality and art, which eventually led me into tour guiding. This allows me to share my knowledge of the city and it\'s culture with other people.',
			'Hello there, my name is Sebastian and I was raised in Germany and evolved into a grown-up in the Netherlands. My father is German and my mother Dutch - that makes me best of both worlds (I hope :) ).\
			I\'m living in the Netherlands for about 17 years now. First in Rotterdam and later, with a detour via Hamburg, in Amsterdam.\
			I love to be active in the city and see how it develops. The world is never the same and so is my city ... come and explore it with me.',
			'I am Colombian choreographer interested in the relations between people and space. I like to create relations in my artistic work and in daily life. I often collaborate with other artists and the artistic work ranges from visual interactive images to ecological relation systems (public, performers and choreographer are in the same level. Everyone give, everyone receive). My artistic research deals with the relation between humans, emphasizes the image as a storytelling, and delicately explores relationships between body and technology.',
			'I love to meet new people and show them the best of Amsterdam and surroundings. I am a professional tour guide back in Guatemala, worked with people with different backgrounds and interests (journalists, photographers, TV crews, and tourists). Traveling and meeting new people is my passion! I live more than a decade in and around Amsterdam, my home, which I will love to share it with you!',
			'Walking through modern day Amsterdam is like timetravelling. During our tour you will feel the unique atmosphere which defines Amsterdam. It’s the feeling of freedom and liberty that will surround you. During the tour I will tell and show you how the Amsterdam-mentality came into existence and is fixed in it’s architecture, citystructure, houses, bars and museums.',
			'I am an art historian with a passion for art in the broadest sense; from the deep, dark corners of the Middle Ages to modern and contemporary works. I am also interested in different mediums, ranging from paintings and sculpture to photography and film. I am intrigued by how much art works can tell about certain places and moments in time; it has something magical to it. Art simply breathes life.\
			After graduating a Masters in Art History, I became a freelance writer, researcher and cultural entrepreneur. My days, projects and jobs are never the same, therefore I have gained experience within different fields.',
			'I\'m a professional art historian and love to tell stories with nice details, so you\'ll never forget the place you\'ve visit. If there is one talent which I used the most, it is telling stories. I want to distinguish myself by telling hidden gems and details that other are obvious. I do my own research and try improve my tours constantly. A story about the meaning of the artworks is nice but the why, when, where and who is even more fun.',
			'Hi! I am writer and film curator, passionate about art and culture. I like curious stories about cities and I am very inspired by the hidden secrets of Amsterdam.',
			'I have studied violin at the Conservatory and Art History and Design at the University of Amsterdam so I would love to take you on a tour and tell you more about this beautiful city and its connection with the arts. There is so much to tell, taste and see.\
			After my study I started my own design company and musical collective with which we perform on festivals, so if you are interested in contemporay Dutch music or the combination of tulips and 17th century art or if you have a wild specific interest of your own, I will shape the tour around your favourite subjects and show you all the hidden nooks and crannies of the city combined with the best food and art.',
			'I am a freelance sportswriter with a past in IT Process Consulting. I am also a passionate traveller, voracious reader and a history buff. I am especially interested in the modern history of Amsterdam, how it became the liberal city of today. I know the nooks and corners of the city, as well as the incredible getaways into nature that lie just a cycle ride away.',
			'As a pianist and piano teacher, I love to walk and talk about beautiful places in Amsterdam in my spare hours. I\'ll show you what the town has to offer, and for me it will be a nice way to meet people from abroad. I have been living in France and Spain so it will be lovely to meet people who speak those languages. My mother is from Germany, my father from Amsterdam. All together I will do my best to make your trip in this city unforgettable. Hope to see you soon!',
		];
		data.push({
			email: 'superadmin@gmail.com',
			user_name: 'superadmin',
			level_id: constants.LEVEL_ADMIN,
			is_tour_guide: false,
			is_verified: true,
			password: bcrypt.hashSync('likealocal@2020', config.auth.saltRounds),
			avatar: 'https://likealocal-stagingbucket.s3.ap-southeast-1.amazonaws.com/tour-cover/admin1602742983963.png',
			city_id: cities[Math.floor(Math.random() * (cities.length - 1 - 0 + 1) + 0)].city_id,
			request_status: constants.HOST_REQUEST_NONE,
			balance: 0,
			created_at: new Date(createdAt),
			updated_at: new Date(updatedAt),
		});

		for (let index = 1; index <= 30; index += 1) {
			createdAt += Math.floor(Math.random() * (5 - 1 + 1) + 1) * 3600000;
			updatedAt += Math.floor(Math.random() * (5 - 1 + 1) + 1) * 3600000;
			data.push({
				email: `user${index}@gmail.com`,
				user_name: `user${index}`,
				level_id: constants.LEVEL_USER,
				is_tour_guide: false,
				is_verified: true,
				password: bcrypt.hashSync('likealocal@2020', config.auth.saltRounds),
				avatar: 'https://likealocal-stagingbucket.s3.ap-southeast-1.amazonaws.com/tour-cover/user1602743222729.jpg',
				city_id: cities[Math.floor(Math.random() * (cities.length - 1 - 0 + 1) + 0)].city_id,
				request_status: constants.HOST_REQUEST_NONE,
				balance: 0,
				created_at: new Date(createdAt),
				updated_at: new Date(updatedAt),
			});
			createdAt += Math.floor(Math.random() * (5 - 1 + 1) + 1) * 3600000;
			updatedAt += Math.floor(Math.random() * (5 - 1 + 1) + 1) * 3600000;
			data.push({
				email: `local${index}@gmail.com`,
				user_name: `local${index}`,
				level_id: constants.LEVEL_HOST,
				is_tour_guide: false,
				is_verified: true,
				password: bcrypt.hashSync('likealocal@2020', config.auth.saltRounds),
				avatar: avatars[Math.floor(Math.random() * (avatars.length - 1 - 0 + 1) + 0)],
				introduction_video: introductionVideos[Math.floor(Math.random() * (introductionVideos.length - 1 - 0 + 1) + 0)],
				self_introduction: selfIntroductions[Math.floor(Math.random() * (selfIntroductions.length - 1 - 0 + 1) + 0)],
				city_id: cities[Math.floor(Math.random() * (cities.length - 1 - 0 + 1) + 0)].city_id,
				phone_number: `0${stringUtil.generateNumber(9)}`,
				request_status: constants.HOST_REQUEST_NONE,
				balance: (Math.random() * (100 - 0 + 1) + 0).toFixed(2),
				created_at: new Date(createdAt),
				updated_at: new Date(updatedAt),
			});
			createdAt += Math.floor(Math.random() * (5 - 1 + 1) + 1) * 3600000;
			updatedAt += Math.floor(Math.random() * (5 - 1 + 1) + 1) * 3600000;
			data.push({
				email: `tourguide${index}@gmail.com`,
				user_name: `tourguide${index}`,
				level_id: constants.LEVEL_HOST,
				is_tour_guide: true,
				is_verified: true,
				password: bcrypt.hashSync('likealocal@2020', config.auth.saltRounds),
				avatar: avatars[Math.floor(Math.random() * (avatars.length - 1 - 0 + 1) + 0)],
				introduction_video: introductionVideos[Math.floor(Math.random() * (introductionVideos.length - 1 - 0 + 1) + 0)],
				self_introduction: selfIntroductions[Math.floor(Math.random() * (selfIntroductions.length - 1 - 0 + 1) + 0)],
				city_id: cities[Math.floor(Math.random() * (cities.length - 1 - 0 + 1) + 0)].city_id,
				phone_number: `0${stringUtil.generateNumber(9)}`,
				request_status: constants.HOST_REQUEST_NONE,
				balance: (Math.random() * (100 - 0 + 1) + 0).toFixed(2),
				created_at: new Date(createdAt),
				updated_at: new Date(updatedAt),
			});
			createdAt += Math.floor(Math.random() * (5 - 1 + 1) + 1) * 3600000;
			updatedAt += Math.floor(Math.random() * (5 - 1 + 1) + 1) * 3600000;
			data.push({
				email: `userwanttobelocal${index}@gmail.com`,
				user_name: `userwanttobelocal${index}`,
				level_id: constants.LEVEL_USER,
				is_tour_guide: false,
				is_verified: true,
				password: bcrypt.hashSync('likealocal@2020', config.auth.saltRounds),
				avatar: avatars[Math.floor(Math.random() * (avatars.length - 1 - 0 + 1) + 0)],
				introduction_video: introductionVideos[Math.floor(Math.random() * (introductionVideos.length - 1 - 0 + 1) + 0)],
				self_introduction: selfIntroductions[Math.floor(Math.random() * (selfIntroductions.length - 1 - 0 + 1) + 0)],
				city_id: cities[Math.floor(Math.random() * (cities.length - 1 - 0 + 1) + 0)].city_id,
				phone_number: `0${stringUtil.generateNumber(9)}`,
				request_status: Math.random() >= 0.5 ? constants.HOST_REQUEST_PENDING : constants.HOST_REQUEST_REJECTED,
				balance: 0,
				created_at: new Date(createdAt),
				updated_at: new Date(updatedAt),
			});
		}
		return queryInterface.bulkInsert('users', data, {});
	},
	// up: (queryInterface, Sequelize) => queryInterface.bulkInsert('users', data, {}),
	// eslint-disable-next-line no-unused-vars
	down: (queryInterface, Sequelize) => queryInterface.bulkDelete('users', null, {}),
};
