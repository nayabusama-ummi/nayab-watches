const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\Ummi\\.gemini\\antigravity-ide\\brain\\46351543-2cd4-491a-bb13-d355fe9bdf94';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // 1. Desktop Catalogue
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:4173/watches', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'catalogue-enhanced.png'), fullPage: false });

  // 2. Desktop PDP
  await page.goto('http://localhost:4173/watches/sovereign-39', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'pdp-desktop-enhanced.png'), fullPage: false });

  // 3. Mobile PDP with Sticky Bar
  await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:4173/watches/sovereign-39', { waitUntil: 'networkidle0' });
  await page.evaluate(() => window.scrollBy(0, 400));
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'pdp-mobile-sticky-enhanced.png'), fullPage: false });

  // 4. Mobile Home
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'home-mobile-enhanced.png'), fullPage: false });

  await browser.close();
  console.log('Screenshots captured successfully!');
}

run().catch(err => {
  console.error('Screenshot capture error:', err);
});
