/*
 * Validates the 10 practice tests + manifest:
 *  - each test has exactly 100 questions, weighted 16/10/13/13/13/12/13/10
 *  - every question ID resolves to the bank
 *  - the 10 tests partition the bank (1000 slots, no repeats, full coverage)
 *   node scripts/validate-tests.cjs
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const Q = path.join(ROOT, 'questions');
const TESTS = path.join(ROOT, 'tests');

const WEIGHTS = {
  'Security and Risk Management': 16,
  'Asset Security': 10,
  'Security Architecture and Engineering': 13,
  'Communication and Network Security': 13,
  'Identity and Access Management (IAM)': 13,
  'Security Assessment and Testing': 12,
  'Security Operations': 13,
  'Software Development Security': 10,
};

const errors = [];
const check = (c, m) => { if (!c) errors.push(m); };

const bank = JSON.parse(fs.readFileSync(path.join(Q, 'cissp-question-bank.json'), 'utf8'));
const bankIds = new Set(bank.questions.map((q) => q.id));

const manifest = JSON.parse(fs.readFileSync(path.join(TESTS, 'test-manifest.json'), 'utf8'));
check(manifest.tests.length === 10, `manifest: expected 10 tests, got ${manifest.tests.length}`);

const used = [];
for (let t = 1; t <= 10; t++) {
  const id = `test-${String(t).padStart(2, '0')}`;
  const file = path.join(TESTS, `${id}.json`);
  check(fs.existsSync(file), `${id}.json missing`);
  if (!fs.existsSync(file)) continue;
  const test = JSON.parse(fs.readFileSync(file, 'utf8'));
  check(test.questions.length === 100, `${id}: expected 100 questions, got ${test.questions.length}`);
  check(test.total_questions === test.questions.length, `${id}: total_questions mismatch`);
  for (const [name, w] of Object.entries(WEIGHTS)) {
    check(test.domain_distribution[name] === w, `${id}: ${name} weight ${test.domain_distribution[name]} != ${w}`);
  }
  test.questions.forEach((qid) => {
    check(bankIds.has(qid), `${id}: ${qid} not in bank`);
    used.push(qid);
  });
  check(new Set(test.questions).size === test.questions.length, `${id}: duplicate IDs within test`);
}

check(used.length === 1000, `tests cover ${used.length} slots, expected 1000`);
check(new Set(used).size === 1000, `tests have ${used.length - new Set(used).size} cross-test duplicate IDs`);
check([...bankIds].every((id) => used.includes(id)), 'some bank questions are not used by any test');

console.log(`Validated 10 tests (${used.length} slots) against ${bankIds.size}-question bank.`);
if (errors.length) {
  console.error(`\n${errors.length} ERROR(S):`);
  errors.slice(0, 50).forEach((e) => console.error('  !', e));
  process.exit(1);
}
console.log('TESTS VALID ✓ (10 weighted tests partition the bank with no repeats)');
