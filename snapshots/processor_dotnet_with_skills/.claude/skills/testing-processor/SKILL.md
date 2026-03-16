---
name: testing-processor
description: Guide for testing CyanPrint processors
---

# Testing CyanPrint Processors

## Overview

Processors can be tested using `test.cyan.yaml` files that define input files, configuration, and expected outputs.

## Test File Structure

Create a `test.cyan.yaml` file in your processor root:

```yaml
# test.cyan.yaml
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
      prefix: "// Generated\n"
    snapshots:
      - path: 'src/index.ts'
        name: 'prefixed-output'
```

## Input Files

Define input files that the processor will receive:

```yaml
input:
  - path: 'src/index.ts'
    content: |
      export const greeting = "Hello";

  - path: 'src/utils.ts'
    content: |
      export function helper() {}

  - path: 'package.json'
    content: |
      { "name": "test-project" }
```

### Input Directory Structure

Alternatively, use a directory structure:

```
tests/
├── fixtures/
│   └── basic-test/
│       └── input/
│           ├── src/
│           │   ├── index.ts
│           │   └── utils.ts
│           └── package.json
└── test.cyan.yaml
```

Reference in test:

```yaml
test_cases:
  - name: 'directory-based'
    fixture: 'fixtures/basic-test'
    config:
      # ... processor config
```

## Configuration

Define processor configuration for each test:

```yaml
config:
  # Processor-specific options
  license: MIT
  holder: Test User
  year: 2024
```

## Snapshot Testing

Snapshots capture expected output for comparison:

```yaml
snapshots:
  - path: 'src/index.ts'
    name: 'transformed-index'
  - path: 'package.json'
    name: 'package-json'
```

Snapshots are stored in `__snapshots__/`:

```
__snapshots__/
├── basic-transformation/
│   ├── transformed-index.snap
│   └── package-json.snap
└── advanced-test/
    └── ...
```

## Validation Commands

Run shell commands to verify output:

```yaml
validate:
  - command: 'test -f src/index.ts'
    description: 'Output file exists'

  - command: "grep -q 'Generated' src/index.ts"
    description: 'Prefix was added'

  - command: "grep -c 'export' src/index.ts | grep -q 1"
    description: 'Exports preserved'
```

## Complete Test Example

```yaml
# test.cyan.yaml
test_cases:
  - name: 'license-header-typescript'
    description: 'Add license header to TypeScript files'
    input:
      - path: 'src/index.ts'
        content: |
          export function hello() {
            console.log("Hello");
          }
      - path: 'src/utils.ts'
        content: |
          export const PI = 3.14159;
      - path: 'README.md'
        content: '# My Project'
    config:
      type: MIT
      holder: Test User
      year: 2024
    validate:
      - command: 'test -f src/index.ts'
      - command: 'test -f src/utils.ts'
      - command: 'test -f README.md'
      - command: "grep -q 'MIT License' src/index.ts"
      - command: "grep -q 'MIT License' src/utils.ts"
      - command: "! grep -q 'MIT License' README.md"
    snapshots:
      - path: 'src/index.ts'
        name: 'license-header-ts'
      - path: 'src/utils.ts'
        name: 'license-header-utils'

  - name: 'license-header-javascript'
    description: 'Add license header to JavaScript files'
    input:
      - path: 'index.js'
        content: |
          module.exports = { hello: () => "Hello" };
    config:
      type: Apache-2.0
      holder: Apache Contributors
    snapshots:
      - path: 'index.js'
        name: 'apache-header-js'

  - name: 'exclude-files'
    description: 'Test file exclusion patterns'
    input:
      - path: 'src/main.ts'
        content: "console.log('main');"
      - path: 'src/main.test.ts'
        content: "test('main', () => {});"
      - path: 'src/config.json'
        content: '{"key": "value"}'
    config:
      type: MIT
      exclude:
        - '*.test.ts'
        - '*.json'
    validate:
      - command: "grep -q 'MIT' src/main.ts"
      - command: "! grep -q 'MIT' src/main.test.ts"
      - command: "! grep -q 'MIT' src/config.json"

  - name: 'multiple-config-options'
    description: 'Test with multiple configuration options'
    input:
      - path: 'app.ts'
        content: 'export class App {}'
    config:
      type: MIT
      holder: Multi Config Test
      year: 2025
      includeDate: true
    validate:
      - command: "grep -q 'MIT' app.ts"
      - command: "grep -q 'Multi Config Test' app.ts"
      - command: "grep -q '2025' app.ts"
```

## Running Tests

### Run All Tests

```bash
cyanprint test processor
```

### Run Specific Test

```bash
cyanprint test processor --case "license-header-typescript"
```

### Update Snapshots

```bash
cyanprint test processor --update-snapshots
```

### Verbose Output

```bash
cyanprint test processor --verbose
```

## Best Practices

1. **Test all config combinations**: Cover different configuration values
2. **Test edge cases**: Empty files, large files, special characters
3. **Test file filtering**: Verify exclude patterns work correctly
4. **Use meaningful snapshot names**: Make it easy to identify what each snapshot tests
5. **Document test purpose**: Use clear descriptions for each test case
6. **Keep fixtures small**: Minimal input needed to demonstrate behavior
