const express = require('express');
const path = require('path');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

// Stealth plugin add kar rahe hain taaki bot detect na ho
puppeteer.use(StealthPlugin());

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory list saved links ke liye
let savedLinks = [];

// Homepage with input form
app.get('/', (req, res) => {
    res.status(200).send(`
        <div style="font-family: Arial, sans-serif; margin: 40px;">
            <h2>Youtube-Rumble-View-Bot Headless Server (Stealth Enabled)</h2>
            <p>Apna Rumble ya YouTube video ka link yaha daalein:</p>
            <form action="/add-link" method="POST">
                <input type="text" name="url" placeholder="Enter Video URL" style="width: 300px; padding: 8px;" required>
                <button type="submit" style="padding: 9px 20px; background: #000; color: #fff; border: none; cursor: pointer;">Add Link & View</button>
            </form>
            <br>
            <a href="/links" target="_blank">Saved Links Dekhein</a>
        </div>
    `);
});

// Saved links route
app.get('/links', (req, res) => {
    res.json(savedLinks);
});

// Add link and run automated view bot with stealth
app.post('/add-link', async (req, res) => {
    const videoUrl = req.body.url;
    if (videoUrl) {
        savedLinks.push({ url: videoUrl, time: new Date() });
        
        // Background me view bot run karna
        runViewBot(videoUrl).catch(err => console.error("Bot Error:", err));

        res.send(`
            <script>
                alert('Link successfully add ho gaya aur view bot background me chal pada!');
                window.location.href = '/';
            </script>
        `);
    } else {
        res.status(400).send('URL is required!');
    }
});

// View bot function using Puppeteer Stealth & Watch Delay
async function runViewBot(url) {
    console.log(`Starting headless browser for URL: ${url}`);
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu'
            ]
        });

        const page = await browser.newPage();
        
        // User agent set karna taaki real browser lage
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        console.log(`Navigating to page...`);
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        console.log(`Page loaded successfully. Watching video for 45 seconds...`);
        // Video ko watch time dene ke liye 45 seconds ka delay
        await new Promise(resolve => setTimeout(resolve, 45000));

        await browser.close();
        console.log(`Bot finished viewing session for: ${url}`);
    } catch (error) {
        console.error(`Error in running view bot for ${url}:`, error);
        if (browser) {
            await browser.close();
        }
    }
}

app.listen(PORT, () => {
    console.log(`Server is successfully listening on port ${PORT}`);
});
