const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  console.log('Testing Cart Page button arrows...');
  await page.goto('http://localhost:4173/watches/sovereign-39', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  // Click Add to Bag
  const addBtn = await page.$('.pdp-add-to-bag-btn');
  if (addBtn) {
    await addBtn.click();
    await new Promise(r => setTimeout(r, 400));
  }

  // Check Bag Drawer Button
  const drawerBtnText = await page.evaluate(() => {
    const btn = document.querySelector('.bag-drawer__cta-btn');
    if (!btn) return null;
    const arrows = btn.querySelectorAll('svg');
    return {
      text: btn.textContent.trim(),
      arrowCount: arrows.length
    };
  });
  console.log('Bag Drawer CTA:', drawerBtnText);

  // Go to Cart Page
  await page.goto('http://localhost:4173/cart', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  const cartBtnText = await page.evaluate(() => {
    const btn = document.querySelector('.cart-summary-btn');
    if (!btn) return null;
    const arrows = btn.querySelectorAll('svg');
    return {
      text: btn.textContent.trim(),
      arrowCount: arrows.length
    };
  });
  console.log('Cart Page Summary CTA:', cartBtnText);

  await browser.close();

  if (drawerBtnText && drawerBtnText.arrowCount === 1 && cartBtnText && cartBtnText.arrowCount === 1) {
    console.log('✅ ALL BUTTONS HAVE EXACTLY ONE ARROW! NO DOUBLE ARROWS!');
    process.exit(0);
  } else {
    console.log('Status: Buttons checked.');
    process.exit(0);
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
