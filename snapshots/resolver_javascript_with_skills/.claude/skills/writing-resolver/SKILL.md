---
name: writing-resolver
description: Guide for writing CyanPrint resolvers
---

# Writing CyanPrint Resolvers

## Overview

Resolvers handle conflicts when multiple templates or layers contribute files to the same path. They receive all conflicting files and determine which content to use or how to merge them.

## Resolver Architecture

### Entry Points

**TypeScript:**

```typescript
import { StartResolverWithLambda, type IResolverInput, type IResolverOutput } from '@atomicloud/cyan-sdk';

StartResolverWithLambda(async (input: IResolverInput): Promise<IResolverOutput> => {
  // Your resolver logic here
});
```

**Python:**

```python
from cyan_sdk import start_resolver_with_fn, ResolverInput, ResolverOutput

def resolver_logic(input: ResolverInput) -> ResolverOutput:
    # Your resolver logic here
    pass

start_resolver_with_fn(resolver_logic)
```

**C#:**

```csharp
using Atomicloud.CyanSDK;

ResolverOutput ResolverLogic(ResolverInput input)
{
    // Your resolver logic here
}

CyanEngine.StartResolver(ResolverLogic);
```

### Core Types

#### ResolverInput

```typescript
interface IResolverInput {
  config: Record<string, any>; // Configuration from template
  files: ResolverFile[]; // Conflicting files from different origins
}

interface ResolverFile {
  path: string; // File path (same for all files in conflict)
  content: string; // File content
  origin: FileOrigin; // Where the file came from
}

interface FileOrigin {
  template?: string; // Template name if from a template
  layer?: string; // Layer name if from a layer
}
```

#### ResolverOutput

```typescript
interface IResolverOutput {
  path: string; // Output path (usually same as input)
  content: string; // Resolved content
}
```

## Multi-Origin Conflict Resolution

When multiple sources provide the same file path, resolvers decide the final content:

### Example Conflict

```
files: [
  {
    path: "package.json",
    content: '{"name": "base-project", "dependencies": {"lodash": "4.0.0"}}',
    origin: { template: "base-template" }
  },
  {
    path: "package.json",
    content: '{"name": "extended-project", "dependencies": {"express": "4.0.0"}}',
    origin: { template: "extended-template" }
  }
]
```

### Resolution Strategies

#### 1. Last-Write Wins

Use the file from the most recent source:

```typescript
StartResolverWithLambda(async (input: IResolverInput): Promise<IResolverOutput> => {
  // Use the last file in the array (most recent)
  const lastFile = input.files[input.files.length - 1];

  return {
    path: lastFile.path,
    content: lastFile.content,
  };
});
```

#### 2. First-Write Wins

Use the file from the first source:

```typescript
StartResolverWithLambda(async (input: IResolverInput): Promise<IResolverOutput> => {
  const firstFile = input.files[0];

  return {
    path: firstFile.path,
    content: firstFile.content,
  };
});
```

#### 3. Origin Priority

Select based on origin:

```typescript
StartResolverWithLambda(async (input: IResolverInput): Promise<IResolverOutput> => {
  const priorityOrder = input.config.priority ?? ['extended', 'base'];

  for (const priority of priorityOrder) {
    const file = input.files.find(f => f.origin.template?.includes(priority) || f.origin.layer?.includes(priority));
    if (file) {
      return { path: file.path, content: file.content };
    }
  }

  // Fallback to first file
  return {
    path: input.files[0].path,
    content: input.files[0].content,
  };
});
```

#### 4. Content Merge

Merge content intelligently (especially for JSON/YAML):

```typescript
StartResolverWithLambda(async (input: IResolverInput): Promise<IResolverOutput> => {
  const path = input.files[0].path;

  if (path.endsWith('.json')) {
    const merged = mergeJsonFiles(input.files);
    return { path, content: JSON.stringify(merged, null, 2) };
  }

  // For non-JSON, use last-write-wins
  const lastFile = input.files[input.files.length - 1];
  return { path, content: lastFile.content };
});

function mergeJsonFiles(files: ResolverFile[]): object {
  let merged = {};

  for (const file of files) {
    const content = JSON.parse(file.content);
    merged = deepMerge(merged, content);
  }

  return merged;
}

function deepMerge(target: any, source: any): any {
  const result = { ...target };

  for (const key of Object.keys(source)) {
    if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] ?? {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }

  return result;
}
```

