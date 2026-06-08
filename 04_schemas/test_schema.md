# Practice Test Schema

Each test file should contain exactly 100 questions.

```json
{
  "test_id": "test-01",
  "title": "CISSP Practice Test 01",
  "total_questions": 100,
  "domain_distribution": {
    "Security and Risk Management": 16,
    "Asset Security": 10
  },
  "questions": [
    "CISSP-D01-Q0001",
    "CISSP-D02-Q0001"
  ]
}
```

The actual app can either embed full question objects or load question IDs from the central question bank.

Using question IDs is cleaner because it avoids duplicate data.
