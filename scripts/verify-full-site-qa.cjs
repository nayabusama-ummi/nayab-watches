const puppeteer = require('puppeteer-core');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const VIEWPORTS = [
  { name: 'Desktop Large', width: 1440, height: 900 },
  { name: 'Tablet Landscape', width: 1024, height: 768 },
  { name: 'Tablet Portrait', width: 768, height: 1024 },
  { name: 'Mobile', width: 390, height: 844 },
];

const ROUTES = [
  '/',
  '/watches',
  '/collections',
  '/collections/sovereign-line',
  '/watches/sovereign-39',
  '/watches/meridian-41',
  '/cart',
  '/checkout',
  '/wishlist',
  '/login',
  '/account',
];

async function run() {
  console.log('==================================================');
  console.log('STARTING AUTOMATED VISUAL & NETWORK QA AUDIT');
  console.log('==================================================\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  let hasErrors = false;

  for (const vp of VIEWPORTS) {
    console.log(`\n--- Testing Viewport: ${vp.name} (${vp.width}x${vp.height}) ---`);
    const page = await browser.newPage();
    await page.setViewport(vp);

    const failedRequests = [];
    page.on('response', response => {
      if (response.status() >= 400) {
        failedRequests.push({ url: response.url(), status: response.status() });
      }
    });

    for (const route of ROUTES) {
      const url = `http://localhost:4173${route}`;
      try {
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 10000 });
        await new Promise(r => setTimeout(r, 200));

        // Check for double arrows or text anomaly
        const doubleArrowReport = await page.evaluate(() => {
          const elements = Array.from(document.querySelectorAll('button, a, .editorial-button, .luxury-product-card__cta-btn'));
          const issues = [];
          elements.forEach(el => {
            const text = el.textContent || '';
            const svgCount = el.querySelectorAll('svg').length;
            // Detect duplicate arrows in text or multiple consecutive right arrows
            if (text.includes('→ →') || text.includes('>>') || (text.includes('→') && svgCount > 0)) {
              issues.push({ text: text.trim(), svgCount, tag: el.tagName });
            }
          });
          return issues;
        });

        if (doubleArrowReport.length > 0) {
          console.error(`  [DOUBLE ARROW DETECTED] on ${route}:`, doubleArrowReport);
          hasErrors = true;
        } else {
          console.log(`  ✓ ${route.padEnd(28)} — Clean (0 double arrows)`);
        }
      } catch (err) {
        console.error(`  [FAILED TO LOAD] ${route}:`, err.message);
        hasErrors = true;
      }
    }

    if (failedRequests.length > 0) {
      console.error(`  [NETWORK 4xx/5xx ERRORS on ${vp.name}]:`, failedRequests);
      hasErrors = true;
    } else {
      console.log(`  ✓ Network Integrity on ${vp.name}: 100% (0 failed requests)`);
    }

    await page.close();
  }

  await browser.close();

  console.log('\n==================================================');
  if (!hasErrors) {
    console.log('✅ AUDIT PASSED: ALL VIEWPORTS CLEAN, ZERO 404s, ZERO DOUBLE ARROWS!');
    process.exit(0);
  } else {
    console.error('❌ AUDIT FAILED: Please check errors above.');
    process.exit(1);
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
