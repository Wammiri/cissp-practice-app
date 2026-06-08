/*
 * Phase C — Domain 1 question bank builder
 * Expands the compact authored question objects in part1..part4 into the full
 * schema (04_schemas/question_schema.md), assigns sequential IDs
 * CISSP-D01-Q0001..0160, validates, and writes:
 *   questions/domain-01-security-risk-management.json
 *
 * Compact authored shape (per question):
 *   { t, s, d, qt, sec, q, o:[...], a, wc, ww:{LETTER:reason}, er,
 *     p:[...]            // (matching only) left-hand prompts, numbered 1..n
 *   }
 *   d  = difficulty: easy|medium|hard
 *   qt = question_type
 *   a  = correct_answer: letter | [letters] | "1-B,2-A,.." (matching) | "C,A,D,B" (sequence)
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

const parts = [
  require('./part1.cjs'),
  require('./part2.cjs'),
  require('./part3.cjs'),
  require('./part4.cjs'),
];
const raw = [].concat(...parts);

// Deterministic seeded PRNG (mulberry32) so the shuffle is reproducible.
function rng(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Build a permutation of [0..n-1]; reject the identity so positions actually move.
function permutation(n, seed) {
  const rand = rng(seed);
  let perm;
  for (let attempt = 0; attempt < 8; attempt++) {
    perm = [...Array(n).keys()];
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [perm[i], perm[j]] = [perm[j], perm[i]];
    }
    if (perm.some((v, i) => v !== i)) break; // not identity
  }
  return perm; // perm[newIndex] = oldIndex
}

// Distribute correct-answer positions by shuffling options and remapping the
// answer + per-option explanation keys for every question type.
function expand(item, idx) {
  const num = String(idx + 1).padStart(4, '0');
  const n = item.o.length;
  const perm = permutation(n, idx + 1);            // perm[new] = old
  const oldToNew = [];
  perm.forEach((oldIdx, newIdx) => { oldToNew[oldIdx] = newIdx; });
  const oldLabel = i => LETTERS[i];
  const newLabelForOld = oldIdx => LETTERS[oldToNew[oldIdx]];

  const options = perm.map((oldIdx, newIdx) => ({ label: LETTERS[newIdx], text: item.o[oldIdx] }));

  // remap correct_answer
  let correct;
  const a = item.a;
  if (Array.isArray(a)) {
    correct = a.map(l => newLabelForOld(LETTERS.indexOf(l))).sort();
  } else if (typeof a === 'string' && a.includes('-')) {
    // matching: "1-B,2-A" — left prompts unchanged, remap the option labels
    correct = a.split(',').map(pair => {
      const [p, l] = pair.split('-');
      return `${p}-${newLabelForOld(LETTERS.indexOf(l))}`;
    }).join(',');
  } else if (typeof a === 'string' && a.includes(',')) {
    // sequence: authored option order (old 0,1,2,...) is the correct order
    correct = item.o.map((_, oldIdx) => newLabelForOld(oldIdx)).join(',');
  } else {
    correct = newLabelForOld(LETTERS.indexOf(a));
  }

  // remap why_others_are_wrong keys from old labels to new labels
  const wwOld = item.ww || {};
  const ww = {};
  for (const k of Object.keys(wwOld)) ww[newLabelForOld(LETTERS.indexOf(k))] = wwOld[k];

  const q = {
    id: `CISSP-D01-Q${num}`,
    domain: 'Security and Risk Management',
    domain_number: 1,
    topic: item.t,
    subtopic: item.s,
    difficulty: item.d,
    question_type: item.qt,
    question: item.q,
    options,
    correct_answer: correct,
    explanation: {
      why_correct: item.wc,
      why_others_are_wrong: ww,
    },
    exam_reasoning: item.er,
    source_reference: {
      syllabus_section: item.sec,
      source_file: '/content/cissp-syllabus.md',
    },
  };
  if (item.p) q.prompts = item.p;            // matching questions (left-side prompts)
  return q;
}

const questions = raw.map(expand);

// -------------------------------------------------------------------------
// validation
// -------------------------------------------------------------------------
const errors = [];
const ids = new Set();
const diffTally = { easy: 0, medium: 0, hard: 0 };
const typeTally = {};

questions.forEach((q, i) => {
  const where = q.id || `index ${i}`;
  if (!q.id) errors.push(`${where}: missing id`);
  if (ids.has(q.id)) errors.push(`${where}: duplicate id`);
  ids.add(q.id);
  if (!q.topic) errors.push(`${where}: missing topic`);
  if (!q.subtopic) errors.push(`${where}: missing subtopic`);
  if (!q.question || q.question.length < 10) errors.push(`${where}: missing/short question`);
  if (!Array.isArray(q.options) || q.options.length < 3) errors.push(`${where}: needs >=3 options`);
  if (q.options.some(o => !o.text || !o.label)) errors.push(`${where}: option missing label/text`);
  // correct answer present + references valid labels
  const labels = q.options.map(o => o.label);
  const a = q.correct_answer;
  let okAnswer = false;
  if (typeof a === 'string' && /^[A-H]$/.test(a)) okAnswer = labels.includes(a);
  else if (Array.isArray(a)) okAnswer = a.length > 0 && a.every(x => labels.includes(x));
  else if (typeof a === 'string' && a.includes('-')) okAnswer = /\d+-[A-H]/.test(a); // matching
  else if (typeof a === 'string' && a.includes(',')) okAnswer = a.split(',').every(x => labels.includes(x.trim())); // sequence
  if (!okAnswer) errors.push(`${where}: invalid/missing correct_answer (${JSON.stringify(a)})`);
  if (!q.explanation || !q.explanation.why_correct) errors.push(`${where}: missing why_correct`);
  const ww = q.explanation && q.explanation.why_others_are_wrong;
  if (!ww || typeof ww !== 'object') errors.push(`${where}: missing why_others_are_wrong`);
  else if (q.question_type === 'single_best_answer' || q.question_type === 'scenario_based') {
    // every non-correct option should have an explanation
    const wrong = labels.filter(l => l !== a);
    for (const w of wrong) if (!ww[w]) errors.push(`${where}: missing wrong-explanation for ${w}`);
  }
  if (!q.source_reference || !q.source_reference.syllabus_section) errors.push(`${where}: missing syllabus_section`);
  if (!(q.difficulty in diffTally)) errors.push(`${where}: bad difficulty ${q.difficulty}`);
  else diffTally[q.difficulty]++;
  typeTally[q.question_type] = (typeTally[q.question_type] || 0) + 1;
});

if (questions.length !== 160) errors.push(`expected 160 questions, got ${questions.length}`);

const output = {
  meta: {
    domain_number: 1,
    domain: 'Security and Risk Management',
    weight_percent: 16,
    total_questions: questions.length,
    generated_by: 'scripts/d1/build.cjs',
    schema: '04_schemas/question_schema.md',
    sources: ['/content/cissp-syllabus.md', '/content/cissp-syllabus-structured.json', '/questions/domain-weighting.json'],
    id_range: `CISSP-D01-Q0001..CISSP-D01-Q${String(questions.length).padStart(4, '0')}`,
    difficulty_distribution: diffTally,
    question_type_distribution: typeTally,
    note: 'Original CISSP-style practice questions. matching questions carry a prompts[] (left items numbered 1..n) and options[] (right items A..n); correct_answer encodes the pairing. sequence_ordering correct_answer lists option labels in correct order.',
  },
  questions,
};

fs.mkdirSync(path.join(ROOT, 'questions'), { recursive: true });
fs.writeFileSync(
  path.join(ROOT, 'questions/domain-01-security-risk-management.json'),
  JSON.stringify(output, null, 2) + '\n',
  'utf8'
);

console.log('Questions:', questions.length);
console.log('Difficulty:', JSON.stringify(diffTally), '(target e32/m80/h48)');
console.log('Types:', JSON.stringify(typeTally));
console.log('Errors:', errors.length);
errors.slice(0, 40).forEach(e => console.log('  !', e));
if (errors.length) process.exit(1);
console.log('OK — wrote questions/domain-01-security-risk-management.json');
