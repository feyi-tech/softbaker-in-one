const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const path = require('path');
const cors = require('cors'); // Import cors

const app = express();
const port = 3002; // You can change this to your desired port

// Directory to save session data
const sessionDir = path.join(__dirname, 'sessions');

// Ensure the session directory exists
fs.ensureDirSync(sessionDir);

// Use CORS middleware to allow all origins
app.use(cors());

// http://localhost:3002/proxy?url=https%3A%2F%2Ffacebook.com&sessionId=DxId09
app.get('/proxy', async (req, res) => {
  const { url, sessionId } = req.query;

  if (typeof url !== 'string' || typeof sessionId !== 'string') {
    return res.status(400).send('URL and sessionId query parameters are required');
  }

  try {
    const decodedUrl = decodeURIComponent(url);
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Restore session data if available
    const sessionFile = path.join(sessionDir, `${sessionId}.json`);
    if (fs.existsSync(sessionFile)) {
      const sessionData = await fs.readJson(sessionFile);
      await page.setCookie(...sessionData.cookies);
      await page.evaluateOnNewDocument((localStorageItems, sessionStorageItems) => {
        localStorageItems.forEach(({ key, value }) => {
          localStorage.setItem(key, value);
        });
        sessionStorageItems.forEach(({ key, value }) => {
          sessionStorage.setItem(key, value);
        });
      }, sessionData.localStorage, sessionData.sessionStorage);
    }

    await page.goto(decodedUrl, { waitUntil: 'networkidle2' });
    const content = await page.content();

    // Save session data
    const cookies = await page.cookies();
    const localStorage = await page.evaluate(() => {
      return Object.entries(window.localStorage).map(([key, value]) => ({ key, value }));
    });
    const sessionStorage = await page.evaluate(() => {
      return Object.entries(window.sessionStorage).map(([key, value]) => ({ key, value }));
    });
    
    await fs.writeJson(sessionFile, { cookies, localStorage, sessionStorage });

    await browser.close();
    res.send(content);
  } catch (error) {
    console.error('Error loading the page:', error);
    res.status(500).send('Error loading the page');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});