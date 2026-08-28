const puppeteer = require('puppeteer-core');
const fs = require('fs');
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
  let allPassed = true;

  console.log('=== 1. TESTING HOMEPAGE DESKTOP & SEO ===');
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  const homeTitle = await page.title();
  const homeMetaDesc = await page.$eval('meta[name="description"]', el => el.getAttribute('content'));
  const homeOgTitle = await page.$eval('meta[property="og:title"]', el => el.getAttribute('content'));
  const homeCanonical = await page.$eval('link[rel="canonical"]', el => el.getAttribute('href'));

  console.log('Home Title:', homeTitle);
  console.log('Home Meta Description:', homeMetaDesc);
  console.log('Home Canonical:', homeCanonical);
  console.log('Home OG Title:', homeOgTitle);

  if (!homeTitle.includes('NAYAB') || !homeMetaDesc.includes('NAYAB') || !homeCanonical.includes('nayabwatches.com')) {
    console.error('Homepage SEO check failed!');
    allPassed = false;
  } else {
    console.log('Homepage SEO Passed ✅');
  }

  console.log('\n=== 2. TESTING CATALOGUE PAGE & ITEMLIST SCHEMA ===');
  await page.goto('http://localhost:4173/watches', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  const watchesTitle = await page.title();
  const jsonLdContent = await page.evaluate(() => {
    const el = document.getElementById('page-json-ld');
    return el ? JSON.parse(el.textContent) : null;
  });

  console.log('Watches Title:', watchesTitle);
  console.log('Watches Schema Type:', jsonLdContent ? jsonLdContent['@type'] : 'None');
  console.log('Watches Items in Schema:', jsonLdContent && jsonLdContent.mainEntity ? jsonLdContent.mainEntity.numberOfItems : 0);

  if (!watchesTitle.includes('Timepieces') || !jsonLdContent || jsonLdContent.mainEntity.numberOfItems < 7) {
    console.error('Watches Catalogue SEO schema check failed!');
    allPassed = false;
  } else {
    console.log('Watches Catalogue SEO Passed ✅');
  }

  console.log('\n=== 3. TESTING PRODUCT DETAIL PAGE DESKTOP & PRODUCT SCHEMA ===');
  await page.goto('http://localhost:4173/watches/sovereign-39', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  const pdpTitle = await page.title();
  const pdpSchema = await page.evaluate(() => {
    const el = document.getElementById('page-json-ld');
    return el ? JSON.parse(el.textContent) : null;
  });

  console.log('PDP Title:', pdpTitle);
  console.log('PDP Schema Type:', pdpSchema ? pdpSchema['@type'] : 'None');
  console.log('PDP Schema SKU:', pdpSchema ? pdpSchema.sku : 'None');
  console.log('PDP Schema Price:', pdpSchema && pdpSchema.offers ? `${pdpSchema.offers.priceCurrency} ${pdpSchema.offers.price}` : 'None');

  if (!pdpTitle.includes('Sovereign 39') || !pdpSchema || pdpSchema['@type'] !== 'Product' || !pdpSchema.offers) {
    console.error('PDP SEO Product schema check failed!');
    allPassed = false;
  } else {
    console.log('PDP Product SEO Passed ✅');
  }

  console.log('\n=== 4. TESTING MOBILE VIEWPORT (375x812) & STICKY CTA ===');
  await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:4173/watches/sovereign-39', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  // Check if sticky bar exists and is visible
  const stickyBarVisible = await page.evaluate(() => {
    const el = document.querySelector('.pdp-sticky-bar');
    if (!el) return false;
    const style = window.getComputedStyle(el);
    return style.display !== 'none' && style.visibility !== 'hidden';
  });

  console.log('Mobile Sticky Bar Visible:', stickyBarVisible ? 'YES ✅' : 'NO ❌');
  if (!stickyBarVisible) {
    console.error('Mobile sticky purchase action bar is not visible on phone viewport!');
    allPassed = false;
  }

  await browser.close();

  if (allPassed) {
    console.log('\n🌟 ALL SEO & UI/UX VERIFICATIONS PASSED WITH 100% SUCCESS! 🚀');
    process.exit(0);
  } else {
    console.error('\n❌ SOME VERIFICATION CHECKS FAILED');
    process.exit(1);
  }
}

run().catch(err => {
  console.error('Error during verification:', err);
  process.exit(1);
});
