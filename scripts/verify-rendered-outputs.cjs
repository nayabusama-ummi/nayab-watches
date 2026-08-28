const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const outDir = path.join('e:', 'Nayab Watches', 'NAYAB-LAUNCH', 'output');
const files = fs.readdirSync(outDir).filter(f => f.endsWith('.mp4'));

console.log('==============================================');
console.log('VERIFYING RENDERED MASTER LAUNCH DELIVERABLES:');
console.log('==============================================');

files.forEach(f => {
  const fullPath = path.join(outDir, f);
  const sizeMb = (fs.statSync(fullPath).size / (1024 * 1024)).toFixed(2);
  const probe = execSync(`ffprobe -v error -show_entries format=duration,bit_rate -show_entries stream=width,height,r_frame_rate,nb_frames,codec_name -of default=noprint_wrappers=1 "${fullPath}"`, { encoding: 'utf-8' });
  console.log(`\nFILE: ${f} (${sizeMb} MB)`);
  console.log(probe.trim());
});
