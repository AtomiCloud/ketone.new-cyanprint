# Processor Testing Reference

## test.cyan.yaml Schema

```yaml
test_cases:
  - name: 'test-case-name' # Unique test case identifier
    description: 'What this tests' # Human-readable description
    input: # Input files the processor receives
      - path: 'relative/path.ts' # File path relative to input root
        content: | # File content as string
          // file contents here
    config: # Processor configuration (must match entry point config keys)
      configKey1: 'value1'
      configKey2: true
    validate: # Optional shell commands to verify output
      - command: "grep -q 'expected' output/path.ts"
        description: 'Verify expected content exists'
    snapshots: # Expected output files for snapshot comparison
      - path: 'relative/path.ts' # Output file path
        name: 'snapshot-name' # Snapshot identifier
```

## Complete Example

```yaml
# test.cyan.yaml
test_cases:
  - name: 'basic-substitution'
    description: 'Test basic variable substitution in TypeScript files'
    input:
      - path: 'src/index.ts'
        content: |
          export const name = "{{projectName}}";
          export const version = "{{version}}";
      - path: 'src/config.json'
        content: |
          {
            "name": "{{projectName}}",
            "debug": false
          }
    config:
      projectName: 'my-app'
      version: '1.0.0'
    validate:
      - command: "grep -q 'my-app' src/index.ts"
        description: 'Project name was substituted in TS'
      - command: "grep -q 'my-app' src/config.json"
        description: 'Project name was substituted in JSON'
    snapshots:
      - path: 'src/index.ts'
        name: 'basic-ts-output'
      - path: 'src/config.json'
        name: 'basic-json-output'

  - name: 'empty-config'
    description: 'Test processor behavior with minimal/default config'
    input:
      - path: 'src/main.ts'
        content: |
          console.log("hello");
    config: {}
    snapshots:
      - path: 'src/main.ts'
        name: 'default-config-output'

  - name: 'multiple-files'
    description: 'Test processing multiple files with different extensions'
    input:
      - path: 'src/app.ts'
        content: |
          export class App {}
      - path: 'src/style.css'
        content: |
          body { margin: 0; }
      - path: 'README.md'
        content: |
          # Project
    config:
      headerComment: '// Auto-generated'
      extensions:
        - '.ts'
        - '.js'
    validate:
      - command: "grep -q 'Auto-generated' src/app.ts"
        description: 'Header added to .ts file'
      - command: "! grep -q 'Auto-generated' src/style.css"
        description: 'Header NOT added to .css file'
    snapshots:
      - path: 'src/app.ts'
        name: 'multi-file-ts'
      - path: 'src/style.css'
        name: 'multi-file-css'
      - path: 'README.md'
        name: 'multi-file-readme'
```

## Running Tests

```bash
# Run all test cases
cyanprint test processor .

# Update snapshots after verifying output is correct
cyanprint test processor . --update-snapshots
```

## Snapshot Storage

Snapshots are stored in a `__snapshots__/` directory alongside `test.cyan.yaml`:

```
processor-root/
├── __snapshots__/
│   ├── basic-substitution/
│   │   ├── basic-ts-output.snap
│   │   └── basic-json-output.snap
│   └── multiple-files/
│       ├── multi-file-ts.snap
│       ├── multi-file-css.snap
│       └── multi-file-readme.snap
├── cyan/
│   └── index.ts
├── cyan.yaml
└── test.cyan.yaml
```

## Tips

- Config keys in tests MUST match what the processor entry point reads from `input.config`
- Input file paths should match the processor's glob patterns from cyan.yaml
- Use `validate` commands for quick checks; use `snapshots` for full output verification
- Run `--update-snapshots` only after manually verifying the output is correct
- Test edge cases: empty config, missing optional keys, empty files, files that don't match globs
