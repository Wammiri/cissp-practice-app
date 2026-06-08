/*
 * Validates the merged question bank (questions/cissp-question-bank.json) and
 * each per-domain file. Exits non-zero on any error.
 *   node scripts/validate-question-bank.cjs
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const Q = path.join(ROOT, 'questions');
const TYPES = new Set([
  'single_best_answer',
  'scenario_based',
  'multiple_correct_answers',
  'matching',
  'sequence_ordering',
]);

const errors = [];
function check(cond, msg) {
  if (!cond) errors.push(msg);
}

function validAnswer(q) {
  const labels = (q.options || []).map((o) => o.label);
  const a = q.correct_answer;
  if (typeof a === 'string' && /^[A-H]$/.test(a)) return labels.includes(a);
  if (Array.isArray(a)) return a.length > 0 && a.every((x) => labels.includes(x));
  if (typeof a === 'string' && a.includes('-')) return a.split(',').every((s) => /^\d+-[A-H]$/.test(s.trim()));
  if (typeof a === 'string' && a.includes(',')) return a.split(',').every((x) => labels.includes(x.trim()));
  return false;
}

function validateQuestion(q) {
  const id = q.id || '(no id)';
  check(!!q.id, `${id}: missing id`);
  check(q.question && q.question.length >= 10, `${id}: missing/short question`);
  check(Array.isArray(q.options) && q.options.length >= 3, `${id}: needs >=3 options`);
  check((q.options || []).every((o) => o.label && o.text), `${id}: option missing label/text`);
  check(TYPES.has(q.question_type), `${id}: bad question_type ${q.question_type}`);
  check(validAnswer(q), `${id}: invalid correct_answer ${JSON.stringify(q.correct_answer)}`);
  check(q.explanation && q.explanation.why_correct, `${id}: missing why_correct`);
  check(!!q.topic && !!q.subtopic, `${id}: missing topic/subtopic`);
  check(q.source_reference && q.source_reference.syllabus_section, `${id}: missing syllabus_section`);
  if (q.question_type === 'single_best_answer' || q.question_type === 'scenario_based') {
    const labels = q.options.map((o) => o.label);
    labels
      .filter((l) => l !== q.correct_answer)
      .forEach((l) => check(q.explanation.why_others_are_wrong && q.explanation.why_others_are_wrong[l], `${id}: missing wrong-explanation ${l}`));
  }
  if (q.question_type === 'matching') check(Array.isArray(q.prompts) && q.prompts.length > 0, `${id}: matching needs prompts`);
}

// per-domain files
const expected = { 1: 160, 2: 100, 3: 130, 4: 130, 5: 130, 6: 120, 7: 130, 8: 100 };
const files = fs.readdirSync(Q).filter((f) => /^domain-0\d-.*\.json$/.test(f)).sort();
const ids = new Set();
let perDomainTotal = 0;
for (const f of files) {
  const dn = Number(f.match(/^domain-0(\d)/)[1]);
  const data = JSON.parse(fs.readFileSync(path.join(Q, f), 'utf8'));
  check(data.questions.length === expected[dn], `${f}: expected ${expected[dn]}, got ${data.questions.length}`);
  data.questions.forEach((q) => {
    check(!ids.has(q.id), `duplicate id ${q.id}`);
    ids.add(q.id);
    check(q.domain_number === dn, `${q.id}: domain_number ${q.domain_number} != ${dn}`);
    validateQuestion(q);
  });
  perDomainTotal += data.questions.length;
}

// merged bank
const bankPath = path.join(Q, 'cissp-question-bank.json');
check(fs.existsSync(bankPath), 'cissp-question-bank.json missing — run scripts/build-aggregate.cjs');
if (fs.existsSync(bankPath)) {
  const bank = JSON.parse(fs.readFileSync(bankPath, 'utf8'));
  check(bank.questions.length === 1000, `bank: expected 1000, got ${bank.questions.length}`);
  check(new Set(bank.questions.map((q) => q.id)).size === 1000, 'bank: duplicate IDs');
  check(perDomainTotal === bank.questions.length, 'bank vs per-domain count mismatch');
}

console.log(`Validated ${ids.size} questions across ${files.length} domain files + merged bank.`);
if (errors.length) {
  console.error(`\n${errors.length} ERROR(S):`);
  errors.slice(0, 50).forEach((e) => console.error('  !', e));
  process.exit(1);
}
console.log('QUESTION BANK VALID ✓');
