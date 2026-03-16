---
name: testing-resolver
description: Guide for testing CyanPrint resolvers
---

# Testing CyanPrint Resolvers

## Overview

Resolvers can be tested using `test.cyan.yaml` files that define conflicting file inputs, configuration, and expected merged outputs.

## Test File Structure

Create a `test.cyan.yaml` file in your resolver root:

```yaml
# test.cyan.yaml
test_cases:
  - name: 'merge-two-json-files'
    description: 'Merge two package.json files'
    resolver_inputs:
      - path: 'package.json'
        content: '{"name": "base-project", "version": "1.0.0"}'
        origin:
          template: 'base-template'
      - path: 'package.json'
        content: '{"dependencies": {"express": "^4.0.0"}}'
        origin:
          template: 'extended-template'
    config:
      strategy: deep-merge
    snapshots:
      - path: 'package.json'
        name: 'merged-package-json'
```

## Resolver Inputs

Define multiple files with the same path (conflict):

```yaml
resolver_inputs:
  - path: 'package.json'
    content: |
      {
        "name": "my-project",
        "version": "1.0.0",
        "dependencies": {
          "lodash": "^4.0.0"
        }
      }
    origin:
      template: 'base-template'

  - path: 'package.json'
    content: |
      {
        "dependencies": {
          "express": "^4.0.0"
        },
        "devDependencies": {
          "typescript": "^5.0.0"
        }
      }
    origin:
      template: 'extended-template'

  - path: 'package.json'
    content: |
      {
        "devDependencies": {
          "jest": "^29.0.0"
        }
      }
    origin:
      layer: 'testing-layer'
```

### Origin Structure

```yaml
origin:
  template: string # Template name (optional)
  layer: string # Layer name (optional)
```

At least one of `template` or `layer` should be specified.

## Configuration

Define resolver configuration for each test:

```yaml
config:
  strategy: deep-merge
  arrayStrategy: unique-concat
  preserveKeys:
    - name
    - version
```

## Snapshots

Snapshots capture expected resolved output:

```yaml
snapshots:
  - path: 'package.json'
    name: 'merged-output'
  - path: 'tsconfig.json'
    name: 'merged-tsconfig'
```

Snapshots are stored in `__snapshots__/`:

```
__snapshots__/
├── merge-two-json-files/
│   └── merged-output.snap
└── priority-resolution/
    └── ...
```

## Complete Test Examples

### Deep Merge Test

```yaml
test_cases:
  - name: 'deep-merge-json'
    description: 'Deep merge two JSON files'
    resolver_inputs:
      - path: 'config.json'
        content: |
          {
            "app": {
              "name": "my-app",
              "port": 3000
            },
            "features": ["auth"]
          }
        origin:
          template: 'base'
      - path: 'config.json'
        content: |
          {
            "app": {
              "port": 8080,
              "debug": true
            },
            "features": ["logging"]
          }
        origin:
          template: 'extended'
    config:
      strategy: deep-merge
      arrayStrategy: concat
    validate:
      - command: "jq '.app.name' config.json | grep -q 'my-app'"
        description: 'Original name preserved'
      - command: "jq '.app.port' config.json | grep -q '8080'"
        description: 'Port overridden'
      - command: "jq '.features | length' config.json | grep -q '2'"
        description: 'Arrays concatenated'
    snapshots:
      - path: 'config.json'
        name: 'deep-merged-config'
```

### Preserve Keys Test

```yaml
test_cases:
  - name: 'preserve-package-keys'
    description: 'Preserve name and version from base'
    resolver_inputs:
      - path: 'package.json'
        content: |
          {
            "name": "original-name",
            "version": "1.0.0",
            "description": "Base description"
          }
        origin:
          template: 'base'
      - path: 'package.json'
        content: |
          {
            "name": "extended-name",
            "version": "2.0.0",
            "description": "Extended description"
          }
        origin:
          template: 'extended'
    config:
      strategy: deep-merge
      preserveKeys:
        - name
        - version
    validate:
      - command: "jq '.name' package.json | grep -q 'original-name'"
        description: 'Name preserved from base'
      - command: "jq '.version' package.json | grep -q '1.0.0'"
        description: 'Version preserved from base'
      - command: "jq '.description' package.json | grep -q 'Extended'"
        description: 'Description from extended'
```

