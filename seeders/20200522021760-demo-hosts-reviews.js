/* eslint-disable max-len */
const { User } = require('../models');
const constants = require('../utils/constants');
const stringUtil = require('../utils/stringUtil');

module.exports = {
	// eslint-disable-next-line no-unused-vars
	up: async (queryInterface, Sequelize) => {
		const data = [];
		const contents = [
			'I have done both the Rembrandt and the Van Gogh virtual tour with Rolf and have enjoyed both immensely! His presentation is engaging and he has an answer for every question you throw at him, could not recommend more! Thank you Rolf!',
			'We did both the Rembrandt and Van Gough tours with Rolf and they were both amazing! Rolf is engaging and really knows all there is to know about individual paintings, the artists and their lives. He was also able to answer any questions we had for him and answered them in great detail! We would book him again in a heart beat if more tours were available with Rolf.',
			'Our family did the Rembrandt and Van Gogh with Rolf and both were great. The presentation was super interesting and Rolf also had answers to all of our additional questions.',
			'We did both online experiences with Rolf, Rembrandt and Van Gogh and both were fantastic. Rolf was great and we learned a lot! It was very easy to reschedule one session. Rolf was very supportive and easy to contact. I hope he is working on another one! We will book that one as well. Looking forward to seeing you sometime in person in a real museum.',
			'Rolf took us on a virtual storytelling journey through the life of Vincent van Gogh. It was super interesting hearing all the details of his life I never heard before. Rolf knows what he is talking about!',
			'I purchased this for my mother as a gift. My parents, sister and niece and I participated, and we all live in different cities. It was such a fun way to be together remotely. Rolf was very knowledgeable and gave a great presentation, and he was very flexible as we figured out a time that worked for all of us to participate. We learned a lot about artists that we already love. I highly recommend this experience. We can\'t wait to share another experience, and also to be able to travel to Amsterdam and have Rolf be our tour guide in person.',
			'We loved our tour with Rolf! Lots of great art and interesting stories about the painters we did not know. Highly recommend!',
			'Rolf was great. Informative and accommodating. Very knowledgeable. We as a family enjoyed it. Highly recommend.',
			'Rolf was so easy to work with. We lined this up as a surprise Mother\'s Day experience for my wife due to the fact that COVID-19 forced us to cancel a trip to Amsterdam over this same time period. Rolf\'s passion for Dutch history and the lives of the masters was clear throughout the whole presentation and we can\'t wait to meet up with him live to learn even more when the world get\'s right again and we can visit!',
			'This was an overall great experience for my mom and I. She really enjoys modern art and has as passion for art history, I on the other hand enjoy history. This experience had a great blend of learning about the art pieces as well as the history behind the era and the individual artists. Rolf allowed for any questions that arose to be answer with no hesitation and made the experience fun and entertaining. I would absolutely recommend to anyone who has a passion for art history or wants to learn more about Dutch artists.',
			'There were seven of us in the session. Since then, we all have been discussing how fine a presentation it was. Our guide, Rolf, was personable and knowledgeable. He kept things well-balanced with a blend of art appreciation, relevant history, and anecdotes about the artists lives. There was a sense of continuity as we progressed through the three artist under consideration. All in all, I would say, it left us hungry for more; and that’s a good thing. Finally, tech ran smoothly throughout. Any frustrating glitches would’ve completely ruin the experience.',
			'We really enjoyed our virtual tour with Rolf through the art of Van Gogh! Rolf was obviously a talented, knowledgeable tour guide. Our group was entertained and also learned so much in our time online with Rolf. I would recommend this online tour to folks looking for a great little escape. I am looking forward to the future when I can return to Amsterdam to meet Rolf in person on his live tours. In the meantime, this online opportunity was much appreciated. Thank you Rolf!',
			'6 of us took the Rembrandt and Van Gogh virtual tour with Rolf. It was educational and entertaining. We had previously been to both the Rijksmuseum and the Van Gogh museum but had never taken a tour. Rolf knows so much about art and I learned so much. I highly recommend this tour.',
			'We had a wonderful time meeting Rolf on Easter Sunday. Rolf is an inspiring Art Historian and it was so fun to see paintings that we\'ve seen many times before through the guidance of his masterfully trained eye. His presentation was carefully curated and interwoven with spirited stories and musings. Rolf, you are a brilliant scholar, enthusiastic art aficionado and soulful storyteller. When the world opens up again, I hope to meet you in person on my next trip to Amsterdam. ntzettend bedankt, Kristin + TIta',
			'Rolf gave us a fantastic experience which went by too quickly. His passion for his subject really shone through. He brought the paintings to life for us in a way that enhanced our experience. Having the benefit of his amazing knowledge gave a whole new and positive dimension to our visit. He is a really superb guide.',
			'Rolf was so good. I highly recommend taking ANY tour with him. My wife, my sister & I took a tour of the Van Gogh museum and we were so thrilled to go through it with the in-depth knowledge of Rolf. Such a kind person and he puts a lot of effort in explaining the detail of Van Gogh\'s life. What I liked the most is how he connected Van Gogh\'s life to other artists. It was really interesting despite my zero knowledge of art.',
			'We had an excellent two hours with Rolf. He guided us through the Rijksmuseum collection - his at history knowledge is brilliant and the tour took us on a fascinating journey through Dutch art! Definitely recommending him to others!!!',
			'We booked a private tour at short notice. Claire was immediately in touch and set up our meeting place and time - all very easy. 2 hour tour of the Rijks was just right, too little time to do everything, but enough to get a good feel and to dig into a few artists and a few pieces of work. Claire very well informed, nice sense of humour good to chat with - we thoroughly enjoyed the tour and would recommend.',
			'Claire was fabulous. So knowledgeable about the exhibits and able to pack a lot into a short space of time. You can tell she\'s passionate about art. She speaks perfect English and is a pleasure to spend time with.',
			'Claire was amazing with our 4 children. The museum is huge and the treasure hunt was a perfect way to touch upon some of the exhibits and get a bit of knowledge. She had the kids look for the clues and when they found the piece of art work she then explained it. It was a great way for the kids to learn. I wouldn’t have done it any other way. Thank you Claire for your knowledge, patience, and kindness!',
			'Claire provided a perfectly edited tour of the Dutch Masters collections, highlighting the important details about selected paintings. Her presentation was delivered with in-depth knowledge, historical references and humorous stories about the artists which made the tour interesting and relevant. With a limited amount of time to spend in any one city or museum, I am not likely to walk around on my own with a guide book or headset again.',
			'Claire was a wonderful guide. She provided an comprehensive overview of the collection. She was able to give us the context for each period as well as point out the seminal pieces with some detail. The tour was interesting, informative and pleasant.',
			'My husband and I spent an enjoyable two hours with Claire as she showed us the highlights of the Rijksmuseum. Claire was friendly and, with her expert knowledge of art history, very informative, giving us interesting background and perspective to the artworks we viewed. A very pleasant experience.',
			'This is a great was to get kids to enjoy a museum. I personally enjoyed it. I just noticed my son didn’t care about the detailed information provided ie the which year things happened but he kept talking about the secret messages in the painting. And now every time we look at a painting he wonders what the secret message is. Thank you Claire for igniting this curiosity in him. Also, we were so proud when we went to Madame Tussaud’s and my son recognized one of the famous painting and said look the knights guard.',
			'What a great way to experience a museum with a child! This scavenger hunt type game was fun for our 7 year old son. Not only was it engaging to a child it was fun for us. Claire is an expert in her field and hearing her talk passionatly with such insite into art was amazing. Thank you!',
			'Claire was delightful. She shared much information with us about the paintings and we had a lovely time.',
			'Claire made our tour very enjoyable. Full of information and insights into the work but with a relaxed approach that gave us plenty of time to view the paintings. I’d highly recommend her',
			'Our host Claire was amazing. She was highly knowledgeable about the art and she picked out some great highlights for us to view. I would highly recommend her as a guide!',
			'Claire was just perfect for us. In two hours, we got a great overview of the major highlights of the museum. Claire was warm, hospitable, enthusiastic and highly informative. She’s terrific!',
			'Great Guide for a walk in Amsterdam. Good Englisch Knowledge and interesting Facts about Buildings',
			'We had a lot fun with Anna on the 90 minutes Amsterdam Kickstart Tour. She is a very joyful person and we learned a lot of interesting facts about the city and she also had an answer to all our other questions that came up. I would highly recommend her as a tour guide.',
			'We had a very nice tour around the city center of Amsterdam with interesting historical insights into the local architecture. It was very fun and we‘d certainly recommend it for everyone interested in history.',
			'Enjoyed my bike tour with Anna. I was a bit jet lagged and she was easy and great showing me around Amsterdam. I look forward to coming back and enjoying more of Amsterdam.',
			'Anna was very friendly and incredibly knowledgeable about Amsterdam. We very much enjoyed our tour.',
			'The tour was really good, Anna is a great guide with a lot of knowledge and very friendly, I highly recommend this tour and special thanks to Anna!',
			'Anna has been great local guide! She’s knowledgeable, fun, and very attentive to details ... which made her perfect for my city tour! I’ve learned a lot about Amsterdam thanks to her, including a lot of interesting little known facts. I had a whole lot of fun, and I highly recommend Anna',
			'We had an absolutely amazing time with Anna. We were in Amsterdam during the beginnings of the COVID-19 outbreak, and Anna was extremely attentive in helping us navigate the city with all of the closures. Anna\'s knowledge of European history is so impressive. She guided us through historical sites and was able to provide rich detail on the historical significance and added lots of color to the locations with stories and anecdotes. We felt like we were seeing the city with a walking encyclopedia! In addition, Anna has a lovely personality. She\'s fun and witty, responsible and punctual, and just a delight to spend time with. We would strongly recommend Anna to anyone interested in exploring the city in a fun and educational way. Cheers!',
			'I was fortunate enough to have Anna as my guide during my 24hr layover in Amsterdam. I loved the pace and delivery of the tour and found myself absolutely mesmerised by all the incredible history and landmarks that Anna pointed out during our walk. An absolute must for anyone looking to explore Amsterdam for the first time!',
			'Anna’s knowledge is really exceptional. She brought the history of Amsterdam to life in an interesting and humorous style. Her grasp of dates and significant events was so impressive, even relating historical events in the Netherlands to events at the same time in countries across Europe. She also gave us very interesting insights on modern day Amsterdam which we found fascinating. A brilliant 90 minutes which we would highly recommend.',
			'Anna was amazing and allowed us to move at our own pace. One of our group’s members was walking with a cane she was extremely patient. She answered all questions and tried to guide everyone with advice about Amsterdam. Her heartfelt smile and laugh made the day ever better. I highly recommend to to use her for a tour.',
			'Anna was so educational and engaging with me and my teenaged son, who both love history and architecture. We spent every second of our 90 minutes learning something new about Amsterdam, and we could tell that she was extremely knowledgeable about both the city and Europe as a whole. It was a pleasant and well-paced stroll that I would do again in an instant and would highly recommend to anyone who is interested in history or getting to know Amsterdam more intimately.',
		];
		const hosts = await User.findAll({
			where: {
				level_id: constants.LEVEL_HOST,
				is_deleted: false,
			},
		});
		const users = await User.findAll({
			where: {
				level_id: constants.LEVEL_USER,
				is_deleted: false,
			},
		});
		hosts.forEach((host) => {
			const userIds = new Set();
			for (let index = 0; index < 30; index++) {
				const currentNumberOfUsers = userIds.size;
				const userId = users[Math.floor(Math.random() * (users.length - 1 - 0 + 1) + 0)].user_id;
				userIds.add(userId);
				if (currentNumberOfUsers !== userIds.size) {
					data.push({
						host_id: host.user_id,
						user_id: userId,
						rating: Math.floor(Math.random() * (5 - 1 + 1) + 1),
						content: contents[Math.floor(Math.random() * (contents.length - 1 - 0 + 1) + 0)],
						is_deleted: false,
						created_at: new Date(),
					});
				}
			}
		});
		return queryInterface.bulkInsert('hosts_reviews', data, {});
	},
	// eslint-disable-next-line no-unused-vars
	down: (queryInterface, Sequelize) => queryInterface.bulkDelete('hosts_reviews', null, {}),
};
