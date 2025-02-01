const axios = require('axios');
const cheerio = require('cheerio');
const { Story } = require('./models/story');

async function scrapeHackerNews() {
  try {
    console.log('Starting to scrape Hacker News...');
    const response = await axios.get('https://news.ycombinator.com/');
    const $ = cheerio.load(response.data);

    const stories = [];
    $('.athing').each((index, element) => {
      try {
        const titleElement = $(element).find('.titleline > a').first();
        const title = titleElement.text().trim();
        const url = titleElement.attr('href');
        const storyId = $(element).attr('id');

        if (!title || !url || !storyId) {
          console.log('Skipping story due to missing required fields');
          return;
        }

        const fullUrl = url.startsWith('http') ? url : `https://news.ycombinator.com/${url}`;
        const time = new Date();

        const timeElement = $(element).next().find('.age');
        if (timeElement.length > 0) {
          const timestamp = timeElement.attr('title');
          if (timestamp) {
            const match = timestamp.match(/(\d+)/);
            if (match) {
              const unixTime = parseInt(match[1], 10);
              time.setTime(unixTime * 1000);
            }
          }
        }

        stories.push({
          storyId,
          title,
          url: fullUrl,
          time
        });
      } catch (err) {
        console.error(`Error parsing story ${index}:`, err);
      }
    });

    console.log(`Found ${stories.length} stories`);

    for (const story of stories) {
      try {
        await Story.upsert(story);
        console.log(`Saved story ${story.storyId}`);
      } catch (err) {
        console.error(`Error saving story ${story.storyId}:`, err);
      }
    }

    console.log('Scraping completed and data saved');
    return stories;
  } catch (err) {
    console.error('Error scraping Hacker News:', err);
    throw err;
  }
}

module.exports = { scrapeHackerNews };
