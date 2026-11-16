const express = require('express');
const path = require('path');
const { db, startServer } = require('./server/init_start.cjs');

const app = express();
const router = express.Router(); // Yeh line ensure karti hai ki route/router properly defined ho

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic status route taaki Render ka port check pass ho jaye
router.get('/', (req, res) => {
  res.status(200).send('Youtube-Rumble-View-Bot Headless Server is Running Successfully!');
});

// Router ko app par mount karein
app.use('/', router);

// Render ke liye port configuration
const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is successfully listening on port ${PORT}`);
});

module.exports = app;
