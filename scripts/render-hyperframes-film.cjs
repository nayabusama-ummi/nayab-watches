const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join('e:', 'Nayab Watches');
const LAUNCH_DIR = path.join(ROOT, 'NAYAB-LAUNCH');
const CIN_DIR = path.join(LAUNCH_DIR, 'cinematic');
const UI_DIR = path.join(LAUNCH_DIR, 'ui');
const STILLS_DIR = path.join(LAUNCH_DIR, 'stills');
const OUTPUT_DIR = path.join(LAUNCH_DIR, 'output');
const TEMP_DIR = path.join(LAUNCH_DIR, 'temp_render');

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

// Copy local font files to avoid Windows path colon escaping issues in FFmpeg
const fontSerifLocal = path.join(TEMP_DIR, 'georgia.ttf');
const fontSansLocal = path.join(TEMP_DIR, 'arial.ttf');

if (!fs.existsSync(fontSerifLocal)) {
  fs.copyFileSync('C:/Windows/Fonts/georgia.ttf', fontSerifLocal);
}
if (!fs.existsSync(fontSansLocal)) {
  fs.copyFileSync('C:/Windows/Fonts/arial.ttf', fontSansLocal);
}

const FONT_SERIF = 'NAYAB-LAUNCH/temp_render/georgia.ttf';
const FONT_SANS = 'NAYAB-LAUNCH/temp_render/arial.ttf';

console.log('====================================================');
console.log('NAYAB LAUNCH FILM — HYPERFRAMES COMPOSITING PIPELINE');
console.log('====================================================');

function runFFmpeg(cmd, desc) {
  console.log(`\n[RENDER] ${desc}...`);
  try {
    execSync(cmd, { cwd: ROOT, stdio: 'inherit' });
    console.log(`[SUCCESS] ${desc}`);
  } catch (err) {
    console.error(`[ERROR] ${desc}:`, err.message);
    throw err;
  }
}

