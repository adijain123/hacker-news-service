const express = require('express');
const http = require('http');
const path = require('path');
const socketIo = require('socket.io');
const { sequelize, Story } = require('./models/story');
const { scrapeHackerNews } = require('./scraper');

const { Sequelize } = require('sequelize');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);   //Initializing socket.io with the server

//Setting up EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

//Sync database
sequelize.sync({ alter: true })
  .then(() => console.log('Database synced successfully'))
  .catch(err => console.log('Error syncing database:', err));

//Routes
app.get('/', async (req, res) => {
  try {
    //Fetching latest stories
    const stories = await Story.findAll({order: [['time', 'DESC']] });

    //Fetching number of stories published in the last 5 minutes
    const fiveMinutesAgo = new Date(new Date() - 5 * 60 * 1000);
    const recentStoriesCount = await Story.count({
      where: {
        time: {
          [Sequelize.Op.gte]: fiveMinutesAgo //Using Sequelize.Op.gte for date comparison
        }
      }
    });

    res.render('index', { stories, recentStoriesCount });
  } catch (err) {
    console.error('Error fetching stories:', err);
    res.status(500).send('Error fetching stories');
  }
});

//WebSocket connection
io.on('connection', (socket) => {
  console.log('New client connected');

  //Sending real-time updates (new stories) every time scraper runs
  scrapeHackerNews();

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

//Schedule scraping every 5 minutes
setInterval(() => {
  console.log('Running scraper...');
  scrapeHackerNews();
}, 5 * 60 * 1000); //5 minutes

//Initial scrape on server start
scrapeHackerNews();

//Start the server
server.listen(3000, () => console.log('Server with WebSocket running on http://localhost:3000'));
