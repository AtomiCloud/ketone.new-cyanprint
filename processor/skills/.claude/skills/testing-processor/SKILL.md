---
name: testing-processor
description: Test this CyanPrint processor. Use when the user asks to write processor tests, add test cases with input files, update snapshots, or debug processor test failures. Covers test.cyan.yaml format with input files, config, validate commands, and snapshots.
---

# Testing this Processor

## Step 1: Understand what to test

Read the entry point code (`cyan/index.ts` or equivalent) to find:

- What `input.config` keys the processor reads (e.g., `config.license`, `config.prefix`)
- What file patterns it handles (from `input.globs` or the cyan.yaml processor config)
- What transformations it applies

## Step 2: Write test.cyan.yaml

Create a `test.cyan.yaml` file in the processor root:

```yaml
test_cases:
  - name: 'basic-transformation'
    description: 'Test basic file transformation'
    input:
      - path: 'src/index.ts'
        content: |
          export function hello() {
            return "Hello";
          }
    config:
      # Key each entry to YOUR processor's actual config keys from the entry point
      prefix: "// Generated\n"
    snapshots:
      - path: 'src/index.ts'
        name: 'prefixed-output'
```

### input

Define test input files. Paths should match the processor's glob patterns from cyan.yaml.

### config

Keys must match the `input.config` keys your processor actually reads. Extract them from the entry point code — do NOT invent fictional config keys.

### validate

Optional shell commands to verify output:

```yaml
validate:
  - command: 'test -f src/index.ts'
    description: 'Output file exists'
  - command: "grep -q 'Generated' src/index.ts"
    description: 'Prefix was added'
```

### snapshots

Declare expected output files:

```yaml
snapshots:
  - path: 'src/index.ts'
    name: 'transformed-output'
```

## Step 3: Run and iterate

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