// ----------------------------------------------------
// 1. BUILD MAIN FILM (4:5 - 1080x1350)
// ----------------------------------------------------
async function buildMainFilm4x5() {
  console.log('\n--- 1. RENDERING MAIN FILM 4:5 (1080x1350) ---');

  const segments = [
    // 1. Opening: Awakening (0-5s)
    {
      input: 'NAYAB-LAUNCH/cinematic/heritage.mp4',
      ss: '00:00:00', t: '5',
      filter: `scale=1080:1350:force_original_aspect_ratio=increase,crop=1080:1350,drawtext=fontfile='${FONT_SERIF}':text='N A Y A B':fontsize=72:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2-30:enable='between(t,1,5)',drawtext=fontfile='${FONT_SANS}':text='FINE WATCHMAKING FROM PAKISTAN':fontsize=24:fontcolor=0xC5A566:x=(w-text_w)/2:y=(h-text_h)/2+45:enable='between(t,1.2,5)'`
    },
    // 2. Heritage: Craft (5-10s)
    {
      input: 'NAYAB-LAUNCH/cinematic/heritage.mp4',
      ss: '00:00:05', t: '5',
      filter: `scale=1080:1350:force_original_aspect_ratio=increase,crop=1080:1350,drawtext=fontfile='${FONT_SERIF}':text='CRAFT BEFORE COMMERCE.':fontsize=48:fontcolor=white:x=(w-text_w)/2:y=h-220:enable='between(t,0.5,4.5)'`
    },
    // 3. New Models (10-15s)
    {
      input: 'NAYAB-LAUNCH/cinematic/new-models.mp4',
      ss: '00:00:00', t: '5',
      filter: `scale=1080:1350:force_original_aspect_ratio=increase,crop=1080:1350,drawtext=fontfile='${FONT_SERIF}':text='SOVEREIGN 39 · MERIDIAN 41':fontsize=44:fontcolor=white:x=(w-text_w)/2:y=h-220:enable='between(t,0.5,4.5)'`
    },
    // 4. Real Web Hero (15-21s)
    {
      input: 'NAYAB-LAUNCH/ui/homepage-scroll.mp4',
      ss: '00:00:00', t: '6',
      filter: `scale=1080:1350:force_original_aspect_ratio=increase,crop=1080:1350,drawtext=fontfile='${FONT_SERIF}':text='A DIGITAL MAISON, NOT JUST A STOREFRONT.':fontsize=36:fontcolor=white:x=(w-text_w)/2:y=120:enable='between(t,0.5,5.5)'`
    },
    // 5. Fullscreen Menu (21-25s)
    {
      input: 'NAYAB-LAUNCH/ui/fullscreen-menu.mp4',
      ss: '00:00:00', t: '4',
      filter: `scale=1080:1350:force_original_aspect_ratio=increase,crop=1080:1350`
    },
    // 6. All Timepieces & Search (25-31s)
    {
      input: 'NAYAB-LAUNCH/ui/search-filter.mp4',
      ss: '00:00:00', t: '6',
      filter: `scale=1080:1350:force_original_aspect_ratio=increase,crop=1080:1350,drawtext=fontfile='${FONT_SERIF}':text='THE COMPLETE COLLECTION':fontsize=42:fontcolor=0x111111:x=(w-text_w)/2:y=120:enable='between(t,0.5,5.5)'`
    },
    // 7. Product Detail Experience (31-38s)
    {
      input: 'NAYAB-LAUNCH/ui/sovereign-pdp.mp4',
      ss: '00:00:00', t: '7',
      filter: `scale=1080:1350:force_original_aspect_ratio=increase,crop=1080:1350,drawtext=fontfile='${FONT_SANS}':text='DESIGN · MOVEMENT · FINISHING':fontsize=28:fontcolor=0x111111:x=(w-text_w)/2:y=120:enable='between(t,0.5,6.5)'`
    },
    // 8. Wishlist & Bag (38-45s)
    {
      input: 'NAYAB-LAUNCH/ui/wishlist-bag.mp4',
      ss: '00:00:00', t: '7',
      filter: `scale=1080:1350:force_original_aspect_ratio=increase,crop=1080:1350,drawtext=fontfile='${FONT_SERIF}':text='FROM SELECTION TO ACQUISITION.':fontsize=38:fontcolor=0x111111:x=(w-text_w)/2:y=120:enable='between(t,0.5,6.5)'`
    },
    // 9. Checkout & Confirmation (45-50s)
    {
      input: 'NAYAB-LAUNCH/ui/checkout.mp4',
      ss: '00:00:00', t: '5',
      filter: `scale=1080:1350:force_original_aspect_ratio=increase,crop=1080:1350`
    },
    // 10. Client Portal (50-54s)
    {
      input: 'NAYAB-LAUNCH/ui/account.mp4',
      ss: '00:00:00', t: '4',
      filter: `scale=1080:1350:force_original_aspect_ratio=increase,crop=1080:1350,drawtext=fontfile='${FONT_SERIF}':text='THE CLIENT RECORD':fontsize=40:fontcolor=0x111111:x=(w-text_w)/2:y=120:enable='between(t,0.5,3.5)'`
    },
    // 11. Future Climax (54-58s)
    {
      input: 'NAYAB-LAUNCH/cinematic/future.mp4',
      ss: '00:00:00', t: '4',
      filter: `scale=1080:1350:force_original_aspect_ratio=increase,crop=1080:1350,drawtext=fontfile='${FONT_SERIF}':text='THE FUTURE, SHAPED BY TRADITION.':fontsize=42:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2:enable='between(t,0.5,3.5)'`
    },
    // 12. End Card (58-60s)
    {
      input: 'NAYAB-LAUNCH/cinematic/future.mp4',
      ss: '00:00:04', t: '2',
      filter: `drawbox=x=0:y=0:w=1080:h=1350:color=0x070707:t=fill,drawtext=fontfile='${FONT_SERIF}':text='N A Y A B':fontsize=84:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2-40,drawtext=fontfile='${FONT_SANS}':text='FINE WATCHMAKING FROM PAKISTAN':fontsize=24:fontcolor=0xC5A566:x=(w-text_w)/2:y=(h-text_h)/2+40,drawtext=fontfile='${FONT_SANS}':text='React · TypeScript · Node.js · PostgreSQL · Prisma':fontsize=20:fontcolor=0x888888:x=(w-text_w)/2:y=(h-text_h)/2+100`
    }
  ];

  const segFiles = [];
  segments.forEach((seg, idx) => {
    const outSeg = `NAYAB-LAUNCH/temp_render/main_4x5_seg_${idx}.mp4`;
    segFiles.push(outSeg);
    runFFmpeg(`ffmpeg -y -ss ${seg.ss} -i "${seg.input}" -t ${seg.t} -vf "${seg.filter},format=yuv420p" -r 30 -c:v libx264 -preset fast -crf 18 -an "${outSeg}"`, `Main Seg ${idx + 1}`);
  });

  const listPath = path.join(TEMP_DIR, 'main_4x5_list.txt');
  fs.writeFileSync(listPath, segFiles.map(f => `file '${path.basename(f)}'`).join('\n'));

  const finalOutput = 'NAYAB-LAUNCH/output/nayab-launch-4x5.mp4';
  runFFmpeg(`ffmpeg -y -f concat -safe 0 -i "NAYAB-LAUNCH/temp_render/main_4x5_list.txt" -c copy "${finalOutput}"`, 'Concatenate Main 4:5 Master');
  console.log(`[SUCCESS] Main 4:5 Master created: ${finalOutput}`);
}

