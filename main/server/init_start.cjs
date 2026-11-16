const path = require('path');
const fs = require('fs');
const Sqlite3 = require('sqlite3').verbose();

// Render environment ya local ke liye database directory set karein
const dbDir = path.join(process.env.APP_PATH || '/opt/render/project/src');

// Agar folder maujood nahi hai toh automatically create kar lein
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Database connection establish karein safely
const dbPath = path.join(dbDir, 'database.db');
const db = new Sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database successfully at:', dbPath);
  }
});

function startServer() {
  return new Promise((resolve, reject) => {
    resolve();
  });
}

module.exports = { db, startServer };
