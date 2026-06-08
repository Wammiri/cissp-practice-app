/*
 * Phase B — Domain weighting + question-generation plan
 * Source  : content/cissp-syllabus-structured.json (Phase A)
 * Output  : questions/domain-weighting.json
 *
 * Allocates exactly 1,000 questions across the 8 CISSP domains by the PDF's
 * published exam weights, then attaches a per-domain generation plan. All
 * sub-allocations (difficulty mix, question-type mix) use largest-remainder
 * rounding so every breakdown sums exactly to the domain's question count.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const syllabus = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'content/cissp-syllabus-structured.json'), 'utf8')
);

const TOTAL_QUESTIONS = 1000;

// --- largest-remainder allocation: split `total` by `weights` into integers ---
function allocate(total, weights) {
  const sum = weights.reduce((s, w) => s + w, 0);
  const exact = weights.map(w => (w / sum) * total);
  const floor = exact.map(Math.floor);
  let remainder = total - floor.reduce((s, n) => s + n, 0);
  const order = exact
    .map((v, i) => ({ i, frac: v - Math.floor(v) }))
    .sort((a, b) => b.frac - a.frac);
  for (let k = 0; k < remainder; k++) floor[order[k].i]++;
  return floor;
}

// --------------------------------------------------------------------------
// Per-domain plan inputs. `weight` is verbatim from the PDF. major_topics,
// scenario_heavy_areas and avoid_overfocus are curated from the actual
// section headings extracted in Phase A (not invented). difficulty_split and
// type_split are percentages; they are converted to exact integer counts.
// --------------------------------------------------------------------------
const PLAN = {
  1: {
    output_file: 'questions/domain-01-security-risk-management.json',
    difficulty_split: { easy: 20, medium: 50, hard: 30 },
    type_split: { single_best_answer: 70, scenario_based: 18, multiple_correct_answers: 8, matching: 2, sequence_ordering: 2 },
    major_topics: [
      'ISC2 Code of Ethics and professional ethics',
      'CIA triad, authenticity, and non-repudiation',
      'Security governance, roles, and responsibilities (data owner/controller/processor)',
      'Security awareness, training, and education program',
      'Social engineering tactics and defenses',
      'Personnel security across the employment lifecycle (hiring, NDAs, onboarding, offboarding)',
      'Legal/regulatory/compliance (GDPR, SOX, GLBA, HIPAA, CFAA, due care vs due diligence)',
      'Intellectual property, licensing, and import/export controls',
      'Risk management concepts (risk identification, response, monitoring, risk maturity)',
      'Quantitative vs qualitative risk assessment (ALE/SLE/ARO)',
      'Threat modeling methodologies (STRIDE, DREAD, PASTA)',
      'Supply chain risk management',
      'Security policies, standards, procedures, and guidelines',
    ],
    scenario_heavy_areas: [
      'Choosing the appropriate risk response (accept/mitigate/transfer/avoid) for a business situation',
      'Applying due care/due diligence to a governance decision',
      'Selecting which law/regulation applies to a cross-border data scenario',
      'Responding to a social engineering attempt',
    ],
    avoid_overfocus: [
      'Memorizing specific law enactment years (e.g., Privacy Act 1974, SOX dates)',
      'Niche regional regulations over the core GDPR/SOX/GLBA/HIPAA set',
      'Rote acronym expansion without applied reasoning',
    ],
  },
  2: {
    output_file: 'questions/domain-02-asset-security.json',
    difficulty_split: { easy: 25, medium: 50, hard: 25 },
    type_split: { single_best_answer: 74, scenario_based: 14, multiple_correct_answers: 8, matching: 3, sequence_ordering: 1 },
    major_topics: [
      'Information and asset classification and categorization',
      'Classification levels and asset classification tiers',
      'Data roles and responsibilities (owner, controller, processor, custodian, steward, user)',
      'Information and asset handling requirements and marking/labeling',
      'Data lifecycle management (create, store, use, share, archive, destroy)',
      'Data states: at rest, in transit, in use',
      'Asset and data retention requirements and policies',
      'Determining data security controls (scoping, tailoring, baselines)',
      'Security control frameworks (NIST, ISO 27001, COBIT)',
      'Data protection methods (DRM, DLP, CASB)',
      'Information system lifecycle and secure provisioning/disposal',
    ],
    scenario_heavy_areas: [
      'Assigning the correct data role/responsibility in an org chart scenario',
      'Selecting handling and retention controls for a given classification level',
      'Choosing protection (DLP/DRM/CASB) for a specific data-state risk',
    ],
    avoid_overfocus: [
      'Vendor-specific DLP/CASB product names',
      'Exhaustive COBIT principle enumeration over applied control selection',
      'Over-indexing on government classification labels vs commercial tiers',
    ],
  },
  3: {
    output_file: 'questions/domain-03-security-architecture-engineering.json',
    difficulty_split: { easy: 18, medium: 47, hard: 35 },
    type_split: { single_best_answer: 70, scenario_based: 16, multiple_correct_answers: 9, matching: 3, sequence_ordering: 2 },
    major_topics: [
      'Secure design principles (least privilege, defense in depth, fail-secure, secure defaults)',
      'Zero Trust Architecture (NIST SP 800-207) and shared responsibility model',
      'Privacy by design',
      'Security models (Bell-LaPadula, Biba, Clark-Wilson, Brewer-Nash, Graham-Denning)',
      'Reference monitor, security kernel, trusted computing base, TPM',
      'Security capabilities of information systems',
      'Virtualization, hypervisors, and containerization security',
      'Cloud service/deployment models (IaaS/PaaS/SaaS/SECaaS) and VPCs/serverless',
      'Cryptographic solutions and key management (objective 3.6)',
      'Cryptanalytic attacks (brute force, side-channel, birthday, replay)',
      'Site and facility design and physical security controls',
      'Information system lifecycle management',
    ],
    scenario_heavy_areas: [
      'Selecting the security model that enforces a stated confidentiality/integrity policy',
      'Choosing a cloud service model and the resulting shared-responsibility split',
      'Identifying the cryptanalytic attack from described adversary behavior',
      'Designing physical controls for a facility threat scenario',
    ],
    avoid_overfocus: [
      'Obscure historical security models with no exam relevance',
      'Deep math of specific cipher internals beyond applied selection',
      'Vendor-specific hypervisor/container product trivia',
    ],
  },
  4: {
    output_file: 'questions/domain-04-communication-network-security.json',
    difficulty_split: { easy: 20, medium: 50, hard: 30 },
    type_split: { single_best_answer: 72, scenario_based: 14, multiple_correct_answers: 9, matching: 3, sequence_ordering: 2 },
    major_topics: [
      'OSI and TCP/IP models, encapsulation, and PDUs',
      'IP addressing, subnetting, RFC 1918 private ranges, IPv4 vs IPv6',
      'TCP three-way handshake and transport-layer behavior',
      'Protocols by OSI layer (application down to data link)',
      'Routing protocols and types (static/dynamic, distance-vector/link-state)',
      'Network components (switch, router, gateway, proxy, firewall types)',
      'Network infrastructure operations (UPS, generators, vendor support/EOS)',
      'Transmission media (copper, twisted pair categories, fiber)',
      'Secure communication channels (VPN, IPsec, TLS, secure protocols)',
      'Network monitoring protocols and tooling',
      'Wireless networking and security',
    ],
    scenario_heavy_areas: [
      'Selecting the correct secure protocol/channel for a communication requirement',
      'Diagnosing the OSI layer where a described problem occurs',
      'Choosing network segmentation/firewall placement for a topology',
    ],
    avoid_overfocus: [
      'Exhaustive cable category specs (Cat5/6/7 distances)',
      'Vendor-specific networking hardware models',
      'Rote port-number memorization without context',
    ],
  },
  5: {
    output_file: 'questions/domain-05-identity-access-management.json',
    difficulty_split: { easy: 20, medium: 52, hard: 28 },
    type_split: { single_best_answer: 72, scenario_based: 16, multiple_correct_answers: 7, matching: 3, sequence_ordering: 2 },
    major_topics: [
      'Identification, identity proofing, and assurance levels',
      'Authentication factors (knowledge, possession, inherence) and MFA',
      'Biometric authentication, error rates (FAR/FRR/CER)',
      'Authentication systems (LDAP, Kerberos, RADIUS/TACACS+)',
      'Single Sign-On, OAuth, OpenID Connect, SAML/SPML',
      'Federated identity management',
      'Access control models (DAC, MAC, RBAC, ABAC, rule-based, risk-based)',
      'Authorization mechanisms and least-privilege enforcement',
      'Identity and access provisioning lifecycle (provisioning, review, deprovisioning)',
      'Privileged Access Management (PAM) and Just-In-Time access',
      'Accountability, logging, and credential management systems',
    ],
    scenario_heavy_areas: [
      'Selecting the access control model that fits an org policy requirement',
      'Choosing the right SSO/federation protocol for an integration scenario',
      'Designing the provisioning/deprovisioning flow for joiner-mover-leaver',
      'Interpreting Kerberos ticket flow when authentication fails',
    ],
    avoid_overfocus: [
      'Vendor-specific IAM/PAM product features',
      'Deep SAML XML binding syntax over conceptual flow',
      'Over-weighting biometric math vs applied selection',
    ],
  },
  6: {
    output_file: 'questions/domain-06-security-assessment-testing.json',
    difficulty_split: { easy: 22, medium: 50, hard: 28 },
    type_split: { single_best_answer: 73, scenario_based: 15, multiple_correct_answers: 8, matching: 2, sequence_ordering: 2 },
    major_topics: [
      'Assessment, test, and audit strategies (internal, external, third-party)',
      'Security control testing approaches',
      'Vulnerability assessment and scanning (SCAP, CVE/CVSS, scan types)',
      'Penetration testing phases and team types (red/blue/purple/white)',
      'Breach and Attack Simulation (BAS)',
      'Log reviews, log protection, and SIEM',
      'Synthetic transactions and real user monitoring',
      'Software testing methods (static/dynamic, code review, misuse, interface testing)',
      'Test coverage analysis (statement, branch, condition, loop coverage)',
      'Collecting security process data (account management, training, DR/BC data)',
      'Analyzing test output and reporting (executive summary, remediation, disclosure)',
      'Security audits (SOC 1/2/3, internal vs external)',
    ],
    scenario_heavy_areas: [
      'Choosing the assessment/test type for a stated assurance objective',
      'Selecting the appropriate pen-test team color/approach for an engagement',
      'Interpreting scan/test output to prioritize remediation',
    ],
    avoid_overfocus: [
      'Vendor-specific scanner/SIEM product trivia',
      'Exhaustive coverage-metric math over conceptual purpose',
      'Memorizing every SCAP component acronym in isolation',
    ],
  },
  7: {
    output_file: 'questions/domain-07-security-operations.json',
    difficulty_split: { easy: 18, medium: 50, hard: 32 },
    type_split: { single_best_answer: 68, scenario_based: 20, multiple_correct_answers: 7, matching: 2, sequence_ordering: 3 },
    major_topics: [
      'Foundational operations concepts (separation of duties, least privilege, job rotation)',
      'Logging and monitoring (SIEM, continuous monitoring, egress/ingress)',
      'Detective and preventative measures (IDS/IPS, whitelisting/blacklisting, sandboxing, honeypots)',
      'Malware types and anti-malware defenses',
      'Configuration and change management',
      'Patch and vulnerability management',
      'Incident management lifecycle (detection, response, mitigation, recovery, lessons learned)',
      'Investigations and digital forensics, evidence handling, chain of custody',
      'Resource protection and media management',
      'Recovery strategies (backups, RAID, redundancy, sites)',
      'Disaster recovery (DR) processes and testing',
      'Business Continuity (BC) planning and exercises',
      'Physical security operations',
    ],
    scenario_heavy_areas: [
      'Ordering the correct incident response steps for an active incident',
      'Choosing the recovery/backup strategy that meets a stated RTO/RPO',
      'Selecting the DR test type appropriate to risk tolerance',
      'Applying evidence-handling/forensic procedure in an investigation',
    ],
    avoid_overfocus: [
      'Vendor-specific IDS/IPS/SIEM products',
      'Exhaustive malware taxonomy over response decisions',
      'AI/ML novelty topics beyond their operational risk relevance',
    ],
  },
  8: {
    output_file: 'questions/domain-08-software-development-security.json',
    difficulty_split: { easy: 20, medium: 50, hard: 30 },
    type_split: { single_best_answer: 70, scenario_based: 17, multiple_correct_answers: 8, matching: 3, sequence_ordering: 2 },
    major_topics: [
      'Secure SDLC and integrating security into each phase',
      'Development methodologies (Waterfall, Agile/Scrum, RAD, JAD, Spiral)',
      'DevOps and DevSecOps, CI/CD pipeline security',
      'Software maturity models (CMMI, SAMM)',
      'Software operations and maintenance, regression testing, continuous monitoring',
      'Code repositories and source control security (Git)',
      'Application security controls in development ecosystems',
      'Application attacks and OWASP Top 10',
      'API security',
      'Programming language concepts (compiled vs interpreted, generations, libraries, SDK, runtime)',
      'Application security testing (SAST, DAST, IAST, fuzzing, ASVS levels)',
      'Assessing acquired/third-party software security',
      'Secure coding guidelines and standards',
    ],
    scenario_heavy_areas: [
      'Selecting where in the SDLC a control should be applied',
      'Identifying the OWASP vulnerability from described application behavior',
      'Choosing the right application security test (SAST/DAST/IAST/fuzz) for a goal',
      'Evaluating security risk of acquired/third-party software',
    ],
    avoid_overfocus: [
      'Language-specific syntax trivia',
      'Vendor-specific CI/CD tool features',
      'Exhaustive Agile ceremony enumeration over security integration',
    ],
  },
};

// --------------------------------------------------------------------------
// build
// --------------------------------------------------------------------------
const domainsMeta = syllabus.domains.map(d => ({
  number: d.number, name: d.name, weight: d.weight,
  objective_codes: d.objectives.map(o => o.code),
  module_titles: d.modules.map(m => m.title),
}));

const weights = domainsMeta.map(d => d.weight);
const counts = allocate(TOTAL_QUESTIONS, weights);

function splitCounts(total, splitObj) {
  const keys = Object.keys(splitObj);
  const alloc = allocate(total, keys.map(k => splitObj[k]));
  const out = {};
  keys.forEach((k, i) => { out[k] = alloc[i]; });
  return out;
}

const domains = domainsMeta.map((d, idx) => {
  const count = counts[idx];
  const p = PLAN[d.number];
  return {
    domain_number: d.number,
    domain: d.name,
    weight_percent: d.weight,
    question_count: count,
    output_file: p.output_file,
    objective_codes: d.objective_codes,
    source_modules: d.module_titles,
    difficulty_mix: {
      target_percent: p.difficulty_split,
      counts: splitCounts(count, p.difficulty_split),
    },
    question_type_mix: {
      target_percent: p.type_split,
      counts: splitCounts(count, p.type_split),
    },
    major_topics: p.major_topics,
    scenario_heavy_areas: p.scenario_heavy_areas,
    avoid_overfocus: p.avoid_overfocus,
  };
});

const sumWeights = domains.reduce((s, d) => s + d.weight_percent, 0);
const sumCounts = domains.reduce((s, d) => s + d.question_count, 0);

const output = {
  meta: {
    title: 'CISSP Question Bank — Domain Weighting & Generation Plan',
    phase: 'B',
    generated_by: 'scripts/build-domain-weighting.cjs',
    source_weights: 'content/cissp-syllabus-structured.json (verbatim from Dion Training CISSP Study Guide PDF)',
    syllabus_markdown: 'content/cissp-syllabus.md',
    total_questions: TOTAL_QUESTIONS,
    allocation_method: 'Largest-remainder rounding by exam weight; sub-mixes likewise sum exactly to each domain count.',
    question_schema: '04_schemas/question_schema.md',
    allowed_question_types: ['single_best_answer', 'multiple_correct_answers', 'scenario_based', 'sequence_ordering', 'matching'],
    difficulty_levels: ['easy', 'medium', 'hard'],
    global_guidance: [
      'Most questions are single_best_answer; scenario_based questions carry the managerial "think like a manager" emphasis CISSP is known for.',
      'Anchor every question to a real syllabus section via source_reference.syllabus_section.',
      'Write original questions; do not copy exam content. Each option needs a distinct, plausible distractor.',
      'Provide why_correct and why_others_are_wrong for every question per the schema.',
      'Cover the listed major_topics broadly before adding depth; respect avoid_overfocus to prevent skew toward low-yield trivia.',
    ],
    validation: {
      weights_sum_percent: sumWeights,
      question_counts_sum: sumCounts,
      every_domain_has_count: domains.every(d => d.question_count > 0),
    },
  },
  domains,
};

fs.mkdirSync(path.join(ROOT, 'questions'), { recursive: true });
fs.writeFileSync(
  path.join(ROOT, 'questions/domain-weighting.json'),
  JSON.stringify(output, null, 2) + '\n',
  'utf8'
);

// console summary
console.log('Weights sum:', sumWeights);
console.log('Question counts sum:', sumCounts);
domains.forEach(d => {
  const dm = d.difficulty_mix.counts, tm = d.question_type_mix.counts;
  const dsum = Object.values(dm).reduce((s, n) => s + n, 0);
  const tsum = Object.values(tm).reduce((s, n) => s + n, 0);
  console.log(
    `D${d.domain_number} ${String(d.weight_percent + '%').padStart(3)} -> ${String(d.question_count).padStart(4)} | ` +
    `diff[e${dm.easy}/m${dm.medium}/h${dm.hard}=${dsum}] type[sum=${tsum}]`
  );
});
