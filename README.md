# CISSP Practice Exam App

A study app with **1,000 original CISSP-style questions** across all **8 domains**, arranged as **10 exam-weighted practice tests** of 100 questions each.

**Use it:** <https://cissp-practice-app.vercel.app>

It is a static site with no accounts and no backend. Progress and results are saved in your browser.

> For study only. The questions are original and do not reproduce real exam content. This project is not affiliated with ISC2.

## Features

- **Exam-weighted tests.** Every test follows the same domain split (16/10/13/13/13/12/13/10).
- **Several question types.** Single best answer, scenario, multiple correct, matching and sequence ordering.
- **Full explanations** of why each option is right or wrong.
- **Timer, question navigator, flagging and auto-saved progress.** Resume any test.
- **Scoring by domain** and an answer review you can filter (incorrect, unanswered, all).
- **No repeats.** The 10 tests split the bank, so each question appears in exactly one test.

## Stack

Next.js 14 (App Router), React 18 and TypeScript, exported as a static site and hosted on Vercel.

## Run it locally

Needs Node.js 18.17 or later.

```bash
git clone https://github.com/Wammiri/cissp-practice-app.git
cd cissp-practice-app
npm ci
npm run dev          # http://localhost:3000
```

No environment variables are needed. If you host the site under a sub-path, set `NEXT_PUBLIC_BASE_PATH`.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Copies the question data, then starts the dev server |
| `npm run build` | Copies the data, then exports the static site to `out/` |
| `npm run validate` | Checks the question bank and the tests |
| `npm run prepare:data` | Copies `questions/` and `tests/` into `public/data/` |

To preview the export, run `npx serve out`. The app reads `/data/*.json` from the site root.

`npm run validate` checks that there are 1,000 questions with unique IDs and valid answers, explanations and topics, and that the 10 tests are exam-weighted and never repeat a question.

## Changing the questions

Edit the domain files in `questions/`, then rebuild the bank and the tests:

```bash
node scripts/build-aggregate.cjs
npm run validate
```

## Project structure

```text
questions/     one file per domain, plus the merged bank and the domain weighting
tests/         the 10 tests, which point to questions by ID
src/app/       pages: home, tests, a single test, results
src/components/ question cards, timer, navigator, score and review
src/lib/       loading, scoring and saved progress
scripts/       data preparation, aggregation and validation
01_start_here/ to 09_notes/   the build pack: prompts, schemas and requirements used to make the app
```

## Licence

A split licence:

- **Application code** (`src/`, `scripts/`, config): MIT. See [LICENSE](LICENSE).
- **Questions and tests** (`questions/`, `tests/`): all rights reserved, personal study use only. See [CONTENT-LICENSE.md](CONTENT-LICENSE.md). Please do not redistribute them, sell them or train models on them.

CISSP is a registered mark of ISC2. This is an independent study aid, not endorsed by ISC2.

## Author

[Isaac Olorode](https://isaac.aperio.finance)
