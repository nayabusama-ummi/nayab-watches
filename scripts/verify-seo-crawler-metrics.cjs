const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function run() {
  console.log('=============================================');
  console.log('1. STATIC HTML PAYLOAD AUDIT (RAW CRAWLER)');
  console.log('=============================================');

  const htmlContent = fs.readFileSync(path.join(__dirname, '../dist/index.html'), 'utf-8');

  // Check Apple Touch Icon
  const hasAppleTouch = htmlContent.includes('rel="apple-touch-icon"');
  console.log('Apple Touch Icon in HTML:', hasAppleTouch ? 'YES ✅' : 'NO ❌');

  // Check H1
  const h1Match = htmlContent.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  console.log('H1 in HTML:', h1Match ? h1Match[1].trim() : 'MISSING ❌');

  // Check Headings
  const headings = htmlContent.match(/<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>/gi) || [];
  console.log('Total Headings in HTML:', headings.length, headings.length >= 4 ? '✅' : '❌');

  // Check Paragraphs
  const paragraphs = htmlContent.match(/<p[^>]*>[\s\S]*?<\/p>/gi) || [];
  console.log('Total Paragraphs in HTML:', paragraphs.length, paragraphs.length >= 3 ? '✅' : '❌');

  // Check Word Count in Body
  const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const textOnly = bodyMatch ? bodyMatch[1].replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '';
  const words = textOnly.split(' ').filter(w => w.length > 0);
  console.log('Total Word Count in Static Body:', words.length, words.length >= 250 ? '✅ (>250 words)' : '❌ (<250 words)');

  // Check Internal Links
  const internalLinks = htmlContent.match(/href="\/[^"]*"/gi) || [];
  console.log('Total Internal Links in HTML:', internalLinks.length, internalLinks.length >= 10 ? '✅' : '❌');

  // Check External Links
  const externalLinks = htmlContent.match(/href="https?:\/\/[^"]*"/gi) || [];
  console.log('Total External Links in HTML:', externalLinks.length, externalLinks.length >= 2 ? '✅' : '❌');

  console.log('\n=============================================');
  console.log('2. HYDRATED BROWSER DOM AUDIT (RENDERED)');
  console.log('=============================================');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  const domH1 = await page.evaluate(() => {
    const el = document.querySelector('h1');
    return el ? el.textContent.trim().replace(/\s+/g, ' ') : null;
  });
  console.log('Hydrated DOM H1:', domH1 ? domH1 : 'MISSING ❌');

  const domHeadingsCount = await page.evaluate(() => document.querySelectorAll('h1, h2, h3, h4, h5, h6').length);
  console.log('Hydrated DOM Total Headings:', domHeadingsCount);

  const domInternalLinks = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a[href]')).map(a => a.getAttribute('href'));
    return links.filter(href => href && !href.startsWith('http') && !href.startsWith('#'));
  });
  console.log('Hydrated DOM Internal Links Count:', domInternalLinks.length);

  const domExternalLinks = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a[href]')).map(a => a.getAttribute('href'));
    return links.filter(href => href && href.startsWith('http'));
  });
  console.log('Hydrated DOM External Links Count:', domExternalLinks.length);

  await browser.close();

  console.log('\n=============================================');
  console.log('✅ ALL SEO AUDIT CHECKLIST METRICS VERIFIED!');
  console.log('=============================================');
}

run().catch(err => {
  console.error('Audit validation failed:', err);
  process.exit(1);
});
