# Validation Requirements

Claude Code should create validation scripts that check the generated files.

## Question bank validation

Check:

1. Exactly 1,000 questions
2. Every question ID is unique
3. Every question has a domain
4. Every question has a topic
5. Every question has a difficulty
6. Every question has options
7. Every question has a correct answer or correct answers
8. Every question has explanations
9. Every question has a source reference
10. No obvious duplicate questions

## Test validation

Check:

1. Exactly ten tests
2. Each test has exactly 100 questions
3. No question appears in more than one test
4. All question IDs exist in the master bank
5. Domain weighting is respected
6. Difficulty distribution is reasonable

## Required scripts

```text
/scripts/validate-question-bank.ts
/scripts/validate-tests.ts
```
