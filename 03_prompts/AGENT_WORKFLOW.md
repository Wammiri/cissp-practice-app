# Agent Workflow

Use this plan inside Claude Code if the task needs to be broken into agents.

## Agent 1: PDF Conversion Agent

Responsibilities:

- Read the CISSP syllabus PDF
- Convert it into clean markdown
- Preserve hierarchy and wording as much as possible
- Create structured JSON
- Identify domains, sections, topics, and subtopics

Outputs:

```text
/content/cissp-syllabus.md
/content/cissp-syllabus-structured.json
/content/domain-topic-map.json
```

## Agent 2: Domain Weighting Agent

Responsibilities:

- Extract domain weighting from the PDF if available
- If not available, verify current CISSP weighting from a reliable source
- Allocate exactly 1,000 questions by weight
- Handle rounding cleanly

Output:

```text
/questions/domain-weighting.json
```

## Agent 3 to Agent 10: Domain Question Agents

Each agent owns one CISSP domain.

Responsibilities:

- Study assigned domain from the structured syllabus
- Identify high-value testable concepts
- Generate original CISSP-style questions
- Ensure questions are scenario-based where useful
- Add explanations for correct and incorrect answers
- Save the domain file

Outputs:

```text
/questions/domain-01-*.json
/questions/domain-02-*.json
/questions/domain-03-*.json
/questions/domain-04-*.json
/questions/domain-05-*.json
/questions/domain-06-*.json
/questions/domain-07-*.json
/questions/domain-08-*.json
```

## Quality Review Agent

Responsibilities:

- Check duplicates
- Check vague questions
- Check weak distractors
- Check wrong answer keys
- Check missing explanations
- Check topic coverage gaps

Outputs:

- Revised domain question files
- Quality notes if needed

## Aggregation Agent

Responsibilities:

- Merge domain files into one 1,000-question bank
- Create markdown version
- Generate ten weighted 100-question tests
- Create test manifest

Outputs:

```text
/questions/cissp-question-bank.json
/questions/cissp-question-bank.md
/tests/test-01.json through /tests/test-10.json
/tests/test-manifest.json
```

## App Builder Agent

Responsibilities:

- Build the Next.js or React app
- Load test JSON files
- Implement answer selection, timer, review, scoring, and persistence

Outputs:

```text
/src
package.json
README.md
```

## Validation Agent

Responsibilities:

- Create validation scripts
- Run validation
- Fix failed checks

Outputs:

```text
/scripts/validate-question-bank.ts
/scripts/validate-tests.ts
```
