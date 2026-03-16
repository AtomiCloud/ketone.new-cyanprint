---
name: testing-template
description: Guide for testing CyanPrint templates
---

# Testing CyanPrint Templates

## Overview

CyanPrint templates can be tested using `test.cyan.yaml` files that define test cases with expected inputs and outputs.

## Test File Structure

Create a `test.cyan.yaml` file in your template root:

```yaml
# test.cyan.yaml
test_cases:
  - name: 'typescript-template-test'
    description: 'Test TypeScript template generation'
    answer_state:
      cyan/new/create: Template
      cyan/new/language: Typescript
      cyan/new/skills: yes
      cyan/new/username: testuser
      cyan/new/name: test-template
      cyan/new/description: A test template
      cyan/new/email: test@example.com
      cyan/new/project: https://example.com/project
      cyan/new/source: https://github.com/example/project
    deterministic_state:
      cyan/new/more-tags/0: no
    validate:
      - command: 'test -f cyan/index.ts'
        description: 'Entry point exists'
      - command: 'test -f cyan.yaml'
        description: 'Metadata file exists'
```

## Answer State Format

The `answer_state` section pre-answers questions with specific values:

```yaml
answer_state:
  cyan/new/username: myuser
  cyan/new/name: my-template
  cyan/new/description: A description
  cyan/new/email: user@example.com
  cyan/new/project: https://example.com
  cyan/new/source: https://github.com/example/repo
```

### Handling Conditional Questions

For questions that branch (like "Add another tag?"), use `deterministic_state`:

```yaml
deterministic_state:
  cyan/new/more-tags/0: no     # Don't add any tags
  # OR for adding tags:
  cyan/new/more-tags/0: yes
  cyan/new/tag/0: typescript
  cyan/new/more-tags/1: yes
  cyan/new/tag/1: template
  cyan/new/more-tags/2: no     # Stop adding tags
```

## Fixture Directories

For complex tests, you can use fixture directories:

```
tests/
├── fixtures/
│   ├── basic-template/
│   │   ├── input/
│   │   │   └── answers.yaml
│   │   └── expected/
│   │       ├── cyan/index.ts
│   │       └── cyan.yaml
│   └── advanced-template/
│       └── ...
└── test.cyan.yaml
```

Reference fixtures in your test:

```yaml
test_cases:
  - name: 'basic-test'
    fixture: 'fixtures/basic-template'
    answer_state:
      # ... answers
```

## Validation Commands

The `validate` section runs shell commands to verify the output:

```yaml
validate:
  # Check file existence
  - command: 'test -f cyan/index.ts'
    description: 'Entry point exists'

  # Check directory structure
  - command: 'test -d template/typescript'
    description: 'TypeScript template directory exists'

  # Check file contents
  - command: "grep -q 'StartTemplateWithLambda' cyan/index.ts"
    description: 'Entry point uses correct SDK function'

  # Run generated tests
  - command: 'cd cyan && bun test'
    description: 'Generated tests pass'
```

## Running Tests

### Run All Tests

```bash
cyanprint test template
```

### Run Specific Test

```bash
cyanprint test template --case "typescript-template-test"
```

### Verbose Output

```bash
cyanprint test template --verbose
```

## Snapshot Testing

CyanPrint supports snapshot testing for output verification:

```yaml
test_cases:
  - name: 'snapshot-test'
    answer_state:
      # ... answers
    snapshots:
      - path: 'cyan/index.ts'
        name: 'entry-point'
      - path: 'cyan.yaml'
        name: 'metadata'
```

Snapshots are stored in `__snapshots__/` and can be updated with:

```bash
cyanprint test template --update-snapshots
```

## Complete Example

```yaml
# test.cyan.yaml
test_cases:
  - name: 'typescript-basic'
    description: 'Basic TypeScript template generation'
    answer_state:
      cyan/new/create: Template
      cyan/new/language: Typescript
      cyan/new/skills: yes
      cyan/new/username: testuser
      cyan/new/name: basic-ts
      cyan/new/description: Basic TypeScript template
      cyan/new/email: test@test.com
      cyan/new/project: https://test.com
      cyan/new/source: https://github.com/test/basic-ts
    deterministic_state:
      cyan/new/more-tags/0: no
    validate:
      - command: 'test -f cyan/index.ts'
      - command: 'test -f cyan.yaml'
      - command: 'test -d template/typescript'
      - command: "grep -q '@atomicloud/cyan-sdk' cyan/package.json"
    snapshots:
      - path: 'cyan.yaml'
        name: 'metadata'

  - name: 'python-with-tags'
    description: 'Python template with multiple tags'
    answer_state:
      cyan/new/create: Template
      cyan/new/language: Python
      cyan/new/skills: yes
      cyan/new/username: testuser
      cyan/new/name: python-tagged
      cyan/new/description: Python template with tags
      cyan/new/email: test@test.com
      cyan/new/project: https://test.com
      cyan/new/source: https://github.com/test/python-tagged
    deterministic_state:
      cyan/new/more-tags/0: yes
      cyan/new/tag/0: python
      cyan/new/more-tags/1: yes
      cyan/new/tag/1: fastapi
      cyan/new/more-tags/2: no
    validate:
      - command: 'test -d template/python'
      - command: "grep -q 'python' cyan.yaml"
      - command: "grep -q 'fastapi' cyan.yaml"
```

## Best Practices

1. **Test all language variants**: Create test cases for each supported language
2. **Test edge cases**: Include tests for empty inputs, long names, special characters
3. **Use snapshots sparingly**: Only snapshot files that have stable, meaningful output
4. **Keep tests deterministic**: Use `deterministic_state` for branching questions
5. **Document test cases**: Add clear descriptions explaining what each test validates
