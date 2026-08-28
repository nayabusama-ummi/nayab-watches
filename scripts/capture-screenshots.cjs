const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SCREENSHOTS_DIR = path.join(__dirname, '..', 'docs', 'screenshots');
const BASE_URL = 'http://localhost:3000';

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log('Launching browser for NAYAB screenshots capture...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900'],
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 1.5 }
  });

  const page = await browser.newPage();

  // 1. Homepage Cinematic
  console.log('Capturing 01-homepage-cinematic.png...');
  await page.goto(`${BASE_URL}`, { waitUntil: 'networkidle2' });
  await sleep(1500);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '01-homepage-cinematic.png') });

  // 2. Fullscreen Navigation
  console.log('Capturing 02-fullscreen-navigation.png...');
  const menuTrigger = await page.$('.luxury-navbar__menu-trigger');
  if (menuTrigger) {
    await menuTrigger.click();
    await sleep(800);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02-fullscreen-navigation.png') });
    const closeBtn = await page.$('.fullscreen-nav__close');
    if (closeBtn) await closeBtn.click();
    await sleep(400);
  }

  // 3. All Timepieces
  console.log('Capturing 03-all-timepieces.png...');
  await page.goto(`${BASE_URL}/watches`, { waitUntil: 'networkidle2' });
  await sleep(1000);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '03-all-timepieces.png') });

  // 4. Sovereign 39 Product Detail
  console.log('Capturing 04-sovereign-39-product.png...');
  await page.goto(`${BASE_URL}/watches/sovereign-39`, { waitUntil: 'networkidle2' });
  await sleep(1000);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '04-sovereign-39-product.png') });

  // 5. Meridian 41 Product Detail
  console.log('Capturing 05-meridian-41-product.png...');
  await page.goto(`${BASE_URL}/watches/meridian-41`, { waitUntil: 'networkidle2' });
  await sleep(1000);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '05-meridian-41-product.png') });

  // 6. Client Account (Login with authenticated demo client)
  console.log('Logging in for 06-client-account.png...');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
  await sleep(800);
  await page.type('#login-email', 'client@nayab.pk');
  await page.type('#login-password', 'Nayab@2026');
  const submitBtn = await page.$('button[type="submit"]');
  if (submitBtn) await submitBtn.click();
  await sleep(2500);

  console.log('Capturing 06-client-account.png...');
  await page.goto(`${BASE_URL}/account`, { waitUntil: 'networkidle2' });
  await sleep(1500);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '06-client-account.png') });

  // 7. Bag / Checkout
  console.log('Capturing 07-bag-checkout.png...');
  await page.goto(`${BASE_URL}/watches/sovereign-39`, { waitUntil: 'networkidle2' });
  await sleep(1000);
  const addToBagBtn = await page.$('button.editorial-button--primary');
  if (addToBagBtn) {
    await addToBagBtn.click();
    await sleep(800);
  }
  await page.goto(`${BASE_URL}/checkout`, { waitUntil: 'networkidle2' });
  await sleep(1500);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '07-bag-checkout.png') });

  // 8. Order Confirmation (Simulated Order)
  console.log('Capturing 08-order-confirmation.png...');
  const nameInput = await page.$('#fullName, input[name="fullName"]');
  if (nameInput) {
    await nameInput.click({ clickCount: 3 });
    await nameInput.type('Nayab Usama');
  }
  const phoneInput = await page.$('#phone, input[name="phone"]');
  if (phoneInput) {
    await phoneInput.click({ clickCount: 3 });
    await phoneInput.type('03001234567');
  }
  const addressInput = await page.$('#addressLine1, input[name="addressLine1"]');
  if (addressInput) {
    await addressInput.click({ clickCount: 3 });
    await addressInput.type('Gulberg III, Lahore');
  }
  const cityInput = await page.$('#city, input[name="city"]');
  if (cityInput) {
    await cityInput.click({ clickCount: 3 });
    await cityInput.type('Lahore');
  }

  const placeOrderBtn = await page.$('button[type="submit"]');
  if (placeOrderBtn) {
    await placeOrderBtn.click();
    await sleep(3000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '08-order-confirmation.png') });
  }

  await browser.close();
  console.log('All 8 screenshots successfully captured and saved to docs/screenshots/');
}

main().catch(err => {
  console.error('Screenshot capture failed:', err);
  process.exit(1);
});