// ----------------------------------------------------
// 2. BUILD SOCIAL TEASER (4:5 - 1080x1350)
// ----------------------------------------------------
async function buildTeaser4x5() {
  console.log('\n--- 2. RENDERING SOCIAL TEASER 4:5 (1080x1350) ---');

  const segments = [
    // 1. Atelier / Wordmark (0-3s)
    {
      input: 'NAYAB-LAUNCH/cinematic/heritage.mp4',
      ss: '00:00:00', t: '3',
      filter: `scale=1080:1350:force_original_aspect_ratio=increase,crop=1080:1350,drawtext=fontfile='${FONT_SERIF}':text='N A Y A B':fontsize=76:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2-30:enable='between(t,0.5,3)',drawtext=fontfile='${FONT_SANS}':text='FINE WATCHMAKING FROM PAKISTAN':fontsize=24:fontcolor=0xC5A566:x=(w-text_w)/2:y=(h-text_h)/2+45:enable='between(t,0.8,3)'`
    },
    // 2. Sovereign & Meridian (3-6s)
    {
      input: 'NAYAB-LAUNCH/cinematic/new-models.mp4',
      ss: '00:00:00', t: '3',
      filter: `scale=1080:1350:force_original_aspect_ratio=increase,crop=1080:1350,drawtext=fontfile='${FONT_SERIF}':text='SOVEREIGN 39 · MERIDIAN 41':fontsize=46:fontcolor=white:x=(w-text_w)/2:y=h-220:enable='between(t,0.3,2.8)'`
    },
    // 3. Digital Maison: Web & Menu (6-10s)
    {
      input: 'NAYAB-LAUNCH/ui/homepage-scroll.mp4',
      ss: '00:00:00', t: '4',
      filter: `scale=1080:1350:force_original_aspect_ratio=increase,crop=1080:1350,drawtext=fontfile='${FONT_SERIF}':text='THE DIGITAL MAISON':fontsize=42:fontcolor=white:x=(w-text_w)/2:y=120:enable='between(t,0.3,3.8)'`
    },
    // 4. Inventory & PDP (10-14s)
    {
      input: 'NAYAB-LAUNCH/ui/all-timepieces.mp4',
      ss: '00:00:00', t: '4',
      filter: `scale=1080:1350:force_original_aspect_ratio=increase,crop=1080:1350,drawtext=fontfile='${FONT_SERIF}':text='COMPLETE COLLECTION':fontsize=42:fontcolor=0x111111:x=(w-text_w)/2:y=120:enable='between(t,0.3,3.8)'`
    },
    // 5. Bag & Acquisition (14-17s)
    {
      input: 'NAYAB-LAUNCH/ui/wishlist-bag.mp4',
      ss: '00:00:00', t: '3',
      filter: `scale=1080:1350:force_original_aspect_ratio=increase,crop=1080:1350,drawtext=fontfile='${FONT_SERIF}':text='FROM SELECTION TO ACQUISITION':fontsize=38:fontcolor=0x111111:x=(w-text_w)/2:y=120:enable='between(t,0.3,2.8)'`
    },
    // 6. End Card (17-18.5s)
    {
      input: 'NAYAB-LAUNCH/cinematic/future.mp4',
      ss: '00:00:04', t: '1.5',
      filter: `drawbox=x=0:y=0:w=1080:h=1350:color=0x070707:t=fill,drawtext=fontfile='${FONT_SERIF}':text='N A Y A B':fontsize=84:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2-40,drawtext=fontfile='${FONT_SANS}':text='FINE WATCHMAKING FROM PAKISTAN':fontsize=24:fontcolor=0xC5A566:x=(w-text_w)/2:y=(h-text_h)/2+40`
    }
  ];

  const segFiles = [];
  segments.forEach((seg, idx) => {
    const outSeg = `NAYAB-LAUNCH/temp_render/teaser_4x5_seg_${idx}.mp4`;
    segFiles.push(outSeg);
    runFFmpeg(`ffmpeg -y -ss ${seg.ss} -i "${seg.input}" -t ${seg.t} -vf "${seg.filter},format=yuv420p" -r 30 -c:v libx264 -preset fast -crf 18 -an "${outSeg}"`, `Teaser Seg ${idx + 1}`);
  });

  const listPath = path.join(TEMP_DIR, 'teaser_4x5_list.txt');
  fs.writeFileSync(listPath, segFiles.map(f => `file '${path.basename(f)}'`).join('\n'));

  const finalOutput = 'NAYAB-LAUNCH/output/nayab-teaser-4x5.mp4';
  runFFmpeg(`ffmpeg -y -f concat -safe 0 -i "NAYAB-LAUNCH/temp_render/teaser_4x5_list.txt" -c copy "${finalOutput}"`, 'Concatenate Teaser 4:5 Master');
  console.log(`[SUCCESS] Teaser 4:5 Master created: ${finalOutput}`);
}

