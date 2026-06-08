# Starting Prompt for Claude Code

You are Claude Code acting as a senior curriculum engineer, cybersecurity exam-question designer, and full-stack product builder.

I have provided a CISSP syllabus / exam outline PDF in the source files folder.

Your job is to complete the full workflow below without asking me to manually structure anything.

Do not rush. Depth, coverage, accuracy, and exam realism matter more than speed.

## End goal

Create a complete CISSP-style practice test system from the attached PDF.

The final system must include:

1. A clean markdown version of the PDF syllabus
2. A structured JSON version of the syllabus
3. A 1,000-question original CISSP-style practice question bank
4. Detailed explanations for every answer option
5. Ten weighted practice tests with 100 questions each
6. A React or Next.js web app for taking the tests
7. Validation scripts
8. A clear README explaining how to run everything

## Source PDF

Use the CISSP syllabus PDF inside:

```text
02_source_files/
```

Treat the PDF as the source of truth for topic coverage.

First, read the PDF carefully.

Then convert the PDF into markdown and structured JSON before generating any questions.

## Critical content rule

Do not create or copy real CISSP exam questions.

Create original CISSP-style practice questions that are:

- Exam-like
- Scenario-based where appropriate
- Mapped to the syllabus
- Focused on judgment, risk, governance, and practical security reasoning
- Clear enough for computer-based testing

## Workflow

Complete the workflow in this exact order:

1. Read the PDF
2. Convert the PDF into markdown
3. Convert the markdown into structured JSON
4. Build a domain and topic map
5. Determine domain weighting
6. Assign question counts by domain
7. Generate original CISSP-style questions per domain
8. Validate question quality
9. Aggregate all questions into one question bank
10. Split the bank into ten 100-question weighted practice tests
11. Build the web app
12. Add validation scripts
13. Add documentation
14. Run validation checks
15. Report what was created

## Required output files

Create this structure:

```text
/content
  cissp-syllabus.md
  cissp-syllabus-structured.json
  domain-topic-map.json

/questions
  domain-weighting.json
  domain-01-security-risk-management.json
  domain-02-asset-security.json
  domain-03-security-architecture-engineering.json
  domain-04-communication-network-security.json
  domain-05-identity-access-management.json
  domain-06-security-assessment-testing.json
  domain-07-security-operations.json
  domain-08-software-development-security.json
  cissp-question-bank.json
  cissp-question-bank.md

/tests
  test-01.json
  test-02.json
  test-03.json
  test-04.json
  test-05.json
  test-06.json
  test-07.json
  test-08.json
  test-09.json
  test-10.json
  test-manifest.json

/src
  /app
  /components
  /lib
  /types

/scripts
  validate-question-bank.ts
  validate-tests.ts

README.md
package.json
tsconfig.json
next.config.js
```

Adjust file names only if the PDF uses different CISSP domain names.

## Syllabus conversion requirements

Create:

```text
/content/cissp-syllabus.md
```

The markdown must preserve:

- Domains
- Sections
- Subsections
- Topic hierarchy
- Bullet points
- Numbering
- Knowledge areas

Also create:

```text
/content/cissp-syllabus-structured.json
```

Each structured item should include:

- Domain name
- Domain number
- Domain weight if available
- Section
- Subsection
- Topic
- Subtopic
- Key knowledge statements
- Source page or reference where possible

## Domain weighting

Use official CISSP domain weighting if available inside the PDF.

If not available in the PDF, verify current CISSP domain weighting from a reliable source before assigning question counts.

Create:

```text
/questions/domain-weighting.json
```

It must show:

- Domain name
- Weight
- Question count
- Rounding logic
- Total question count equals exactly 1,000

## Question-generation requirements

Generate exactly 1,000 questions.

Questions should be distributed by CISSP domain weight.

Each domain file should contain only questions for that domain.

Each question must follow this JSON structure:

