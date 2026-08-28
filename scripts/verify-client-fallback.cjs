const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  const routes = [
    { url: 'http://localhost:4173/watches', check: (content) => !content.includes('0 timepieces displayed') && content.includes('Sovereign 39') },
    { url: 'http://localhost:4173/watches/sovereign-39', check: (content) => !content.includes('Timepiece Not Found') && content.includes('Sovereign 39') && content.includes('REF. NB-3901-RG') },
    { url: 'http://localhost:4173/watches/meridian-41', check: (content) => !content.includes('Timepiece Not Found') && content.includes('Meridian 41') && content.includes('REF. NB-4102-TI') },
    { url: 'http://localhost:4173/watches/noor-32', check: (content) => !content.includes('Timepiece Not Found') && content.includes('Noor 32') },
    { url: 'http://localhost:4173/collections', check: (content) => content.includes('MEHR') && content.includes('INDUS') },
    { url: 'http://localhost:4173/collections/mehr', check: (content) => content.includes('MEHR') && content.includes('Sovereign 39') },
  ];

  let allPassed = true;

  for (const r of routes) {
    console.log(`Checking ${r.url}...`);
    await page.goto(r.url, { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise(res => setTimeout(res, 800));
    const content = await page.content();
    const passed = r.check(content);
    console.log(`  Result for ${r.url}: ${passed ? 'PASSED ✅' : 'FAILED ❌'}`);
    if (!passed) {
      allPassed = false;
    }
  }

  await browser.close();

  if (allPassed) {
    console.log('\nALL VERIFICATION CHECKS PASSED PERFECTLY! 🚀');
    process.exit(0);
  } else {
    console.error('\nSOME VERIFICATION CHECKS FAILED!');
    process.exit(1);
  }
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
