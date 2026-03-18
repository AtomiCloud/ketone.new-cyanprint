---
name: testing-template
description: Test this CyanPrint template. Use when the user asks to write tests, add test cases, update snapshots, or debug template test failures. Covers test.cyan.yaml format with answer_state, deterministic_state, validate commands, and snapshot testing.
---

# Testing this Template

## Step 1: Understand what to test

Read the entry point code (`cyan/index.ts` or equivalent) to find YOUR prompt IDs — the `id` parameter in every `i.text(msg, id)`, `i.select(msg, id, opts)`, `i.checkbox(msg, id, opts)`, `i.confirm(msg, id)`, `i.password(msg, id)`, `i.dateSelect(msg, id)` call.

Also note any `d.get(key, ...)` calls — these keys go in `deterministic_state`.

## Step 2: Write test.cyan.yaml

Create a `test.cyan.yaml` file in the template root:

```yaml
test_cases:
  - name: 'basic-test'
    description: 'Basic template generation'
    answer_state:
      # Key each entry to YOUR prompt IDs, NOT any other prefix
      project-name: my-project
      project-language: typescript
      include-tests: 'true'
    deterministic_state:
      # For d.get() keys with branching logic
      add-more-features: 'false'
    validate:
      - command: 'test -f cyan/index.ts'
        description: 'Entry point exists'
      - command: 'test -f cyan.yaml'
        description: 'Metadata file exists'
    snapshots:
      - path: 'cyan.yaml'
        name: 'metadata'
```

### answer_state

Keys must match the `id` values from your entry point's `i.text(...)`, `i.select(...)`, etc. calls. Do NOT use fictional or hardcoded keys — extract them from the actual code.

### deterministic_state

Use for `d.get(key, ...)` calls that control branching logic (e.g., "add another?" loops).

### validate

Optional shell commands that run after template generation to verify output.

### snapshots

Declare expected output files. Snapshots are stored in `__snapshots__/`.

## Step 3: Run and iterate

```bash
# Run all template tests
cyanprint test template .

# Run with verbose output
cyanprint test template . --verbose

# Update snapshots after intentional changes
cyanprint test template . --update-snapshots
```

If tests fail, check that your `answer_state` keys match the actual prompt IDs in the entry point code.

See [reference.md](./reference.md) for a complete example.
