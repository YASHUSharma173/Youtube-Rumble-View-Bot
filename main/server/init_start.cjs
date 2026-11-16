const path = require('path');
const fs = require('fs');
const Sqlite3 = require('sqlite3').verbose();

// Render par /tmp folder use karein jahan writing ki permission milti hai
const dbDir = process.env.RENDER ? '/tmp' : path.join(__dirname, '../../src');

// Agar folder maujood nahi hai toh automatically create kar lein
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Database connection safely establish karein
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
