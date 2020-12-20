/* eslint-disable max-len */
const {
	User, City, Category, Transport,
} = require('../models');
const constants = require('../utils/constants');
const stringUtil = require('../utils/stringUtil');

module.exports = {
	// eslint-disable-next-line no-unused-vars
	up: async (queryInterface, Sequelize) => {
		const data = [];
		const coverImages = [
			'https://withlocals-com-res.cloudinary.com/image/upload/w_830,h_467,c_fill,g_auto,q_auto,dpr_1.0,f_auto/40941e886dee4363cbe0785d1bc516d4',
			'https://withlocals-com-res.cloudinary.com/image/upload/w_830,h_467,c_fill,g_auto,q_auto,dpr_1.0,f_auto/9641f04bbf20b7d7db42456e7f273ad2',
			'https://withlocals-com-res.cloudinary.com/image/upload/w_830,h_467,c_fill,g_auto,q_auto,dpr_1.0,f_auto/29148990b5b38940be7a3e9c9bbe5c4c',
			'https://withlocals-com-res.cloudinary.com/image/upload/w_830,h_467,c_fill,g_auto,q_auto,dpr_1.0,f_auto/61f93b51c1580fc59d539ec094d64c96',
			'https://withlocals-com-res.cloudinary.com/image/upload/w_830,h_467,c_fill,g_auto,q_auto,dpr_1.0,f_auto/163afcfd76cc0826442b7ab52e53bfbc',
			'https://withlocals-com-res.cloudinary.com/image/upload/w_830,h_467,c_fill,g_auto,q_auto,dpr_1.0,f_auto/0ded8f35374daa0ae46a5ca055085b75',
			'https://withlocals-com-res.cloudinary.com/image/upload/w_830,h_467,c_fill,g_auto,q_auto,dpr_1.0,f_auto/ce2b15516d7db18e263e945e1a171629',
			'https://withlocals-com-res.cloudinary.com/image/upload/w_830,h_467,c_fill,g_auto,q_auto,dpr_1.0,f_auto/ecc5dac0b6fd917eae23eb633133e036',
			'https://withlocals-com-res.cloudinary.com/image/upload/w_830,h_467,c_fill,g_auto,q_auto,dpr_1.0,f_auto/bc405fa2bcb35a88aa543fc755f5b983',
			'https://withlocals-com-res.cloudinary.com/image/upload/w_830,h_467,c_fill,g_auto,q_auto,dpr_2.0,f_auto/01d6cb3db2e02a6457959d4809aee8ed',
			'https://withlocals-com-res.cloudinary.com/image/upload/w_750,h_424,c_fill,g_auto,q_auto,dpr_2.0,f_auto/f603e27a55cfb408863373f4f1fc17bc',
			'https://withlocals-com-res.cloudinary.com/image/upload/w_1024,c_fill,g_auto,q_auto,dpr_2.0,f_auto/c9cf98fcce750939bb8c647ff3e0cd21',
			'https://withlocals-com-res.cloudinary.com/image/upload/w_830,h_467,c_fill,g_auto,q_auto,dpr_2.0,f_auto/7abb59500d13ea2a3bad692a834b7bf9',
			'https://withlocals-com-res.cloudinary.com/image/upload/w_750,h_424,c_fill,g_auto,q_auto,dpr_2.0,f_auto/3473e2f2da014bd976bc07cdfa86a1fe',
			'https://withlocals-com-res.cloudinary.com/image/upload/w_750,h_424,c_fill,g_auto,q_auto,dpr_2.0,f_auto/f28a7678f8539f35540b9626b100ecb6'
		];
		const tourNames = ['The Ultimate Hanoi Layover Tour', 'Lisbon Favorite Food Tour', 'Lisbon\'s Foodie Secrets & Tastings Tour', 'Hanoi\'s Best with Your Family: Highlights & Hidden Gems',
			'Sunset WestLake Motorbike Tour', 'A Taste of Hanoi - Food Adventure by Foot', 'The Original Craft Beer Tour Of Hanoi', 'Night Tour With A Local',
			'Gulbenkian Museum & Gardens: Lisbon\'s Urban Oasis', 'Flavors of Lisbon: Wine & Tapas Tour', 'Multicultural Lisbon: Mouraria to Cais Sodré Districts Tour',
			'The Best of Lisbon - "Família" Style', 'Withlocals Highlights & Hidden Gems: Best of Florence Tour', 'Withlocals The 10 Tastings: Florence Favorite Food Tour',
			'An Authentic Day Trip Experience in Tuscany', 'Florence’s Secrets, Signs & Symbols', 'Your Perfect Cinque Terre Private Day Trip',
			' Aperitivo Time: Sunsets, Cocktails & Bites', 'Ultimate Uffizi Express Tour with Skip the Line'];
		const descriptions = [
			'During this private Rembrandt tour you will get to walk the cozy streets of Amsterdam while vising the famous locations associated with Rembrandt.\
			You will learn everything you have ever wanted to know about Amsterdam in the Golden age and the life of it\'s most iconic painter, Rembrandt, while enjoying the stunningly beautiful architecture of all the major neighborhoods of the city center.\
			These locations are spread out among the following areas: Nieuwmarkt, Waterlooplein, Oudezijds Achterburgwal, Dam, Grachtengordel (Ring of Canals), Jordaan, Rozengracht.\
			If you have any special requests please contact me for a personalized offer.',
			'In this tour we will explore different aspects of Rembrandt\'s & Vermeer\'s life and work. Ill show yuo where their art is coming from and what kind of inspirational source they had. All the masterpieces like \'the milkmaid\', \'Jewish Bride\' and \'the Night Watch\' are passing by. Later in life Rembrandt used a coarser experimental technique, applying ingenious colour and light effects to further enhance the narrative and draw out its essence. That\'s it is very interesting \'the Night Watch\' is under construction on room! She is in a glass box and you can experience live what restorers are doing with her.',
			'Step into a postcard-perfect theme as soon as you set foot in the traditional village of Zaanse Schans. Go on a private day trip tour a little bit outside of Amsterdam for a truly authentic local experience.\
			Zaanse Schans is a magical place where you can walk around and catch a glimpse of the traditional side of the Netherlands. Wander through this unique village and go back in time with interactive activities and workshops. Step inside a clog factory and see a local shoemaker in action. Visit a classic windmill and paint mill to understand how they used to work back in the day. You\'ll even have a chance to go inside one of them!\
			And you can\'t leave without trying the famous Dutch cheese. Get a tasting of the best products at a local cheese factory and talk to the friendly locals all dressed up in traditional attires.\
			Let a local show you the traditional side of the country, and hear all there is to know about local traditions and feel like in a fairytale in this enchanting day trip. Pick your favorite local and let them personalize this private experience for you.',
			'Nothing says you are true Amsterdammer more than a houseboat in the canals. Curious to see how\'s life by the water?\
			Welcome to my houseboat! Bring your whole family and meet new local friends. I\'ll show you my place and will gather around the kitchen table for a fun day getting to know each other.\
			See for yourself how is life in the water with a cup of coffee/tea for the grown-ups and lemonade for the children. Kids, do you want to try the typical Dutch dropjes (candy)?\
			Haven\'t tried the typical Dutch snack, stroopwafels, yet? I\'ll show you how to eat this delicious treat the right way. It\'s a favorite of the locals, no matter the age but especially loved by the kids.\
			And if you like we can bake pancakes together! We\'ll make the pancakes according an old Dutch recopy. Together we\'ll eat the pancakes and chose a colorful topping!\
			I\'ll show you around my boat and then I\'ll tell you all about life in the canals. There is a big difference between living in a regular house! A lot of details you probably never thought of like, wanting to take a shower during the winter to find out that the pipe is frozen... still I wouldn\'t change it for anything!\
			To make this a super fun day for the kids, I have prepared some crazy trivia to compare life on a houseboat vs. a regular house. It will be fun! You can also feed the ducks, seagulls and swans that visit my home.\
			Come over and let me know how I can make your visit even more perfect. See you soon!',
		];
		const meetingAddresses = ['Martinho da Arcada', 'Geflipt', 'Café de Schreierstoren', 'Starbikes Rental', 'Bistro Berlage', 'Rijksmuseum', 'Kromme Waal',
			'Amsterdam Centraal', 'Tuschinski', 'Nieuwmarkt'];
		const categories = await Category.findAll({
			where: {
				is_deleted: false,
			},
		});
		const transports = await Transport.findAll({
			where: {
				is_deleted: false,
			},
		});
		const hosts = await User.findAll({
			where: {
				level_id: constants.LEVEL_HOST,
				is_deleted: false,
			},
			include: [{
				model: City,
				as: 'city',
			}],
		});
		hosts.forEach((host) => {
			const numberOfTours = Math.floor(Math.random() * (10 - 0 + 1) + 0);
			for (let index = 0; index < numberOfTours; index += 1) {
				const listPrice = Number((Math.random() * (80 - 2 + 1) + 2).toFixed(2));
				data.push({
					name: tourNames[Math.floor(Math.random() * (tourNames.length - 1 - 0 + 1) + 0)],
					description: descriptions[Math.floor(Math.random() * (descriptions.length - 1 - 0 + 1) + 0)],
					city_id: host.city.city_id,
					host_id: host.user_id,
					list_price: listPrice,
					sale_price: Number((Math.random() >= 0.5 ? listPrice : (listPrice * Math.floor(Math.random() * (50 - 10 + 1) + 10)) / 100).toFixed(2)),
					max_people: Math.floor(Math.random() * (12 - 5 + 1) + 5),
					duration: Math.random() >= 0.5 ? 0.5 + Math.floor(Math.random() * (10 - 2 + 1) + 2) : Math.floor(Math.random() * (10 - 2 + 1) + 2),
					meeting_address: meetingAddresses[Math.floor(Math.random() * (meetingAddresses.length - 1 - 0 + 1) + 0)],
					category_id: categories[Math.floor(Math.random() * (categories.length - 1 - 0 + 1) + 0)].category_id,
					transport_id: transports[Math.floor(Math.random() * (transports.length - 1 - 0 + 1) + 0)].transport_id,
					cover_image: coverImages[Math.floor(Math.random() * (coverImages.length - 1 - 0 + 1) + 0)],
					is_shown: Math.random() >= 0.5,
					status: Math.random() >= 0.5 ? 2 : Math.floor(Math.random() * (1 - 0 + 1) + 0),
					is_deleted: false,
					created_at: new Date(),
				});
			}
		});
		return queryInterface.bulkInsert('tours', data, {});
	},
	// eslint-disable-next-line no-unused-vars
	down: (queryInterface, Sequelize) => queryInterface.bulkDelete('tours', null, {}),
};
