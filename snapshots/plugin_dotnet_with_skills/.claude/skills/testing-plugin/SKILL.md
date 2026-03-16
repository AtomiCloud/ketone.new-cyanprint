---
name: testing-plugin
description: Guide for testing CyanPrint plugins
---

# Testing CyanPrint Plugins

## Overview

Plugins can be tested using `test.cyan.yaml` files that define input files, configuration, and expected validation results.

## Test File Structure

Create a `test.cyan.yaml` file in your plugin root:

```yaml
# test.cyan.yaml
test_cases:
  - name: 'validation-passes'
    description: 'Test when all validation checks pass'
    input:
      - path: 'README.md'
        content: "# My Project\n\nDescription here"
      - path: 'package.json'
        content: |
          {
            "name": "my-project",
            "version": "1.0.0"
          }
    config:
      requireReadme: true
      requirePackageJson: true
    expect:
      errors: []
      warnings: []
```

## Input Files

Define input files that the plugin will receive:

```yaml
input:
  - path: 'README.md'
    content: |
      # Project Title

      This is a description.

  - path: 'package.json'
    content: |
      {
        "name": "test-project",
        "version": "1.0.0",
        "license": "MIT"
      }

  - path: 'src/index.ts'
    content: |
      export function main() {
        console.log("Hello");
      }
```

## Configuration

Define plugin configuration for each test:

```yaml
config:
  # Plugin-specific options
  requireReadme: true
  requireLicense: true
  forbiddenPatterns:
    - 'console.log'
    - 'TODO'
```

## Expected Results

### Validation Plugins

Define expected errors and warnings:

```yaml
expect:
  errors:
    - path: 'README.md'
      messageContains: 'required'
  warnings:
    - path: 'src/index.ts'
      messageContains: 'console.log'
```

### Transformation Plugins

Use snapshots to verify output:

```yaml
snapshots:
  - path: 'src/index.ts'
    name: 'formatted-output'
```

## Validate Commands

Run shell commands to verify plugin effects:

```yaml
validate:
  - command: 'test -f src/index.ts'
    description: 'File still exists after plugin run'

  - command: "! grep -q 'console.log' src/index.ts"
    description: 'console.log was removed'
```

## Complete Test Examples

### Validation Plugin Tests

```yaml
# test.cyan.yaml
test_cases:
  - name: 'all-files-present'
    description: 'Validation passes when all required files exist'
    input:
      - path: 'README.md'
        content: '# Project'
      - path: 'LICENSE'
        content: 'MIT License'
      - path: 'package.json'
        content: '{"name": "test", "version": "1.0.0"}'
    config:
      requireReadme: true
      requireLicense: true
      requirePackageJson: true
    expect:
      errors: []
      warnings: []

  - name: 'missing-readme'
    description: 'Validation fails when README is missing'
    input:
      - path: 'LICENSE'
        content: 'MIT License'
      - path: 'package.json'
        content: '{"name": "test"}'
    config:
      requireReadme: true
    expect:
      errors:
        - path: 'README.md'
          messageContains: 'required'
      warnings: []

  - name: 'missing-license-warning'
    description: 'Missing license produces warning'
    input:
      - path: 'README.md'
        content: '# Project'
      - path: 'package.json'
        content: '{"name": "test"}'
    config:
      requireReadme: true
      requireLicense: false
      warnNoLicense: true
    expect:
      errors: []
      warnings:
        - path: 'LICENSE'
          messageContains: 'license'

  - name: 'forbidden-patterns'
    description: 'Detect forbidden patterns in code'
    input:
      - path: 'src/main.ts'
        content: |
          export function main() {
            console.log("debug");
            // TODO: fix this
          }
    config:
      forbiddenPatterns:
        - 'console.log'
        - 'TODO'
    expect:
      errors:
        - path: 'src/main.ts'
          messageContains: 'console.log'
        - path: 'src/main.ts'
          messageContains: 'TODO'
```

### Transformation Plugin Tests

```yaml
test_cases:
  - name: 'format-typescript'
    description: 'Format TypeScript files'
    input:
      - path: 'src/index.ts'
        content: |
          export    function   hello()   {
          console.log( "Hello" ) ;
          }
    config:
      indent: 2
      semi: true
    snapshots:
      - path: 'src/index.ts'
        name: 'formatted-index'

  - name: 'remove-console-logs'
    description: 'Remove console.log statements'
    input:
      - path: 'src/utils.ts'
        content: |
          export function debug() {
            console.log("debug info");
            return true;
          }
          export function log(msg: string) {
            console.log(msg);
          }
    config:
      removeConsoleLog: true
    validate:
      - command: "! grep -q 'console.log' src/utils.ts"
        description: 'All console.log removed'
    snapshots:
      - path: 'src/utils.ts'
        name: 'no-console-logs'
```

### Mixed Validation and Transformation

```yaml
test_cases:
  - name: 'validate-and-transform'
    description: 'Plugin that validates then transforms'
    input:
      - path: 'config.json'
        content: |
          {"name": "test", "debug": true}
    config:
      schema:
        type: object
        required: ['name']
        properties:
          name:
            type: string
          debug:
            type: boolean
      format: true
      indent: 2
    validate:
      - command: 'test -f config.json'
    snapshots:
      - path: 'config.json'
        name: 'formatted-config'
```

## Running Tests

### Run All Tests

```bash
cyanprint test plugin
```

### Run Specific Test

```bash
cyanprint test plugin --case "missing-readme"
```

### Update Snapshots

```bash
cyanprint test plugin --update-snapshots
```

### Verbose Output

```bash
cyanprint test plugin --verbose
```

## Test Fixtures

For complex scenarios, use fixture directories:

```
tests/
├── fixtures/
│   ├── valid-project/
│   │   └── input/
│   │       ├── README.md
│   │       ├── LICENSE
│   │       └── package.json
│   └── invalid-project/
│       └── input/
│           └── package.json
└── test.cyan.yaml
```

Reference fixtures:

```yaml
test_cases:
  - name: 'fixture-valid'
    fixture: 'fixtures/valid-project'
    config:
      requireReadme: true
    expect:
      errors: []

  - name: 'fixture-invalid'
    fixture: 'fixtures/invalid-project'
    config:
      requireReadme: true
    expect:
      errors:
        - path: 'README.md'
          messageContains: 'required'
```

## Best Practices

1. **Test both success and failure cases**: Verify plugin handles valid and invalid input
2. **Test edge cases**: Empty files, large files, special characters
3. **Test all config options**: Each configuration option should have coverage
4. **Use messageContains**: For error/warning messages, use partial matching
5. **Keep fixtures minimal**: Only include files needed for the specific test
6. **Document test purpose**: Clear descriptions help maintain tests