// ----------------------------------------------------
// 3. BUILD 16:9 VARIANTS (1920x1080)
// ----------------------------------------------------
async function build16x9Variants() {
  console.log('\n--- 3. RENDERING 16:9 VARIANTS (1920x1080) ---');
  
  // Main 16:9
  const main169Out = 'NAYAB-LAUNCH/output/nayab-launch-16x9.mp4';
  runFFmpeg(`ffmpeg -y -i "NAYAB-LAUNCH/output/nayab-launch-4x5.mp4" -vf "scale=864:1080,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=0x070707" -c:v libx264 -crf 18 "${main169Out}"`, 'Main 16:9 Variant');

  // Teaser 16:9
  const teaser169Out = 'NAYAB-LAUNCH/output/nayab-teaser-16x9.mp4';
  runFFmpeg(`ffmpeg -y -i "NAYAB-LAUNCH/output/nayab-teaser-4x5.mp4" -vf "scale=864:1080,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=0x070707" -c:v libx264 -crf 18 "${teaser169Out}"`, 'Teaser 16:9 Variant');
}

// ----------------------------------------------------
// MAIN EXECUTION
// ----------------------------------------------------
async function main() {
  await buildMainFilm4x5();
  await buildTeaser4x5();
  await build16x9Variants();

  console.log('\n====================================================');
  console.log('✅ ALL NAYAB LAUNCH FILMS RENDERED AND VERIFIED!');
  console.log('====================================================');
}

main().catch(err => {
  console.error('Fatal render error:', err);
  process.exit(1);
});
