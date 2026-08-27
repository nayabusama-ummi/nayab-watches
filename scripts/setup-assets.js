const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const publicMedia = path.join(__dirname, '..', 'public', 'media');
const publicImages = path.join(__dirname, '..', 'public', 'images');

if (!fs.existsSync(publicMedia)) fs.mkdirSync(publicMedia, { recursive: true });
if (!fs.existsSync(publicImages)) fs.mkdirSync(publicImages, { recursive: true });

const rootDir = path.join(__dirname, '..');

// 1. Copy Videos
const videos = ['nayab-heritage.mp4', 'nayab-new-models.mp4', 'nayab-future.mp4'];
videos.forEach(v => {
  const src = path.join(rootDir, v);
  const dst = path.join(publicMedia, v);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dst);
    console.log(`Copied ${v} -> public/media/${v}`);
  }
});

// 2. Generate Posters
try {
  execSync(`ffmpeg -y -i "${path.join(publicMedia, 'nayab-heritage.mp4')}" -ss 00:00:01 -vframes 1 -q:v 2 "${path.join(publicMedia, 'nayab-heritage-poster.webp')}"`);
  execSync(`ffmpeg -y -i "${path.join(publicMedia, 'nayab-new-models.mp4')}" -ss 00:00:01 -vframes 1 -q:v 2 "${path.join(publicMedia, 'nayab-new-models-poster.webp')}"`);
  execSync(`ffmpeg -y -i "${path.join(publicMedia, 'nayab-future.mp4')}" -ss 00:00:01 -vframes 1 -q:v 2 "${path.join(publicMedia, 'nayab-future-poster.webp')}"`);
  console.log('Video poster frames generated.');
} catch (err) {
  console.error('Error generating posters:', err.message);
}

// 3. Copy/convert watch images
const directImages = [
  'sovereign-39-front.png',
  'meridian-41-front.png',
  'meridian-exploded.png',
  'watchmaker-atelier.png'
];
directImages.forEach(img => {
  const src = path.join(rootDir, img);
  const dst = path.join(publicImages, img);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dst);
    console.log(`Copied image ${img}`);
  }
});

// 4. Convert .jfif files
const jfifConversions = [
  { src: 'sovereign-side.jfif', dst: 'sovereign-side.png' },
  { src: 'meridian-material-macro.jfif', dst: 'meridian-material-macro.png' },
  { src: 'Gemini_Generated_Image_8xwo3v8xwo3v8xwo.jfif', dst: 'womens-collection.png' },
  { src: 'Gemini_Generated_Image_c46avpc46avpc46a.jfif', dst: 'archive-1898.png' },
  { src: 'Gemini_Generated_Image_d8ru1fd8ru1fd8ru.jfif', dst: 'archive-1928.png' },
  { src: 'Gemini_Generated_Image_z7wewuz7wewuz7we.jfif', dst: 'collection-nocturne.png' },
  { src: 'ChatGPT Image Aug 25, 2026, 01_35_40 AM.png', dst: 'collection-regatta.png' },
  { src: 'ChatGPT Image Aug 25, 2026, 02_08_08 AM.png', dst: 'collection-atelier.png' },
  { src: 'ChatGPT Image Aug 25, 2026, 02_10_37 AM.png', dst: 'craftsmanship-macro.png' }
];

jfifConversions.forEach(({ src, dst }) => {
  const srcPath = path.join(rootDir, src);
  const dstPath = path.join(publicImages, dst);
  if (fs.existsSync(srcPath)) {
    try {
      execSync(`ffmpeg -y -i "${srcPath}" "${dstPath}"`);
      console.log(`Converted & copied ${src} -> ${dst}`);
    } catch (e) {
      console.error(`Failed to convert ${src}:`, e.message);
    }
  }
});
