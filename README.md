# CISSP Practice Exam App

A self-contained study app with **1,000 original CISSP-style questions** across all **8 domains**,
organized into **10 full-length, exam-weighted practice tests** (100 questions each).

Built with **Next.js (App Router) + TypeScript**, exported as a static site. No backend, no account —
progress and results are saved in your browser's `localStorage`.

> Built from the CISSP Claude Code Build Pack. For study use only — these are original,
> CISSP-style questions and do not copy or reproduce real exam content. Not affiliated with ISC2.

## Features

- **Exam-weighted tests** — every test mirrors the official domain weights (16/10/13/13/13/12/13/10).
- **All CISSP question types** — single best answer, scenario, multiple-correct, matching, and
  sequence-ordering, each with full explanations of why every option is right or wrong.
- **Timer, question navigator, flagging**, and auto-saved progress (resume any test).
- **Scoring with per-domain breakdown** and a filterable answer review (incorrect / unanswered / all).
- The 10 tests **partition the full bank** — every question appears in exactly one test, no repeats.

## Project layout

```
content/                         # Phase A: extracted syllabus (md + structured json)
questions/
  domain-weighting.json          # Phase B: 1,000-question allocation + generation plan
  domain-01..08-*.json           # Phase C: per-domain question files (1,000 total)
  cissp-question-bank.json/.md   # Aggregation: merged bank (single source of truth)
tests/
  test-01..10.json               # 10 weighted tests (reference questions by ID)
  test-manifest.json
public/data/                     # app data (copied from questions/ + tests/ at build)
src/
  app/                           # Next.js App Router pages (home, /tests, /tests/[id], /results/[id])
  components/                    # QuestionCard, OptionSelector, TestTimer, QuestionNavigator,
                                 #   ScoreSummary, DomainBreakdown, ReviewPanel, TestRunner, ResultsView, TestsList
  lib/                           # loadQuestions, scoreTest, domainWeighting, localProgress, validation
  types/                         # question + test TypeScript types
scripts/                         # data prep, aggregation, and validation scripts
```

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000  (auto-copies data into public/data first)
```

### Production build (static export)

```bash
npm run build        # outputs a static site to ./out
npx serve out        # or any static server, served from the site root
```

> The app fetches its data from `/data/*.json` at the site root, so serve the exported `out/`
> directory from the domain root. If hosting under a sub-path, set `NEXT_PUBLIC_BASE_PATH`.

## Validate the content

```bash
npm run validate     # node scripts/validate-question-bank.cjs && node scripts/validate-tests.cjs
```

Checks: 1,000 questions, unique IDs, valid answers/explanations/topics, and that the 10 tests are
exam-weighted and partition the bank with no repeats.

## Regenerating data

```bash
node scripts/build-aggregate.cjs   # rebuild cissp-question-bank.json/.md + tests/ from per-domain files
node scripts/prepare-app-data.cjs  # copy data into public/data (also runs automatically on dev/build)
```

## License

This project uses a **split license**:

- **Application source code** (`src/`, `scripts/`, config) — **MIT** (see [`LICENSE`](LICENSE)).
- **Practice-question content** (`questions/`, `tests/`, the question bank) — **all rights reserved,
  personal study use only** (see [`CONTENT-LICENSE.md`](CONTENT-LICENSE.md)). Please don't
  redistribute, sell, or train models on the questions.

---

CISSP is a registered mark of ISC2. This project is an independent study aid and is not affiliated
with or endorsed by ISC2.