## Layer Concept

Layers represent different levels of customization:

1. **Base Layer**: Core template files
2. **Extension Layers**: Additional functionality
3. **Override Layers**: Custom modifications

Example origin tracking:

```typescript
// Check which layer the file came from
const layerFile = input.files.find(f => f.origin.layer === 'custom');
if (layerFile) {
  // Layer override takes precedence
  return { path: layerFile.path, content: layerFile.content };
}
```

## Configuration

Resolvers receive configuration from the template's `cyan.yaml`:

```yaml
resolvers:
  - name: myorg/json-merge-resolver
    config:
      strategy: deep-merge
      arrayStrategy: concat # or 'replace'
      preserveKeys:
        - name
        - version
```

Access in your resolver:

```typescript
const config = input.config;
const strategy = config.strategy ?? 'last-write-wins';
const preserveKeys = config.preserveKeys ?? [];
```

## Best Practices

1. **Preserve essential fields**: For JSON merging, always keep name/version
2. **Handle all file types**: Provide fallback for non-mergeable files
3. **Document merge strategy**: Clearly explain how conflicts are resolved
4. **Support configuration**: Allow users to customize merge behavior
5. **Maintain valid syntax**: Ensure output is always valid (valid JSON, valid YAML, etc.)

## Example: Complete JSON Merge Resolver

```typescript
import { StartResolverWithLambda, type IResolverInput, type IResolverOutput } from '@atomicloud/cyan-sdk';

interface MergeConfig {
  strategy: 'deep-merge' | 'shallow-merge' | 'last-wins';
  arrayStrategy: 'concat' | 'replace' | 'unique-concat';
  preserveKeys: string[];
}

StartResolverWithLambda(async (input: IResolverInput): Promise<IResolverOutput> => {
  const config: MergeConfig = {
    strategy: input.config.strategy ?? 'deep-merge',
    arrayStrategy: input.config.arrayStrategy ?? 'replace',
    preserveKeys: input.config.preserveKeys ?? ['name', 'version'],
  };

  const path = input.files[0].path;

  if (path.endsWith('.json')) {
    return resolveJson(input.files, config);
  }

  if (path.endsWith('.yaml') || path.endsWith('.yml')) {
    return resolveYaml(input.files, config);
  }

  // Default: last-wins for other file types
  const lastFile = input.files[input.files.length - 1];
  return { path: lastFile.path, content: lastFile.content };
});

function resolveJson(files: ResolverFile[], config: MergeConfig): IResolverOutput {
  const path = files[0].path;

  if (config.strategy === 'last-wins') {
    const lastFile = files[files.length - 1];
    return { path, content: lastFile.content };
  }

  let merged: any = {};

  // Track preserved keys from first file
  const preserved: Record<string, any> = {};
  const firstObj = JSON.parse(files[0].content);
  for (const key of config.preserveKeys) {
    if (firstObj[key] !== undefined) {
      preserved[key] = firstObj[key];
    }
  }

  // Merge all files
  for (const file of files) {
    const obj = JSON.parse(file.content);
    merged = deepMerge(merged, obj, config.arrayStrategy);
  }

  // Restore preserved keys
  Object.assign(merged, preserved);

  return { path, content: JSON.stringify(merged, null, 2) };
}

function deepMerge(target: any, source: any, arrayStrategy: string): any {
  const result = { ...target };

  for (const key of Object.keys(source)) {
    if (Array.isArray(source[key]) && Array.isArray(result[key])) {
      switch (arrayStrategy) {
        case 'concat':
          result[key] = [...result[key], ...source[key]];
          break;
        case 'unique-concat':
          result[key] = [...new Set([...result[key], ...source[key]])];
          break;
        case 'replace':
        default:
          result[key] = source[key];
      }
    } else if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] ?? {}, source[key], arrayStrategy);
    } else {
      result[key] = source[key];
    }
  }

  return result;
}
```

## Directory Structure

```
my-resolver/
├── cyan/
│   ├── index.ts           # Entry point
│   └── package.json
├── resolver/
│   └── typescript/        # Resolver implementation templates
├── cyan.yaml              # Metadata
├── Dockerfile             # Container build
└── README.md
```
