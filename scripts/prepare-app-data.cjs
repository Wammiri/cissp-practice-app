/*
 * Copies the question bank, tests, and manifest into public/data so the
 * Next.js app can fetch them at runtime. Runs automatically before dev/build.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'public', 'data');
fs.mkdirSync(OUT, { recursive: true });

function copy(src, destName) {
  if (!fs.existsSync(src)) {
    console.error('  ! missing source:', src);
    process.exitCode = 1;
    return;
  }
  fs.copyFileSync(src, path.join(OUT, destName));
  console.log('  copied', destName);
}

console.log('Preparing app data -> public/data');
copy(path.join(ROOT, 'questions', 'cissp-question-bank.json'), 'cissp-question-bank.json');
copy(path.join(ROOT, 'tests', 'test-manifest.json'), 'test-manifest.json');
for (let t = 1; t <= 10; t++) {
  const id = `test-${String(t).padStart(2, '0')}`;
  copy(path.join(ROOT, 'tests', `${id}.json`), `${id}.json`);
}
console.log('Done.');
