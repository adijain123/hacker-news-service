const express = require('express');
const http = require('http');
const path = require('path');
const socketIo = require('socket.io');
const { Sequelize } = require('sequelize');
const { sequelize, Story } = require('./models/story');
const { scrapeHackerNews } = require('./scraper');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const publicDir = path.join(__dirname, 'public');
if (!require('fs').existsSync(publicDir)) {
  require('fs').mkdirSync(publicDir);
}

app.use(express.static(publicDir));

function getRecentStoriesCount() {
  const fiveMinutesAgo = new Date(new Date() - 5 * 60 * 1000);
  return Story.count({
    where: {
      time: {
        [Sequelize.Op.gte]: fiveMinutesAgo
      }
    }
  });
}

function emitUpdatedStories() {
  try {
    const stories = Story.findAll({
      order: [['time', 'DESC']],
      limit: 30
    });

    const recentStoriesCount = getRecentStoriesCount();
    
    io.emit('newStories', {
      stories,
      recentStoriesCount
    });
  } catch (err) {
    console.error('Error emitting updated stories:', err);
  }
}

function initializeApp() {
  try {
    sequelize.authenticate();
    console.log('Database connection established');

    sequelize.sync({ alter: true });
    console.log('Database synced successfully');
    
    scrapeHackerNews();
    console.log('Initial scrape completed');
    
    emitUpdatedStories();
    
    setInterval(async () => {
      try {
        await scrapeHackerNews();
        console.log('Periodic scrape completed');
        await emitUpdatedStories();
      } catch (err) {
        console.error('Error in scraper interval:', err);
      }
    }, 5 * 60 * 1000);
  } catch (err) {
    console.error('Error initializing app:', err);
    process.exit(1);
  }
}

app.get('/', async (req, res) => {
  try {
    const stories = await Story.findAll({
      order: [['time', 'DESC']],
      limit: 30
    });

    const recentStoriesCount = await getRecentStoriesCount();

    res.render('index', { stories, recentStoriesCount });
  } catch (err) {
    console.error('Error fetching stories:', err);
    res.status(500).send('Error fetching stories');
  }
});

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error('Port is already in use. Please use a different port or kill the process using the current port.');
    process.exit(1);
  } else {
    console.error('Server error:', error);
    process.exit(1);
  }
});

function tryPort(port) {
  server.listen(port, () => {
    console.log(`Server running on port ${port}`);
    initializeApp().catch(err => {
      console.error('Failed to initialize app:', err);
      process.exit(1);
    });
  });
}

const PORT = process.env.PORT || 3001;
server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is in use, trying ${PORT + 1}`);
    tryPort(PORT + 1);
  }
});

tryPort(PORT);
