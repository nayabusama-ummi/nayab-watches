const puppeteer = require('puppeteer-core');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ROOT = path.join('e:', 'Nayab Watches');
const LAUNCH_DIR = path.join(ROOT, 'NAYAB-LAUNCH');
const CIN_DIR = path.join(LAUNCH_DIR, 'cinematic');
const UI_DIR = path.join(LAUNCH_DIR, 'ui');
const STILLS_DIR = path.join(LAUNCH_DIR, 'stills');
const OUTPUT_DIR = path.join(LAUNCH_DIR, 'output');
const FRAMES_TEMP = path.join(LAUNCH_DIR, 'frames_temp');

[LAUNCH_DIR, CIN_DIR, UI_DIR, STILLS_DIR, OUTPUT_DIR, FRAMES_TEMP].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

// 1. Copy Cinematic & Stills
console.log('1. Copying Cinematic and Stills...');
const cinMap = [
  { src: path.join(ROOT, 'public', 'media', 'nayab-heritage.mp4'), dest: path.join(CIN_DIR, 'heritage.mp4') },
  { src: path.join(ROOT, 'public', 'media', 'nayab-new-models.mp4'), dest: path.join(CIN_DIR, 'new-models.mp4') },
  { src: path.join(ROOT, 'public', 'media', 'nayab-future.mp4'), dest: path.join(CIN_DIR, 'future.mp4') },
];
cinMap.forEach(i => fs.copyFileSync(i.src, i.dest));

const stillsMap = [
  { src: path.join(ROOT, 'public', 'images', 'sovereign-39-front.png'), dest: path.join(STILLS_DIR, 'sovereign-39-front.png') },
  { src: path.join(ROOT, 'public', 'images', 'meridian-41-front.png'), dest: path.join(STILLS_DIR, 'meridian-41-front.png') },
  { src: path.join(ROOT, 'public', 'images', 'meridian-exploded.png'), dest: path.join(STILLS_DIR, 'meridian-exploded.png') },
  { src: path.join(ROOT, 'public', 'images', 'watchmaker-atelier.png'), dest: path.join(STILLS_DIR, 'watchmaker-atelier.png') },
  { src: path.join(ROOT, 'public', 'images', 'craftsmanship-macro.png'), dest: path.join(STILLS_DIR, 'movement-macro.png') },
];
stillsMap.forEach(i => fs.copyFileSync(i.src, i.dest));

// 2. High-Fidelity Recording of UI
async function recordSequence(page, name, actionFn, durationSec = 6, fps = 30) {
  console.log(`\nRecording UI clip: ${name} (${durationSec}s at ${fps}fps)...`);
  const totalFrames = durationSec * fps;
  const frameIntervalMs = 1000 / fps;
  const frameDir = path.join(FRAMES_TEMP, name);
  if (fs.existsSync(frameDir)) fs.rmSync(frameDir, { recursive: true, force: true });
  fs.mkdirSync(frameDir, { recursive: true });

  let isRecording = true;
  let frameCount = 0;

  // Run action in background
  const actionPromise = actionFn(page);

  for (let i = 0; i < totalFrames; i++) {
    const framePath = path.join(frameDir, `frame_${String(i).padStart(4, '0')}.png`);
    await page.screenshot({ path: framePath, type: 'png' });
    await new Promise(r => setTimeout(r, frameIntervalMs / 2));
  }
  await actionPromise;

  const outMp4 = path.join(UI_DIR, `${name}.mp4`);
  console.log(`Compiling frames into ${outMp4}...`);
  execSync(`ffmpeg -y -framerate ${fps} -i "${path.join(frameDir, 'frame_%04d.png')}" -c:v libx264 -pix_fmt yuv420p -crf 18 "${outMp4}"`, { stdio: 'inherit' });
  console.log(`[SAVED] ${outMp4}`);
}

async function main() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 1 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // 1. Homepage Scroll
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });
  await recordSequence(page, 'homepage-scroll', async (p) => {
    for (let s = 0; s < 100; s++) {
      await p.evaluate(() => window.scrollBy(0, 15));
      await new Promise(r => setTimeout(r, 40));
    }
  }, 6);

  // 2. Fullscreen Menu
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });
  await recordSequence(page, 'fullscreen-menu', async (p) => {
    await new Promise(r => setTimeout(r, 500));
    const menuBtn = await p.$('.luxury-header__menu-btn');
    if (menuBtn) await menuBtn.click();
    await new Promise(r => setTimeout(r, 3000));
  }, 4);

  // 3. All Timepieces
  await page.goto('http://localhost:4173/watches', { waitUntil: 'networkidle0' });
  await recordSequence(page, 'all-timepieces', async (p) => {
    for (let s = 0; s < 80; s++) {
      await p.evaluate(() => window.scrollBy(0, 12));
      await new Promise(r => setTimeout(r, 40));
    }
  }, 6);

  // 4. Search Filter
  await page.goto('http://localhost:4173/watches', { waitUntil: 'networkidle0' });
  await recordSequence(page, 'search-filter', async (p) => {
    await new Promise(r => setTimeout(r, 800));
    await p.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('.watches-filter-pill'));
      const goldBtn = btns.find(b => b.textContent.includes('Rose Gold') || b.textContent.includes('Titanium'));
      if (goldBtn) goldBtn.click();
    });
    await new Promise(r => setTimeout(r, 3000));
  }, 6);

  // 5. Sovereign PDP
  await page.goto('http://localhost:4173/watches/sovereign-39', { waitUntil: 'networkidle0' });
  await recordSequence(page, 'sovereign-pdp', async (p) => {
    for (let s = 0; s < 80; s++) {
      await p.evaluate(() => window.scrollBy(0, 15));
      await new Promise(r => setTimeout(r, 50));
    }
  }, 7);

  // 6. Meridian PDP
  await page.goto('http://localhost:4173/watches/meridian-41', { waitUntil: 'networkidle0' });
  await recordSequence(page, 'meridian-pdp', async (p) => {
    for (let s = 0; s < 80; s++) {
      await p.evaluate(() => window.scrollBy(0, 15));
      await new Promise(r => setTimeout(r, 50));
    }
  }, 7);

  // 7. Wishlist & Bag
  await page.goto('http://localhost:4173/cart', { waitUntil: 'networkidle0' });
  await recordSequence(page, 'wishlist-bag', async (p) => {
    await new Promise(r => setTimeout(r, 4000));
  }, 7);

  // 8. Checkout
  await page.goto('http://localhost:4173/checkout', { waitUntil: 'networkidle0' });
  await recordSequence(page, 'checkout', async (p) => {
    for (let s = 0; s < 60; s++) {
      await p.evaluate(() => window.scrollBy(0, 10));
      await new Promise(r => setTimeout(r, 50));
    }
  }, 5);

  // 9. Account
  await page.goto('http://localhost:4173/account', { waitUntil: 'networkidle0' });
  await recordSequence(page, 'account', async (p) => {
    await new Promise(r => setTimeout(r, 3000));
  }, 4);

  // 10. Order Confirmation
  await page.goto('http://localhost:4173/checkout', { waitUntil: 'networkidle0' });
  await recordSequence(page, 'order-confirmation', async (p) => {
    await new Promise(r => setTimeout(r, 3000));
  }, 4);

  await browser.close();

  // Cleanup frames_temp
  if (fs.existsSync(FRAMES_TEMP)) fs.rmSync(FRAMES_TEMP, { recursive: true, force: true });

  console.log('\n======================================================');
  console.log('✅ ALL 10 REAL SCREEN RECORDINGS CAPTURED & SAVED!');
  console.log('======================================================');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
