const axios = require('axios');
const cheerio = require('cheerio');
const { Story } = require('./models/story'); //Importing the Sequelize model

//Scraper function
async function scrapeHackerNews() {
  try {
    //Fetching Hacker News page
    const { data } = await axios.get('https://news.ycombinator.com/');
    const $ = cheerio.load(data);

    //Parsing stories
    const stories = [];
    $('.athing').each((index, element) => {
      const titleElement = $(element).find('.titleline a'); //Finding the title element
      const source = $(element).find('.sitestr').text(); //finding source

      let title = titleElement.clone().children().remove().end().text(); //Removing nested elements
      if (!title.includes(source)) {title = `${title} - ${source}`;}

      const url = $(element).find('.title a').attr('href');

      //Finding the associated subline element
      const sublineElement = $(element).next().find('.subline'); //Using .next() to locate the subline row
      const ageElement = sublineElement.find('.age'); //Locating the age span within subline
      const publishTime = ageElement.attr('title');   //Extracting the 'title' attribute
      
      //Parsing the date and time from the publishTime string
      const [dateTime, timestamp] = publishTime.split(' '); //Spliting into date-time and Unix timestamp
      const date = new Date(dateTime); //Parsing the ISO date-time string into a JavaScript Date object
      const time = new Date(parseInt(timestamp) * 1000); //Converting the Unix timestamp to a Date object

      const formattedDate = date.toLocaleDateString(); //Formating the date for frontend
      const formattedTime = time.toLocaleTimeString(); //Formating the time for frontend

      const fullUrl = url.startsWith('http') ? url : `https://news.ycombinator.com/${url}`;

      //Extracting the storyId (can be done by parsing the first part of the link or other method)
      const storyId = $(element).attr('id'); // This id attribute is available on each story

      if (title && fullUrl && storyId && date && time) {
        stories.push({ storyId, title, url: fullUrl, date: date, time: time }); //Storing both date and time
      }
    });

    console.log(stories); //Logging the scraped stories

    //Saving stories to the database
    for (const story of stories) {
      await Story.upsert({
        storyId: story.storyId,
        title: story.title,
        url: story.url,
        date: story.date,
        time: story.time
      });
    }
    console.log('Scraping completed and data saved');
  } catch (err) {
    console.error('Error scraping Hacker News:', err);
  }
}
module.exports = { scrapeHackerNews };
