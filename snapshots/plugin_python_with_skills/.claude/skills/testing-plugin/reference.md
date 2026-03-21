# CyanPrint Plugin Testing Reference

## test.cyan.yaml Format

```yaml
tests:
  - name: 'test-case-name'
    expected:
      type: snapshot
      value:
        path: ./snapshots/test-case-name
    input: ./inputs/test-name
    config:
      key: value
    validate:
      - test -f some-file
```

### Field reference

| Field      | Type         | Required | Description                                                     |
| ---------- | ------------ | -------- | --------------------------------------------------------------- |
| `name`     | string       | yes      | Unique test case identifier                                     |
| `expected` | object       | yes      | `{ type: snapshot, value: { path } }` — snapshot directory path |
| `input`    | string       | no       | Path to input directory for the plugin                          |
| `config`   | object       | no       | Plugin configuration (must match actual config keys from entry) |
| `validate` | list[string] | no       | Shell commands to run after plugin execution (plain strings)    |

## Complete Example: Validation Plugin

This plugin checks for required files. It reads `requireReadme` and `requireLicense` from config. Input files are placed in separate directories per test case:

```
inputs/
├── all-present/
│   ├── README.md
│   ├── LICENSE
│   └── package.json
├── missing-readme/
│   ├── LICENSE
│   └── package.json
└── missing-license/
    ├── README.md
    └── package.json
```

```yaml
tests:
  - name: 'all-checks-pass'
    expected:
      type: snapshot
      value:
        path: ./snapshots/all-checks-pass
    input: ./inputs/all-present
    config:
      requireReadme: true
      requireLicense: true
    validate:
      - test -f README.md
      - test -f LICENSE

  - name: 'missing-readme'
    expected:
      type: snapshot
      value:
        path: ./snapshots/missing-readme
    input: ./inputs/missing-readme
    config:
      requireReadme: true
      requireLicense: false
    validate:
      - test ! -f README.md

  - name: 'license-optional'
    expected:
      type: snapshot
      value:
        path: ./snapshots/license-optional
    input: ./inputs/missing-license
    config:
      requireReadme: true
      requireLicense: false
    validate:
      - test -f README.md
```

## Complete Example: Transformation Plugin

This plugin formats TypeScript files. It reads `indent` and `semi` from config.

```
inputs/
└── unformatted/
    ├── src/
    │   ├── index.ts
    │   └── utils.ts
    └── package.json
```

```yaml
tests:
  - name: 'format-typescript'
    expected:
      type: snapshot
      value:
        path: ./snapshots/format-typescript
    input: ./inputs/unformatted
    config:
      indent: 2
      semi: true
    validate:
      - test -f src/index.ts

  - name: 'no-changes-default'
    expected:
      type: snapshot
      value:
        path: ./snapshots/no-changes-default
    input: ./inputs/unformatted
    config:
      indent: 2
      semi: false
```

## Directory Layout

```
plugin-root/
├── inputs/
│   ├── all-present/
│   │   ├── README.md
│   │   └── package.json
│   └── missing-readme/
│       └── package.json
├── snapshots/
│   ├── all-checks-pass/
│   │   └── ... (expected output after plugin runs)
│   └── missing-readme/
│       └── ... (expected output after plugin runs)
├── cyan/
│   └── index.ts
├── cyan.yaml
└── test.cyan.yaml
```

## Running Tests

```bash
# Run all tests
cyanprint test plugin .

# Run with verbose output
cyanprint test plugin . --verbose

# Update snapshots after verifying output is correct
cyanprint test plugin . --update-snapshots
```
