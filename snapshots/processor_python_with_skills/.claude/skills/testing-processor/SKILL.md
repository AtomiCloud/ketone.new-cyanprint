---
name: testing-processor
description: Test this CyanPrint processor. Use when the user asks to write processor tests, add test cases with input files, update snapshots, or debug processor test failures. Covers test.cyan.yaml format with input directories, config, validate commands, and expected output.
---

# Testing this Processor

## Step 1: Understand what to test

Read the entry point code (`cyan/index.ts` or equivalent) to find:

- What `input.config` keys the processor reads (e.g., `config.license`, `config.prefix`)
- What file patterns it handles (from `input.globs` or the cyan.yaml processor config)
- What transformations it applies

## Step 2: Prepare input files

Create input directories with files the processor will transform:

```
inputs/
├── basic/
│   └── src/
│       └── index.ts
└── multi-file/
    ├── src/
    │   ├── app.ts
    │   └── style.css
    └── README.md
```

## Step 3: Write test.cyan.yaml

Create a `test.cyan.yaml` file in the processor root:

```yaml
tests:
  - name: 'basic-substitution'
    expected:
      type: snapshot
      value:
        path: ./snapshots/basic-substitution
    input: ./inputs/basic
    config:
      projectName: my-app
      version: '1.0.0'
    validate:
      - grep -q 'my-app' src/index.ts
```

### input

Path to a directory containing input files the processor receives. Paths should match the processor's glob patterns from cyan.yaml.

```yaml
input: ./inputs/basic
```

### config

Keys must match the `input.config` keys your processor actually reads. Extract them from the entry point code — do NOT invent fictional config keys.

### expected

Declares expected output using a snapshot path:

```yaml
expected:
  type: snapshot
  value:
    path: ./snapshots/basic-substitution
```

### validate

Optional plain shell commands to verify output:

```yaml
validate:
  - test -f src/index.ts
  - grep -q 'Generated' src/index.ts
```

### globs

Optional list of glob patterns to apply. Overrides the processor's default globs:

```yaml
globs:
  - pattern: '**/*.ts'
    type: Template
```

## Step 4: Run and iterate

```bash
# Run all processor tests
cyanprint test processor .

# Run with verbose output
cyanprint test processor . --verbose

# Update snapshots after intentional changes
cyanprint test processor . --update-snapshots
```

If tests fail, check that your `config` keys match the actual config keys used in the entry point code.

See [reference.md](./reference.md) for a complete example.
