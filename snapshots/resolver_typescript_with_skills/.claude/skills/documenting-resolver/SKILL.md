---
name: documenting-resolver
description: Guide for documenting and using CyanPrint resolvers
---

# Documenting CyanPrint Resolvers

## How to Use This Resolver

### Referencing in a Template

Resolvers are referenced in a template's `cyan.yaml` file in the `resolvers:` array:

```yaml
resolvers:
  - name: myorg/json-merge-resolver
    config:
      # Resolver-specific configuration
      strategy: deep-merge
      arrayStrategy: concat
```

### When Resolvers Are Used

Resolvers are invoked when:

1. **Multiple templates** contribute files to the same path
2. **Layers** add or modify the same file
3. **Extensions** override base template files

### Resolver Execution Flow

1. Templates generate files via processors
2. **Conflicts are detected** (same path, different sources)
3. **Resolver receives all conflicting files** with their origins
4. Resolver produces single output for each conflicting path
5. Plugins validate the resolved output

## Configuration Options

Each resolver defines its own configuration schema:

```yaml
resolvers:
  - name: cyan/json-merge
    config:
      strategy: deep-merge # How to merge objects
      arrayStrategy: concat # How to merge arrays
      preserveKeys: # Keys to preserve from base
        - name
        - version

  - name: cyan/yaml-merge
    config:
      strategy: deep-merge
      preserveComments: true
      indent: 2

  - name: cyan/last-wins
    config:
      # No config needed - uses last source
```

## Understanding File Origins

Each file in a conflict has an origin:

```yaml
# File origin structure
origin:
  template: 'myorg/base-template' # Which template contributed
  layer: 'custom-overrides' # Which layer (if applicable)
```

This allows resolvers to make priority decisions:

```yaml
resolvers:
  - name: cyan/priority-resolver
    config:
      priority: # Order of precedence (highest first)
        - layer: custom-overrides
        - template: extended-template
        - template: base-template
```

## Conflict Resolution Strategies

### Last-Write-Wins

Most recent source wins:

```yaml
resolvers:
  - name: cyan/last-wins
    # No config - simply uses last file
```

**Use case:** Simple templates where order is predictable

### Deep Merge

Intelligently merge JSON/YAML:

```yaml
resolvers:
  - name: cyan/json-merge
    config:
      strategy: deep-merge
      arrayStrategy: unique-concat
```

**Use case:** package.json, tsconfig.json, config files

### Priority-Based

Explicit ordering:

```yaml
resolvers:
  - name: cyan/priority-resolver
    config:
      priority:
        - custom # Custom layer always wins
        - extended # Then extended template
        - base # Base template as fallback
```

**Use case:** Complex multi-template setups

### Custom Logic

Resolver-specific rules:

```yaml
resolvers:
  - name: cyan/license-resolver
    config:
      preferLicense: Apache-2.0 # If available, use this
      fallback: MIT # Otherwise use MIT
```

**Use case:** Domain-specific conflict resolution

## Common Use Cases

### Package.json Merging

```yaml
resolvers:
  - name: cyan/package-json-merge
    config:
      mergeScripts: true # Combine script objects
      mergeDependencies: true # Combine dependencies
      devDependencyStrategy: merge # How to handle dev deps
      preserveKeys:
        - name
        - version
        - private
```

### Config File Merging

```yaml
resolvers:
  - name: cyan/config-merge
    config:
      files:
        - tsconfig.json
        - .eslintrc.json
        - .prettierrc.json
      strategy: deep-merge
```

### README Merging

```yaml
resolvers:
  - name: cyan/readme-merge
    config:
      strategy: concat # Append sections
      includeSource: true # Note which template contributed
```

## Documenting Your Resolver

When creating a resolver, document:

### 1. Purpose

```yaml
# Purpose: Merges package.json files from multiple templates,
# combining dependencies while preserving core metadata
```

### 2. Required Configuration

```yaml
# Required:
#   None - works with defaults
```

### 3. Optional Configuration

```yaml
# Optional:
#   strategy: 'deep-merge' | 'shallow-merge' | 'last-wins'
#   arrayStrategy: 'concat' | 'replace' | 'unique-concat'
#   preserveKeys: string[] - Keys to always take from first file
```

### 4. Supported File Types

```yaml
# Supports:
#   - .json (full merge support)
#   - .yaml, .yml (full merge support)
#   - Other files (last-wins fallback)
```

### 5. Example Output

Show before/after:

```yaml
# Input files:
# base/package.json: { "name": "project", "dependencies": { "lodash": "4.0" } }
# ext/package.json: { "dependencies": { "express": "4.0" } }

# Output:
# { "name": "project", "dependencies": { "lodash": "4.0", "express": "4.0" } }
```

## Complete Template Example

```yaml
# cyan.yaml
info:
  name: myorg/my-template
  description: A template demonstrating resolver usage

processors:
  - name: cyan/default
    config:
      vars:
        name: my-project

# Resolvers handle conflicts
resolvers:
  - name: cyan/json-merge
    config:
      strategy: deep-merge
      arrayStrategy: unique-concat
      preserveKeys:
        - name
        - version
        - private

  - name: cyan/yaml-merge
    config:
      strategy: deep-merge
      preserveComments: true

# Plugins validate output
plugins:
  - name: cyan/schema-validator
    config:
      schemas:
        - path: schemas/package.schema.json
          target: package.json
```

## Finding Resolvers

Browse available resolvers:

- Web: https://cyanprint.dev/registry
- API: `GET https://api.zinc.sulfone.raichu.cluster.atomi.cloud/api/v1/Resolver`
