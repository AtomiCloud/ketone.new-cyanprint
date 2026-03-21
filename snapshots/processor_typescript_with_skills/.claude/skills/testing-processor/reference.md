# Processor Testing Reference

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
      configKey1: value1
      configKey2: true
    globs:
      - pattern: '**/*.ts'
        type: Template
    validate:
      - grep -q 'expected' output/path.ts
```

## Complete Example

This processor substitutes `{{projectName}}` and `{{version}}` variables. Input files are in separate directories per test case:

```
inputs/
├── basic/
│   ├── src/
│   │   └── index.ts
│   └── src/
│       └── config.json
├── empty/
│   └── src/
│       └── main.ts
└── multi-file/
    ├── src/
    │   ├── app.ts
    │   ├── style.css
    │   └── main.ts
    └── README.md
```

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
      - grep -q 'my-app' src/config.json

  - name: 'empty-config'
    expected:
      type: snapshot
      value:
        path: ./snapshots/empty-config
    input: ./inputs/empty
    config: {}

  - name: 'multiple-files'
    expected:
      type: snapshot
      value:
        path: ./snapshots/multiple-files
    input: ./inputs/multi-file
    config:
      headerComment: '// Auto-generated'
      extensions:
        - '.ts'
        - '.js'
    validate:
      - grep -q 'Auto-generated' src/app.ts
      - "! grep -q 'Auto-generated' src/style.css"
```

## Directory Layout

```
processor-root/
├── inputs/
│   ├── basic/
│   │   └── src/
│   │       └── index.ts
│   └── multi-file/
│       ├── src/
│       │   ├── app.ts
│       │   └── style.css
│       └── README.md
├── snapshots/
│   ├── basic-substitution/
│   │   └── src/
│   │       └── index.ts
│   └── multi-file/
│       └── ...
├── cyan/
│   └── index.ts
├── cyan.yaml
└── test.cyan.yaml
```

## Field Reference

| Field      | Type         | Required | Description                                                     |
| ---------- | ------------ | -------- | --------------------------------------------------------------- |
| `name`     | string       | yes      | Unique test case identifier                                     |
| `expected` | object       | yes      | `{ type: snapshot, value: { path } }` — snapshot directory path |
| `input`    | string       | yes      | Path to input directory for the processor                       |
| `config`   | object       | no       | Processor configuration (must match entry point config keys)    |
| `globs`    | list[object] | no       | Override glob patterns: `{ pattern, type }`                     |
| `validate` | list[string] | no       | Shell commands to verify output (plain strings)                 |

## Running Tests

```bash
# Run all test cases
cyanprint test processor .

# Update snapshots after verifying output is correct
cyanprint test processor . --update-snapshots
```

## Tips

- Config keys in tests MUST match what the processor entry point reads from `input.config`
- Input file paths should match the processor's glob patterns from cyan.yaml
- Use `validate` commands for quick checks; use `expected` snapshots for full output verification
- Run `--update-snapshots` only after manually verifying the output is correct
- Test edge cases: empty config, missing optional keys, empty files
