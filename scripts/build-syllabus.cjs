/*
 * Phase A — CISSP syllabus extraction
 * Source : scripts/_work/syllabus-raw.txt  (text extracted from the Dion
 *          Training "ISC2 CISSP (Study Guide)" PDF)
 * Output : content/cissp-syllabus.md
 *          content/cissp-syllabus-structured.json
 *
 * Structure preserved: domains -> domain weights -> modules -> objectives
 * -> sections -> subtopics -> bullet points. Hierarchy below the module /
 * objective level is reconstructed from the PDF's indentation. The PDF
 * resets indentation at every page break, so deep nesting is best-effort;
 * no content text is dropped or reordered.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const RAW = fs.readFileSync(path.join(ROOT, 'scripts/_work/syllabus-raw.txt'), 'utf8');
const physical = RAW.split('\n');

// --------------------------------------------------------------------------
// Domain table (names + weights are verbatim from the PDF "CISSP Knowledge
// Domains" page). Modules are grouped under domains positionally, because the
// guide presents its modules strictly in domain order.
// --------------------------------------------------------------------------
const DOMAINS = [
  { number: 1, name: 'Security and Risk Management',            weight: 16, moduleRange: [1, 4]  },
  { number: 2, name: 'Asset Security',                          weight: 10, moduleRange: [5, 6]  },
  { number: 3, name: 'Security Architecture and Engineering',   weight: 13, moduleRange: [7, 10] },
  { number: 4, name: 'Communication and Network Security',      weight: 13, moduleRange: [11, 14]},
  { number: 5, name: 'Identity and Access Management (IAM)',    weight: 13, moduleRange: [15, 17]},
  { number: 6, name: 'Security Assessment and Testing',         weight: 12, moduleRange: [18, 19]},
  { number: 7, name: 'Security Operations',                     weight: 13, moduleRange: [20, 23]},
  { number: 8, name: 'Software Development Security',            weight: 10, moduleRange: [24, 25]},
];

// --------------------------------------------------------------------------
// helpers
// --------------------------------------------------------------------------
const stripCR = s => s.replace(/\r/g, '');
const isFurniture = t => (
  t === '' ||
  /^\d{1,3}$/.test(t) ||
  /DionTraining\.com/i.test(t) ||
  /^ISC2 CISSP(\s*\(Study Guide\))?$/.test(t) ||
  /^\(Study Guide\)$/.test(t) ||
  /^Study Guide$/.test(t)
);
// U+FFFD stands in for a few glyphs the extractor lost. Disambiguate by
// context: after CISSP/ISC2 it is the ® mark; flanked by spaces it is an en
// dash; otherwise drop it.
function fixGlyphs(s) {
  return s
    .replace(/(CISSP|ISC2)\s*�/g, '$1®')
    .replace(/\s�\s/g, ' – ')
    .replace(/�/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
const clean = s => stripCR(s).replace(/\f/g, '').trim();
const isCodeLine = s => /^\d+\.\d+\s*[-–�]/.test(s);

// --------------------------------------------------------------------------
// logical lines: drop furniture, merge wrapped (lowercase-leading) lines
// --------------------------------------------------------------------------
function buildLogical(start, end) {
  const out = [];
  for (let i = start; i < end; i++) {
    const cc = stripCR(physical[i]).replace(/\f/g, '');
    const t = cc.trim();
    if (isFurniture(t)) continue;
    const indent = cc.match(/^( *)/)[1].length;
    const cont = out.length > 0 && /^[a-z(",'’�–-]/.test(t);
    if (cont) out[out.length - 1].raw += ' ' + t;
    else out.push({ indent, raw: t });
  }
  for (const o of out) o.text = fixGlyphs(o.raw);
  return out;
}

// --------------------------------------------------------------------------
// locate the 25 modules (each opens with an "Objectives:" label + code list)
// --------------------------------------------------------------------------
function findModules() {
  const mods = [];
  for (let i = 0; i < physical.length; i++) {
    if (!/^\s*Objectives:?\s*$/.test(stripCR(physical[i]))) continue;
    const codes = [];
    let j = i + 1;
    while (j < physical.length) {
      const c = clean(physical[j]);
      if (c === '') { j++; continue; }
      if (isCodeLine(c)) { codes.push(c.match(/^(\d+\.\d+)/)[1]); j++; continue; }
      if (/^(E\.g\.)/.test(c) || (codes.length && /^[a-z]/.test(c))) { j++; continue; }
      break;
    }
    const contentStart = j;                 // first real content line
    // title: nearest non-furniture line above the "Objectives:" label
    let title = '';
    for (let k = i - 1; k >= 0 && k > i - 12; k--) {
      const tc = clean(physical[k]);
      if (isFurniture(tc)) continue;
      title = fixGlyphs(tc); break;
    }
    mods.push({ objLine: i, contentStart, codes, title });
  }
  for (let k = 0; k < mods.length; k++) {
    mods[k].end = (k + 1 < mods.length) ? mods[k + 1].objLine : physical.length;
  }
  return mods;
}

// --------------------------------------------------------------------------
// canonical objective descriptions (joined across wraps), keyed by code
// --------------------------------------------------------------------------
function collectObjectives() {
  const map = {};
  for (let i = 0; i < physical.length; i++) {
    const c = clean(physical[i]);
    let m = c.match(/^(\d+\.\d+)\s*[-–�]\s*(.+)$/) ||
            c.match(/^Objective\s+(\d+\.\d+)\s*:\s*(.+)$/);
    if (!m) continue;
    const code = m[1];
    let desc = m[2];
    // join wrapped continuation lines (indented / lowercase-leading)
    let j = i + 1;
    while (j < physical.length) {
      const n = clean(physical[j]);
      if (isFurniture(n)) { j++; continue; }
      if (/^[a-z(]/.test(n) || /^i\.e\.|^e\.g\./i.test(n)) { desc += ' ' + n; j++; continue; }
      break;
    }
    desc = fixGlyphs(desc);
    if (!map[code] || desc.length > map[code].length) map[code] = desc;
  }
  return map;
}

// --------------------------------------------------------------------------
// nested content tree from indentation (tolerant stack)
// --------------------------------------------------------------------------
// maxDepth caps how deep the tree can nest. Beyond it, deeper lines are kept
// as flat siblings of the deepest allowed node — this both avoids degenerate
// thousand-deep chains (PDF paragraphs whose wrapped lines drift rightward)
// and matches the real section -> subtopic -> bullet depth of the guide.
function buildTree(logical, maxDepth = 6) {
  const root = { children: [] };
  const stack = [root];
  const indents = [-1];            // indent per stack level (kept off the nodes)
  for (const line of logical) {
    while (stack.length > 1 && line.indent <= indents[indents.length - 1]) {
      stack.pop(); indents.pop();
    }
    const node = { text: line.text, children: [] };
    stack[stack.length - 1].children.push(node);
    if (stack.length <= maxDepth) { stack.push(node); indents.push(line.indent); }
  }
  return root.children;
}

// --------------------------------------------------------------------------
// assemble model
// --------------------------------------------------------------------------
const modules = findModules();
const objMap = collectObjectives();

function moduleContent(m) {
  const logical = buildLogical(m.contentStart, m.end);
  return buildTree(logical);
}

const model = {
  meta: {
    title: 'ISC2 CISSP — Study Guide Syllabus',
    source: 'Dion Training "ISC2 CISSP (Study Guide)" PDF',
    sourceFile: 'scripts/_work/syllabus-raw.txt',
    generatedBy: 'scripts/build-syllabus.cjs (Phase A)',
    examFormat: 'Computer Adaptive Test (CAT), 100–150 questions, 4 hours',
    totalDomains: 8,
    totalModules: modules.length,
    totalObjectivesCoded: Object.keys(objMap).length,
    notes: [
      'Domain names and weights are verbatim from the PDF "CISSP Knowledge Domains" page.',
      'Modules are grouped under domains in the order the study guide presents them.',
      'Section/subtopic/bullet nesting is reconstructed from PDF indentation, which resets at page breaks; nesting is best-effort while all content text is preserved in order.',
      'Objective 1.8 (personnel security policies) is covered in the Module 1 narrative but is not assigned an explicit objective code in the source PDF.',
    ],
  },
  domains: [],
};

let totalSections = 0, totalNodes = 0;
function countNodes(nodes) { for (const n of nodes) { totalNodes++; countNodes(n.children); } }

for (const d of DOMAINS) {
  const [lo, hi] = d.moduleRange;
  const domainModules = [];
  const objCodes = new Set();
  for (let mi = lo; mi <= hi; mi++) {
    const m = modules[mi - 1];
    const content = moduleContent(m);
    totalSections += content.length;
    countNodes(content);
    m.codes.forEach(c => objCodes.add(c));
    domainModules.push({
      module: mi,
      title: m.title,
      objectiveCodes: m.codes,
      sections: content,
    });
  }
  // objectives belonging to this domain number, in code order
  const domainObjectives = Object.keys(objMap)
    .filter(c => +c.split('.')[0] === d.number)
    .sort((a, b) => a.split('.').map(Number)[1] - b.split('.').map(Number)[1])
    .map(code => ({ code, description: objMap[code] }));
  model.domains.push({
    number: d.number,
    name: d.name,
    weight: d.weight,
    objectives: domainObjectives,
    modules: domainModules,
  });
}

// --------------------------------------------------------------------------
// emit JSON
// --------------------------------------------------------------------------
fs.mkdirSync(path.join(ROOT, 'content'), { recursive: true });
fs.writeFileSync(
  path.join(ROOT, 'content/cissp-syllabus-structured.json'),
  JSON.stringify(model, null, 2) + '\n',
  'utf8'
);

// --------------------------------------------------------------------------
// emit Markdown
// --------------------------------------------------------------------------
function renderNodes(nodes, depth, out) {
  // depth 0 = section (###), depth 1 = subtopic (bold), depth >=2 = bullets
  for (const n of nodes) {
    if (depth === 0) {
      out.push('', '#### ' + n.text, '');
      renderNodes(n.children, depth + 1, out);
    } else if (depth === 1) {
      out.push('- **' + n.text + '**');
      renderNodes(n.children, depth + 1, out);
    } else {
      out.push('  '.repeat(depth - 1) + '- ' + n.text);
      renderNodes(n.children, depth + 1, out);
    }
  }
}

const md = [];
md.push('# ' + model.meta.title);
md.push('');
md.push('> Source: ' + model.meta.source + '  ');
md.push('> Exam format: ' + model.meta.examFormat + '  ');
md.push('> Generated by `' + model.meta.generatedBy + '`');
md.push('');
md.push('## Domain Weights');
md.push('');
md.push('| # | Domain | Weight |');
md.push('|---|--------|--------|');
for (const d of model.domains) md.push(`| ${d.number} | ${d.name} | ${d.weight}% |`);
md.push(`| | **Total** | **${model.domains.reduce((s, d) => s + d.weight, 0)}%** |`);
md.push('');
md.push('---');

for (const d of model.domains) {
  md.push('');
  md.push(`## Domain ${d.number}: ${d.name} (${d.weight}%)`);
  md.push('');
  md.push('### Exam Objectives');
  md.push('');
  for (const o of d.objectives) md.push(`- **${o.code}** — ${o.description}`);
  md.push('');
  for (const mod of d.modules) {
    md.push(`### Module ${mod.module}: ${mod.title}`);
    md.push('');
    md.push('*Objectives covered: ' + (mod.objectiveCodes.join(', ') || '—') + '*');
    renderNodes(mod.sections, 0, md);
    md.push('');
  }
  md.push('---');
}

fs.writeFileSync(path.join(ROOT, 'content/cissp-syllabus.md'), md.join('\n') + '\n', 'utf8');

// --------------------------------------------------------------------------
// console summary
// --------------------------------------------------------------------------
console.log('Domains:', model.domains.length);
console.log('Modules:', modules.length);
console.log('Coded objectives:', Object.keys(objMap).length);
console.log('Top-level sections:', totalSections);
console.log('Total content nodes:', totalNodes);
console.log('Weight sum:', model.domains.reduce((s, d) => s + d.weight, 0));