### Priority Resolution Test

```yaml
test_cases:
  - name: 'layer-priority'
    description: 'Layer override takes priority'
    resolver_inputs:
      - path: 'settings.yaml'
        content: |
          debug: false
          logLevel: info
        origin:
          template: 'base'
      - path: 'settings.yaml'
        content: |
          debug: true
          logLevel: debug
        origin:
          layer: 'development'
    config:
      strategy: priority
      priority:
        - layer: development
        - template: base
    validate:
      - command: "grep 'debug: true' settings.yaml"
        description: 'Layer setting wins'
    snapshots:
      - path: 'settings.yaml'
        name: 'priority-resolved-settings'
```

### Array Strategy Tests

```yaml
test_cases:
  - name: 'array-concat'
    description: 'Concatenate arrays'
    resolver_inputs:
      - path: 'tsconfig.json'
        content: |
          {
            "compilerOptions": {
              "lib": ["ES2020"]
            }
          }
        origin:
          template: 'base'
      - path: 'tsconfig.json'
        content: |
          {
            "compilerOptions": {
              "lib": ["DOM"]
            }
          }
        origin:
          template: 'web'
    config:
      arrayStrategy: concat
    validate:
      - command: "jq '.compilerOptions.lib | length' tsconfig.json | grep -q '2'"
        description: 'Arrays concatenated'
    snapshots:
      - path: 'tsconfig.json'
        name: 'concat-arrays'

  - name: 'array-unique-concat'
    description: 'Concatenate with deduplication'
    resolver_inputs:
      - path: 'tsconfig.json'
        content: |
          {
            "compilerOptions": {
              "lib": ["ES2020", "DOM"]
            }
          }
        origin:
          template: 'base'
      - path: 'tsconfig.json'
        content: |
          {
            "compilerOptions": {
              "lib": ["DOM", "DOM.Iterable"]
            }
          }
        origin:
          template: 'web'
    config:
      arrayStrategy: unique-concat
    validate:
      - command: "jq '.compilerOptions.lib | length' tsconfig.json | grep -q '3'"
        description: 'Duplicates removed'
    snapshots:
      - path: 'tsconfig.json'
        name: 'unique-concat-arrays'

  - name: 'array-replace'
    description: 'Replace arrays'
    resolver_inputs:
      - path: 'tsconfig.json'
        content: |
          {
            "compilerOptions": {
              "lib": ["ES2020"]
            }
          }
        origin:
          template: 'base'
      - path: 'tsconfig.json'
        content: |
          {
            "compilerOptions": {
              "lib": ["ES2022"]
            }
          }
        origin:
          template: 'modern'
    config:
      arrayStrategy: replace
    validate:
      - command: "jq '.compilerOptions.lib | length' tsconfig.json | grep -q '1'"
        description: 'Array replaced'
      - command: "jq '.compilerOptions.lib[0]' tsconfig.json | grep -q 'ES2022'"
        description: 'Has new value'
```

## Running Tests

### Run All Tests

```bash
cyanprint test resolver
```

### Run Specific Test

```bash
cyanprint test resolver --case "deep-merge-json"
```

### Update Snapshots

```bash
cyanprint test resolver --update-snapshots
```

### Verbose Output

```bash
cyanprint test resolver --verbose
```

## Best Practices

1. **Test all merge strategies**: Cover deep-merge, shallow-merge, last-wins
2. **Test array handling**: Verify concat, unique-concat, replace behaviors
3. **Test key preservation**: Ensure critical keys are preserved
4. **Test priority**: Verify layer/template priority works correctly
5. **Test edge cases**: Empty files, single file, many files
6. **Use multiple origins**: Test template-template, layer-template, layer-layer conflicts
7. **Validate output structure**: Ensure merged output is valid JSON/YAML