```json
{
  "id": "CISSP-D01-Q0001",
  "domain": "Security and Risk Management",
  "domain_number": 1,
  "topic": "Risk Management",
  "subtopic": "Risk Response",
  "difficulty": "medium",
  "question_type": "single_best_answer",
  "question": "Question text goes here.",
  "options": [
    { "label": "A", "text": "Option A" },
    { "label": "B", "text": "Option B" },
    { "label": "C", "text": "Option C" },
    { "label": "D", "text": "Option D" }
  ],
  "correct_answer": "C",
  "explanation": {
    "why_correct": "Explain why the correct answer is correct.",
    "why_others_are_wrong": {
      "A": "Explain why A is wrong.",
      "B": "Explain why B is wrong.",
      "D": "Explain why D is wrong."
    }
  },
  "exam_reasoning": "Explain what CISSP-style reasoning this question tests.",
  "source_reference": {
    "syllabus_section": "Domain > Section > Topic",
    "source_file": "/content/cissp-syllabus.md"
  }
}
```

## Question style

Most questions should be single-best-answer multiple choice.

Use multiple-correct-answer questions only when appropriate.

Questions should test:

- Security governance
- Risk judgment
- Management-level decision-making
- Technical understanding
- Practical security trade-offs
- Correct prioritization
- Policy, process, and control logic

Avoid:

- Trivia-only questions
- Obvious questions
- Duplicate questions
- Vendor-specific questions unless justified by the syllabus
- Real CISSP exam questions
- Claims that these are official CISSP questions

## Difficulty target

Use this approximate distribution:

```text
Easy: 20%
Medium: 50%
Hard: 30%
```

## Question-bank aggregation

After generating domain-level files, aggregate everything into:

```text
/questions/cissp-question-bank.json
/questions/cissp-question-bank.md
```

The JSON file must contain exactly 1,000 questions.

The markdown file must be human-readable and organized by domain.

## Practice-test generation

Create ten tests:

```text
/tests/test-01.json
/tests/test-02.json
/tests/test-03.json
/tests/test-04.json
/tests/test-05.json
/tests/test-06.json
/tests/test-07.json
/tests/test-08.json
/tests/test-09.json
/tests/test-10.json
```

Each test must contain exactly 100 questions.

Each test should follow CISSP domain weighting.

No question should appear in more than one test.

Create:

```text
/tests/test-manifest.json
```

The manifest must show:

- Test number
- Total questions
- Domain distribution
- Difficulty distribution
- Question IDs included

## Web app requirements

Build a simple web app using Next.js and TypeScript unless React is clearly simpler.

The app should support:

1. Home page
2. Test selection page
3. Test-taking page
4. One-question-at-a-time view
5. Previous and next navigation
6. Answer selection
7. Flag for review
8. Timer
9. Submit test
10. Score page
11. Review page
12. Explanation display after submission
13. Domain-level performance breakdown
14. Difficulty-level performance breakdown
15. Local progress persistence using LocalStorage

Before submission:

- Do not reveal correct answers
- Do not reveal explanations
- Allow changing answers
- Allow navigation across questions
- Allow flagging questions

After submission:

- Show total score
- Show percentage score
- Show correct and incorrect count
- Show domain breakdown
- Show explanations
- Show why each wrong answer is wrong

## Validation scripts

Create:

```text
/scripts/validate-question-bank.ts
/scripts/validate-tests.ts
```

The validation scripts must check:

1. Exactly 1,000 total questions
2. Unique question IDs
3. Every question has options
4. Every question has a correct answer
5. Every question has explanations
6. Every question maps to a domain
7. Every test has exactly 100 questions
8. No question appears in more than one test
9. Domain weighting is respected
10. Difficulty distribution is reasonable

Add these npm scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "validate:questions": "tsx scripts/validate-question-bank.ts",
    "validate:tests": "tsx scripts/validate-tests.ts",
    "validate": "npm run validate:questions && npm run validate:tests"
  }
}
```

## Final report

When finished, report:

1. What was created
2. Final file tree
3. Confirmation that there are exactly 1,000 questions
4. Confirmation that there are 10 tests with 100 questions each
5. Confirmation that validation scripts pass
6. Assumptions made
7. Any unclear PDF sections
8. How to run the app

## Do not stop early

Do not stop after converting the PDF.

Do not stop after generating a sample.

Do the full build.

PDF → Markdown → JSON → Question bank → Weighted tests → Web app → Validation → README.
