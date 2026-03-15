---
name: documenting-processor
description: Guide for documenting and using CyanPrint processors
---

# Documenting CyanPrint Processors

## How to Use This Processor

### Referencing in a Template

Processors are referenced in a template's `cyan.yaml` file:

```yaml
processors:
  - name: myorg/my-processor
    config:
      # Processor-specific configuration
      option1: value1
      option2: value2
```

### Configuration Options

Each processor defines its own configuration schema. Common configuration patterns include:

```yaml
processors:
  - name: cyan/license
    config:
      type: MIT
      holder: Your Name
      year: 2024

  - name: cyan/formatter
    config:
      style: prettier
      indent: 2
      semi: true

  - name: cyan/env-var-injector
    config:
      prefix: APP_
      file: .env.template
```

## Processor Execution Flow

1. Template defines processors in `cyan.yaml`
2. CyanPrint reads template files
3. Each processor receives files and config
4. Processor transforms content
5. Output is passed to next processor or written to disk

### Multiple Processors

Processors run in order, each receiving the output of the previous:

```yaml
processors:
  - name: cyan/license # Runs first
    config:
      type: MIT

  - name: cyan/formatter # Runs second, receives license-headered files
    config:
      style: prettier
```

## What Gets Transformed

Processors can:

- **Add content**: Prepend headers, append footers
- **Modify content**: Replace patterns, transform syntax
- **Generate files**: Create new files based on configuration
- **Filter files**: Exclude certain files from output

### Example Transformation

**Input file (`src/index.ts`):**

```typescript
export function hello() {
  console.log('Hello, World!');
}
```

**After processor with config `{ license: 'MIT' }`:**

```typescript
// License: MIT
// Copyright (c) 2024

export function hello() {
  console.log('Hello, World!');
}
```

## Using with Plugins and Resolvers

Processors work alongside plugins and resolvers:

```yaml
# cyan.yaml
processors:
  - name: cyan/license
    config:
      type: MIT

plugins:
  - name: cyan/lint-validator
    config:
      rules: recommended

resolvers:
  - name: cyan/merge-json
    config:
      strategy: deep-merge
```

## Documenting Your Processor

When creating a processor, document:

### 1. Required Configuration

```yaml
# Required
license: string # The license type (MIT, Apache, etc.)
```

### 2. Optional Configuration

```yaml
# Optional
holder: string # Default: "Contributors"
year: number # Default: current year
file: string # Default: process all source files
```

### 3. Supported File Types

List which file extensions your processor handles:

```yaml
# Processes:
# - .ts, .tsx (TypeScript)
# - .js, .jsx (JavaScript)
# Skips:
# - .json, .md, .yaml
```

### 4. Output Format

Describe what the processor outputs:

```yaml
# Output:
# - All processed files with license headers
# - No new files created
# - No files deleted
```

## Complete Template Example

```yaml
# cyan.yaml
info:
  name: myorg/my-template
  description: A template demonstrating processor usage

processors:
  - name: cyan/license
    config:
      type: Apache-2.0
      holder: My Organization
      year: 2024

  - name: cyan/env-config
    config:
      envFile: .env.template
      outputPrefix: CONFIG_

  - name: cyan/readme-generator
    config:
      template: README.template.md
      output: README.md

plugins:
  - name: cyan/schema-validator
    config:
      schemas:
        - config.schema.json

resolvers:
  - name: cyan/package-json-merge
    config:
      strategy: merge-dev-dependencies
```

## Finding Processors

Browse available processors:

- Web: https://cyanprint.dev/registry
- API: `GET https://api.zinc.sulfone.raichu.cluster.atomi.cloud/api/v1/Processor`
