# Question Schema

Every question should follow this structure.

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
  "exam_reasoning": "Explain the reasoning being tested.",
  "source_reference": {
    "syllabus_section": "Domain > Section > Topic",
    "source_file": "/content/cissp-syllabus.md"
  }
}
```

## Allowed question types

```text
single_best_answer
multiple_correct_answers
scenario_based
sequence_ordering
matching
```

Most questions should be `single_best_answer`.
