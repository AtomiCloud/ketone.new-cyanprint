---
name: documenting-plugin
description: Guide for documenting and using CyanPrint plugins
---

# Documenting CyanPrint Plugins

## How to Use This Plugin

### Referencing in a Template

Plugins are referenced in a template's `cyan.yaml` file:

```yaml
plugins:
  - name: myorg/my-validator
    config:
      # Plugin-specific configuration
      strict: true
      rules: ['no-console', 'prefer-const']
```

### Configuration Options

Each plugin defines its own configuration schema. Common patterns:

```yaml
plugins:
  - name: cyan/lint-validator
    config:
      rules: recommended # or ["rule1", "rule2"]
      fix: true # Auto-fix issues
      failOnWarning: false # Only fail on errors

  - name: cyan/license-checker
    config:
      allow:
        - MIT
        - Apache-2.0
      requireLicenseFile: true

  - name: cyan/schema-validator
    config:
      schemas:
        - path: config.schema.json
          target: config.json
        - path: package.schema.json
          target: package.json
```

## Validation vs Transformation

### Validation Plugins

Check output without modifying files. Return errors/warnings:

```yaml
plugins:
  - name: cyan/required-files
    config:
      files:
        - README.md
        - LICENSE
        - package.json
```

**Behavior:**

- If any required file is missing, the build fails
- No files are modified
- Errors show which files are missing

### Transformation Plugins

Modify files in the output:

```yaml
plugins:
  - name: cyan/formatter
    config:
      style: prettier
      indent: 2
      files:
        - '**/*.ts'
        - '**/*.js'
```

**Behavior:**

- Files are reformatted according to config
- Modified files are written back
- Build continues if transformation succeeds

## Plugin Execution Flow

1. Template generates files via processors
2. Resolvers handle any conflicts
3. **Plugins run** (in order defined)
4. Validation plugins check output
5. Transformation plugins modify files
6. Final output is written

### Multiple Plugins

```yaml
plugins:
  - name: cyan/schema-validator # Runs first
    config:
      schemas: [...]

  - name: cyan/lint-validator # Runs second
    config:
      rules: recommended

  - name: cyan/formatter # Runs third
    config:
      style: prettier
```

## What Plugins Can Do

### Validation Capabilities

- **File existence checks**: Ensure required files exist
- **Content validation**: Check file contents match schemas
- **Linting**: Run code quality checks
- **License validation**: Verify license compliance

### Transformation Capabilities

- **Formatting**: Apply consistent code style
- **Minification**: Optimize output files
- **Code generation**: Add generated code sections
- **Content replacement**: Update specific patterns

## Documenting Your Plugin

When creating a plugin, document:

### 1. Purpose

```yaml
# Purpose: Validates that all TypeScript files have proper license headers
```

### 2. Required Configuration

```yaml
# Required:
#   license: string - The license identifier (MIT, Apache-2.0, etc.)
```

### 3. Optional Configuration

```yaml
# Optional:
#   strict: boolean - Fail on warnings (default: false)
#   exclude: string[] - Patterns to exclude (default: [])
```

### 4. Output

```yaml
# Returns:
#   errors: If license header is missing from required files
#   warnings: If license header format is non-standard
```

## Complete Template Example

```yaml
# cyan.yaml
info:
  name: myorg/my-template
  description: A template demonstrating plugin usage

processors:
  - name: cyan/default
    config:
      vars:
        name: my-project

plugins:
  # Validation plugins
  - name: cyan/required-files
    config:
      files:
        - README.md
        - LICENSE
        - package.json

  - name: cyan/schema-validator
    config:
      schemas:
        - path: schemas/package.schema.json
          target: package.json

  # Transformation plugins
  - name: cyan/formatter
    config:
      style: prettier
      indent: 2

resolvers:
  - name: cyan/json-merge
    config:
      strategy: deep-merge
```

## Error Handling

When a plugin returns errors, the build fails:

```
Error: Plugin cyan/required-files failed

Errors:
  - README.md: Required file not found
  - LICENSE: Required file not found
```

Warnings don't fail the build but are displayed:

```
Warning: Plugin cyan/license-checker

Warnings:
  - src/utils.ts: Non-standard license header format
```

## Finding Plugins

Browse available plugins:

- Web: https://cyanprint.dev/registry
- API: `GET https://api.zinc.sulfone.raichu.cluster.atomi.cloud/api/v1/Plugin`
