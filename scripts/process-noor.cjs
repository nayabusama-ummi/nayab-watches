const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const src = 'C:\\Users\\Ummi\\.gemini\\antigravity-ide\\brain\\cd497ee2-bffc-4dc3-9cc7-6901546116e5\\noor_32_watch_1787679563378.jpg';
const dstWebp = path.join(__dirname, '..', 'public', 'images', 'noor-32-women.webp');
const dstPng = path.join(__dirname, '..', 'public', 'images', 'noor-32-women.png');

if (fs.existsSync(src)) {
  execSync(`ffmpeg -y -i "${src}" -q:v 85 "${dstWebp}"`);
  execSync(`ffmpeg -y -i "${src}" "${dstPng}"`);
  console.log('Successfully created noor-32-women.webp and noor-32-women.png');
} else {
  console.error('Source image not found at', src);
}
