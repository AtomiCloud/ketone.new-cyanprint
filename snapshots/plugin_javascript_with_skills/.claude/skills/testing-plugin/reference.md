# CyanPrint Plugin Testing Reference

## test.cyan.yaml Format

The `test.cyan.yaml` file defines test cases for a CyanPrint plugin. Each test case specifies input files, plugin config, and expected results.

### Top-level structure

```yaml
test_cases:
  - name: 'test-case-name'
    description: 'What this test verifies'
    input:
      - path: 'relative/file/path'
        content: 'file content'
    config:
      key: value
    expect:
      errors: []
      warnings: []
    validate:
      - command: 'shell command'
        description: 'What this validates'
    snapshots:
      - path: 'relative/file/path'
        name: 'snapshot-name'
```

### Field reference

| Field                               | Type   | Required | Description                                                           |
| ----------------------------------- | ------ | -------- | --------------------------------------------------------------------- |
| `name`                              | string | yes      | Unique test case identifier                                           |
| `description`                       | string | no       | Human-readable description                                            |
| `input`                             | list   | yes      | Files to place in the plugin's input directory                        |
| `input[].path`                      | string | yes      | Relative file path                                                    |
| `input[].content`                   | string | yes      | File content                                                          |
| `config`                            | object | yes      | Plugin configuration (must match actual config keys from entry point) |
| `expect`                            | object | no       | Expected validation results                                           |
| `expect.errors`                     | list   | no       | Expected error entries                                                |
| `expect.errors[].path`              | string | yes      | File path where error occurred                                        |
| `expect.errors[].messageContains`   | string | yes      | Substring to match in error message                                   |
| `expect.warnings`                   | list   | no       | Expected warning entries                                              |
| `expect.warnings[].path`            | string | yes      | File path where warning occurred                                      |
| `expect.warnings[].messageContains` | string | yes      | Substring to match in warning message                                 |
| `validate`                          | list   | no       | Shell commands to run after plugin execution                          |
| `validate[].command`                | string | yes      | Shell command to execute                                              |
| `validate[].description`            | string | no       | What this command checks                                              |
| `snapshots`                         | list   | no       | Files to snapshot for comparison                                      |
| `snapshots[].path`                  | string | yes      | Relative file path to snapshot                                        |
| `snapshots[].name`                  | string | yes      | Snapshot identifier                                                   |

## Complete Example: Validation Plugin

This example tests a plugin that checks for required files and validates package.json fields. The plugin reads `requireReadme` and `requireLicense` from config.

```yaml
test_cases:
  - name: 'all-checks-pass'
    description: 'No errors when all required files are present'
    input:
      - path: 'README.md'
        content: '# My Project'
      - path: 'LICENSE'
        content: 'MIT License'
      - path: 'package.json'
        content: |
          {
            "name": "my-project",
            "version": "1.0.0"
          }
    config:
      requireReadme: true
      requireLicense: true
    expect:
      errors: []
      warnings: []

  - name: 'missing-readme-error'
    description: 'Error reported when README.md is missing'
    input:
      - path: 'LICENSE'
        content: 'MIT License'
      - path: 'package.json'
        content: '{"name": "test", "version": "1.0.0"}'
    config:
      requireReadme: true
      requireLicense: false
    expect:
      errors:
        - path: 'README.md'
          messageContains: 'required'
      warnings: []

  - name: 'missing-license-warning'
    description: 'Warning when LICENSE is missing but not required'
    input:
      - path: 'README.md'
        content: '# Project'
      - path: 'package.json'
        content: '{"name": "test"}'
    config:
      requireReadme: true
      requireLicense: false
    expect:
      errors: []
      warnings:
        - path: 'LICENSE'
          messageContains: 'license'

  - name: 'missing-package-name'
    description: 'Error when package.json has no name field'
    input:
      - path: 'README.md'
        content: '# Project'
      - path: 'package.json'
        content: '{"version": "1.0.0"}'
    config:
      requireReadme: true
      requireLicense: false
    expect:
      errors:
        - path: 'package.json'
          messageContains: 'name'
      warnings: []
```

## Complete Example: Transformation Plugin

This example tests a plugin that formats TypeScript files. The plugin reads `indent` and `semi` from config.

```yaml
test_cases:
  - name: 'format-typescript-files'
    description: 'TypeScript files are formatted with configured style'
    input:
      - path: 'src/index.ts'
        content: |
          export    function   hello()   {
          console.log( "Hello" ) ;
          }
      - path: 'src/utils.ts'
        content: |
          export const   x   =   1 ;
    config:
      indent: 2
      semi: true
    snapshots:
      - path: 'src/index.ts'
        name: 'formatted-index'
      - path: 'src/utils.ts'
        name: 'formatted-utils'

  - name: 'remove-console-logs'
    description: 'console.log statements are removed'
    input:
      - path: 'src/main.ts'
        content: |
          export function main() {
            console.log("debug");
            return true;
          }
    config:
      removeConsoleLogs: true
    validate:
      - command: "! grep -q 'console.log' src/main.ts"
        description: 'All console.log statements removed'
    snapshots:
      - path: 'src/main.ts'
        name: 'no-console-main'

  - name: 'no-changes-without-config'
    description: 'Files unchanged when transform not enabled'
    input:
      - path: 'src/main.ts'
        content: |
          console.log("keep this");
    config:
      removeConsoleLogs: false
    snapshots:
      - path: 'src/main.ts'
        name: 'unchanged-main'
```

## Test Commands

```bash
# Run all tests
cyanprint test plugin .

# Run specific test case
cyanprint test plugin . --case "all-checks-pass"

# Update snapshots after expected output changes
cyanprint test plugin . --update-snapshots

# Verbose output for debugging
cyanprint test plugin . --verbose
```
