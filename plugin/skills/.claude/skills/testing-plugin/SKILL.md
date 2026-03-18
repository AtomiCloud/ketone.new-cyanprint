---
name: testing-plugin
description: Test this CyanPrint plugin. Use when the user asks to write plugin tests, add test cases with input files and config, update snapshots, or debug plugin test failures. Covers test.cyan.yaml format with input files, config, expect (errors/warnings), and snapshots.
---

# Testing this Plugin

## Step 1: Understand what to test

Read the entry point code (`cyan/index.ts` or equivalent) to find:

- What `input.config` keys the plugin reads (e.g., `config.requireReadme`, `config.forbiddenPatterns`)
- What the plugin does (validation, transformation, or both)
- What files it reads or checks

## Step 2: Write test.cyan.yaml

Create a `test.cyan.yaml` file in the plugin root:

```yaml
test_cases:
  - name: 'validation-passes'
    description: 'All validation checks pass'
    input:
      - path: 'README.md'
        content: '# My Project'
      - path: 'package.json'
        content: '{"name": "test", "version": "1.0.0"}'
    config:
      # Key each entry to YOUR plugin's actual config keys from the entry point
      requireReadme: true
      requireLicense: false
    expect:
      errors: []
      warnings: []
```

### input

Define test input files that the plugin will receive in `input.directory`.

### config

Keys must match the `input.config` keys your plugin actually reads. Extract them from the entry point code — do NOT invent fictional config keys.

### expect

For **validation plugins**, define expected `errors` and `warnings`:

```yaml
expect:
  errors:
    - path: 'README.md'
      messageContains: 'required'
  warnings: []
```

### validate

Optional shell commands to run after plugin execution:

```yaml
validate:
  - command: 'test -f src/index.ts'
    description: 'File exists after plugin run'
```

### snapshots

For **transformation plugins**, declare expected output files:

```yaml
snapshots:
  - path: 'src/index.ts'
    name: 'transformed-output'
```

## Step 3: Run and iterate

```bash
# Run all plugin tests
cyanprint test plugin .

# Run with verbose output
cyanprint test plugin . --verbose

# Update snapshots after intentional changes
cyanprint test plugin . --update-snapshots
```

If tests fail, check that your `config` keys match the actual config keys used in the entry point code.

See [reference.md](./reference.md) for complete examples.
