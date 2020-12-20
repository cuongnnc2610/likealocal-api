/* eslint-disable max-len */
const { Tour, ToursEdit } = require('../models');
const stringUtil = require('../utils/stringUtil');
const constants = require('../utils/constants');

module.exports = {
	// eslint-disable-next-line no-unused-vars
	up: async (queryInterface, Sequelize) => {
		const data = [];
		const placeNames = ['Dam Square', 'Famous Canal', 'Homomonument', 'Trendy Area', 'Begijnhof & Schuttersgalerij', 'Flower Market', 'Tuschinski Theatre', 'Croquette Break',
			'Rembrandtplein', 'The Blauwbrug', 'Jewish Neighborhood', 'Waterlooplein', 'Rembrandt\'s House', 'Medieval Times', 'Renaissance Era', 'Golden Age', '18th Century',
			'19th Century', 'Vincent Van Gogh', 'Scenic Canal Views', 'Houseboats Everywhere', 'Skinny Bridge', 'Golden Age Insights', 'Canal of 7 Bridges', 'Trendy Jordaan',
			'The Portuguese Synagogue & Jewish Museum', 'Hollandsche Schouwburg', 'Auschwitz Memorial', 'Stolpersteine', 'Anne Frank House', 'Treasure Rooms', 'Begin Golden Age',
			'Young Rembrandt', 'Great Hall', 'Gallery of Honor', 'Vermeer'];
		const placeDescriptions = [
			'Walk around the biggest square in Amsterdam home of the Royal Palace, the National Monument, and the hippies who used to occupy it in the ‘60s!',
			'Cross the Torensluis to discover one of the most famous and important canals in Amsterdam, the Singel once served as the outer limit of the city circling the boundaries of it',
			'Check out a truly special monument about the Gay Holocaust. It consists of 3 triangles, and each triangle points to a related place - discover which ones!',
			'See why Amsterdam is called the Venice of the North by walking in the Jordaan district and its popular streets',
			'Visit a beautiful chapel hidden at the Begijnhof hidden garden. The Begijnhof is one of Amsterdam\'s best known hofjes (almshouses)!',
			'Wander past the only floating flower market in the world and hear about the Dutch Trading Heritage',
			'Situated a stone’s throw from the Rembrandtplein in the city center is arguably Amsterdam’s - and perhaps the world’s - most stunning movie theatre, the Pathe Tuschinski',
			'Take some time to catch up with your local host while enjoying an authentic broodje kroketten',
			'Explore what was originally a butter and dairy market, the Rembrandtplein has long left its farm-friendly origins behind and these days you are far more likely to find yourself enjoying the vibrant nightlife',
			'Cross this historic bridge over the river Amstel where you’ll spot the famous Skinny Bridge with a fascinating story your local host will tell you about',
			'Discover the former Jewish neighborhood and learn all about Anne Frank & the Jewish oppression in Amsterdam',
			'This picturesque square is known for its daily flea-market that is very popular amongst locals who love to hunt for a unique bargain - check it out to see if you find something that catches your eye!',
			'Walk past the painter\'s house where a true hidden gem is waiting for you!',
			'See the very religious but outstanding paintings of the medieval times of Dutch Master Geerten tot St. Jans and his wonderful ‘Tree of Jesse.’',
			'Hear more about this enlightening time and how it\'s the basis of the Golden Age. See more about Lucas van Leyden, the Rembrandt of the 16th century',
			'Explore the big three masters of the golden age: Hals, Vermeer and Rembrandt',
			'See amazing artworks like clocks, handmade furniture, marble vases and fireplaces, life size porcelain animals and other artworks',
			'Admire the biggest painting in the Rijksmuseum, ‘Battle at Waterloo’, made by the ‘Rembrandt of the 19th century',
			'Cruise along the Spiegelgracht known for its galleries and antique shops',
			'Check out the beautiful houseboats while cruising a cozy grand canal',
			'Follow the water to one of the most romantic hotspots in town',
			'See where the merchants lived in the Golden Age 17th century',
			'Enjoy the picturesque views from the water and soak in the city\'s vibes',
			'Ready for people watching in the famous Bohemian neighbourhood, the Jordaan',
			'Hear interesting facts & stories about the Jewish community and Anne Frank',
			'Pass the deportation center for Jews in 1942',
			'See the memorial “Broken Mirrors ” with the words “Never Again Auschwitz” - a tribute to the lost ones in WWII',
			'Look out for the cobblestones along the way that commemorate Jewish victims of the Holocaust',
			'Learn about the Frank Family and the other people in hiding at Prinsengracht 263',
			'Hear the story behind the Rijksmuseum building and get ready to go in',
			'See the why the Dutch became so rich',
			'See what the bases of Dutch art are',
			'I\'ll show young Rembrandt and his development',
			'How to give visitors roots with an outstanding picture programm on walls, stain glass and floor',
			'See all the best Dutch art between 1600-1700',
			'Three Vermeers are dicussed and his sources as well',
		];
		const findAllTours = () => Tour.findAll({
			where: {
				is_deleted: false,
			},
		});
		const findAllToursEdits = () => ToursEdit.findAll({
			where: {
				is_deleted: false,
			},
		});
		const [tours, toursEdits] = await Promise.all([findAllTours(), findAllToursEdits()]);
		for (let indexTour = 0; indexTour < tours.length; indexTour += 1) {
			const numberOfPlaces = Math.floor(Math.random() * (8 - 4 + 1) + 4);
			for (let indexPlace = 0; indexPlace < numberOfPlaces; indexPlace += 1) {
				data.push({
					tour_id: tours[indexTour].tour_id,
					tours_edit_id: null,
					numerical_order: indexPlace,
					place_name: placeNames[Math.floor(Math.random() * (placeNames.length - 1 - 0 + 1) + 0)],
					description: placeDescriptions[Math.floor(Math.random() * (placeDescriptions.length - 1 - 0 + 1) + 0)],
					status: constants.TOURS_EDIT_APPROVED,
					is_deleted: false,
					created_at: new Date(),
				});
			}
		}
		for (let indexToursEdit = 0; indexToursEdit < toursEdits.length; indexToursEdit += 1) {
			const numberOfPlaces = Math.floor(Math.random() * (8 - 4 + 1) + 4);
			for (let indexPlace = 0; indexPlace < numberOfPlaces; indexPlace += 1) {
				data.push({
					tour_id: toursEdits[indexToursEdit].tour_id,
					tours_edit_id: toursEdits[indexToursEdit].tours_edit_id,
					numerical_order: indexPlace,
					place_name: placeNames[Math.floor(Math.random() * (placeNames.length - 1 - 0 + 1) + 0)],
					description: placeDescriptions[Math.floor(Math.random() * (placeDescriptions.length - 1 - 0 + 1) + 0)],
					status: toursEdits[indexToursEdit].status,
					is_deleted: false,
					created_at: new Date(),
				});
			}
		}
		return queryInterface.bulkInsert('tours_places', data, {});
	},
	// eslint-disable-next-line no-unused-vars
	down: (queryInterface, Sequelize) => queryInterface.bulkDelete('tours_places', null, {}),
};
