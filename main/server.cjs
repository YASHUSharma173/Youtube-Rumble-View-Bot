const express = require('express');
const path = require('path');
const { db, startServer } = require('./server/init_start.cjs');

const app = express();
const router = express.Router();

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database mein links table ensure karna
db.run(`CREATE TABLE IF NOT EXISTS rumble_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  url TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// 1. Status route with input form
router.get('/', (req, res) => {
  res.status(200).send(`
    <div style="font-family: Arial, sans-serif; margin: 40px;">
      <h2>Youtube-Rumble-View-Bot Headless Server is Running!</h2>
      <p>Apna Rumble video ka link yahan daalein:</p>
      <form action="/add-link" method="POST">
        <input type="text" name="url" placeholder="Enter Rumble Video URL" style="width: 350px; padding: 10px;" required />
        <button type="submit" style="padding: 10px 20px; background: #000; color: #fff; border: none; cursor: pointer;">Add Link</button>
      </form>
      <br>
      <a href="/links" target="_blank">Saved Links Dekhein</a>
    </div>
  `);
});

// 2. Link add karne ka route (POST)
router.post('/add-link', (req, res) => {
  const videoUrl = req.body.url;
  if (!videoUrl) {
    return res.status(400).send('URL is required!');
  }

  db.run(`INSERT INTO rumble_links (url) VALUES (?)`, [videoUrl], function(err) {
    if (err) {
      console.error(err.message);
      return res.status(500).send('Database error while saving link.');
    }
    res.send(`<h3>Link successfully added! ID: ${this.lastID}</h3><a href="/">Go Back</a>`);
  });
});

// 3. Saved links dekhne ka route
router.get('/links', (req, res) => {
  db.all(`SELECT * FROM rumble_links`, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.use('/', router);

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is successfully listening on port ${PORT}`);
});

module.exports = app;
