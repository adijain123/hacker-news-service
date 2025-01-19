# Hacker News Scraper and Real-Time Web App

This project scrapes the latest stories from Hacker News every 5 minutes, stores them in a MySQL database, and displays them in real-time on a web application. The app uses WebSocket for real-time updates and REST API to fetch the data.

## Features
- **Scraping**: Scrapes latest stories from Hacker News using a Node.js scraper.
- **Real-Time Updates**: Uses WebSocket to push new stories to connected clients in real-time.
- **Database**: Stories are stored in a MySQL database for persistence.
- **Frontend**: A simple frontend displays stories with time and date information.

---

## Setup Instructions

### Prerequisites
Before you begin, make sure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (version 12 or above)
- [MySQL](https://www.mysql.com/) (or a compatible database)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/hacker-news-webapp.git
cd hacker-news-webapp

### 2. Install Dependencies
npm install

### 3. Set Up the Database
a. Create a .env file in the root of the project.
b. Add the following environment variables to .env file (replace with your actual credentials)

##
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword

### 4. Run the following SQL commands to create the necessary tables in MySQL
##
CREATE DATABASE hacker_news;

USE hacker_news;

CREATE TABLE Stories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    storyId VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    date DATETIME NOT NULL,
    time DATETIME NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

### 5. Running the Application
## 
npm start

## 6. REST API
You can use the REST API to fetch stories and get the count of stories published in the last 5 minutes.
GET http://localhost:3000/ # Fetches the latest stories from the database.

### Web Scraping
The app scrapes the latest stories from Hacker News every 5 minutes and stores them in the database. This is done automatically as part of the server startup and is scheduled to run periodically.

### Directory structure
hacker-news-webapp/
│
├── models/
│   └── story.js            # Sequelize model for the 'Stories' table
│
├── public/                 # Static files (CSS, JS)
│
├── scraper/                # Web scraping logic
│   └── scraper.js          # Scraper for fetching data from Hacker News
│
├── views/                  # EJS templates
│   └── index.ejs           # Main frontend page displaying stories
│
├── .env                    # Environment variables (DB credentials)
├── app.js                  # Main Express server
├── package.json            # Project dependencies and scripts
└── README.md               # Project documentation (this file)



