---
name: testing-plugin
description: Test this CyanPrint plugin. Use when the user asks to write plugin tests, add test cases, update snapshots, or debug plugin test failures. Covers test.cyan.yaml format with input directories, config, validate commands, and expected output.
---

# Testing this Plugin

## Step 1: Understand what to test

Read the entry point code (`cyan/index.ts` or equivalent) to find:

- What `input.config` keys the plugin reads (e.g., `config.requireReadme`, `config.forbiddenPatterns`)
- What the plugin does (validation, transformation, or both)
- What files it reads or checks

## Step 2: Prepare input files (if needed)

If the plugin needs input files to operate on, create an input directory:

```text
inputs/
└── with-readme/
    ├── README.md
    └── package.json
```

## Step 3: Write test.cyan.yaml

Create a `test.cyan.yaml` file in the plugin root:

```yaml
tests:
  - name: 'validation-passes'
    expected:
      type: snapshot
      value:
        path: ./snapshots/validation-passes
    input: ./inputs/with-readme
    config:
      requireReadme: true
      requireLicense: false
    validate:
      - test -f README.md
```

### input

Path to a directory containing input files the plugin receives. Omit if the plugin works on an empty directory.

```yaml
input: ./inputs/with-readme
```

### config

Keys must match the `input.config` keys your plugin actually reads. Extract them from the entry point code — do NOT invent fictional config keys.

### expected

Declares expected output using a snapshot path:

```yaml
expected:
  type: snapshot
  value:
    path: ./snapshots/validation-passes
```

### validate

Optional plain shell commands to run after plugin execution:

```yaml
validate:
  - test -f src/index.ts
  - test $(wc -c < output.bin) -eq 16
```

## Step 4: Run and iterate

```bash
# Run all plugin tests
cyanprint test plugin .

# Update snapshots after intentional changes
cyanprint test plugin . --update-snapshots
```

If tests fail, check that your `config` keys match the actual config keys used in the entry point code.

See [reference.md](./reference.md) for complete examples.
