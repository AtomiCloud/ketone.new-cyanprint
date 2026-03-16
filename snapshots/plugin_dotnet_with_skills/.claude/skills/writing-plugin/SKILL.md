---
name: writing-plugin
description: Guide for writing CyanPrint plugins
---

# Writing CyanPrint Plugins

## Overview

Plugins validate or transform the final output of CyanPrint templates. Unlike processors, plugins receive the entire generated directory structure and can perform validation checks or additional transformations.

## Plugin Architecture

### Entry Points

**TypeScript:**

```typescript
import { StartPluginWithLambda, type IPluginInput, type IPluginOutput } from '@atomicloud/cyan-sdk';

StartPluginWithLambda(async (input: IPluginInput): Promise<IPluginOutput> => {
  // Your plugin logic here
});
```

**Python:**

```python
from cyan_sdk import start_plugin_with_fn, PluginInput, PluginOutput

def plugin_logic(input: PluginInput) -> PluginOutput:
    # Your plugin logic here
    pass

start_plugin_with_fn(plugin_logic)
```

**C#:**

```csharp
using Atomicloud.CyanSDK;

PluginOutput PluginLogic(PluginInput input)
{
    // Your plugin logic here
}

CyanEngine.StartPlugin(PluginLogic);
```

### Core Types

#### PluginInput

```typescript
interface IPluginInput {
  config: Record<string, any>; // Configuration from template
  readDir: (path: string) => Promise<string[]>; // List directory contents
  readFile: (path: string) => Promise<string>; // Read file content
  fileExists: (path: string) => Promise<boolean>; // Check if file exists
}
```

#### PluginOutput

```typescript
interface IPluginOutput {
  // For validation plugins
  errors?: PluginError[]; // Validation errors (fails the build)
  warnings?: PluginWarning[]; // Warnings (non-blocking)

  // For transformation plugins
  records?: PluginRecord[]; // Modified files to write back
}

interface PluginError {
  path: string; // File path where error occurred
  message: string; // Error message
  line?: number; // Optional line number
  column?: number; // Optional column number
}

interface PluginWarning {
  path: string;
  message: string;
  line?: number;
  column?: number;
}

interface PluginRecord {
  path: string; // File path
  content: string; // Modified content
}
```

## Plugin Types

### Validation Plugins

Validation plugins check output without modifying files:

```typescript
import { StartPluginWithLambda, type IPluginInput, type IPluginOutput, type PluginError } from '@atomicloud/cyan-sdk';

StartPluginWithLambda(async (input: IPluginInput): Promise<IPluginOutput> => {
  const errors: PluginError[] = [];
  const config = input.config;

  // Check for required files
  if (!(await input.fileExists('README.md'))) {
    errors.push({
      path: 'README.md',
      message: 'README.md is required',
    });
  }

  // Validate package.json
  if (await input.fileExists('package.json')) {
    const pkg = JSON.parse(await input.readFile('package.json'));

    if (!pkg.name) {
      errors.push({
        path: 'package.json',
        message: 'package.json must have a "name" field',
      });
    }

    if (!pkg.version) {
      errors.push({
        path: 'package.json',
        message: 'package.json must have a "version" field',
      });
    }
  }

  return { errors };
});
```

### Transformation Plugins

Transformation plugins modify files:

```typescript
import { StartPluginWithLambda, type IPluginInput, type IPluginOutput, type PluginRecord } from '@atomicloud/cyan-sdk';

StartPluginWithLambda(async (input: IPluginInput): Promise<IPluginOutput> => {
  const records: PluginRecord[] = [];
  const files = await input.readDir('src');

  for (const file of files) {
    if (file.endsWith('.ts')) {
      const content = await input.readFile(`src/${file}`);
      const transformed = transformCode(content);

      records.push({
        path: `src/${file}`,
        content: transformed,
      });
    }
  }

  return { records };
});
```

## Directory Passthrough

By default, plugins receive the entire output directory. Files are passed through unchanged unless you return them in `records`:

```typescript
// Files not in records are kept as-is
return { records: modifiedFiles };
```

## Configuration

Plugins receive configuration from the template's `cyan.yaml`:

```yaml
plugins:
  - name: myorg/my-validator
    config:
      strict: true
      rules:
        - no-console
        - prefer-const
```

Access in your plugin:

```typescript
const config = input.config;
const strict = config.strict ?? false;
const rules = config.rules ?? [];
```

## Best Practices

### 1. Separate Validation from Transformation

Keep plugins focused on either validation OR transformation:

```typescript
// Good: Focused on validation
if (errors.length > 0) {
  return { errors };
}
return {};
```

### 2. Provide Clear Error Messages

```typescript
// Bad
errors.push({ path, message: 'Invalid' });

// Good
errors.push({
  path: 'package.json',
  message: 'Missing required field "license". Add "license": "MIT" or your license of choice.',
  line: 1,
});
```

### 3. Make Configuration Optional

```typescript
// Provide sensible defaults
const rules = input.config.rules ?? ['recommended'];
const strict = input.config.strict ?? false;
```

### 4. Handle Missing Files Gracefully

```typescript
if (!(await input.fileExists(path))) {
  // Skip or warn, don't error unless critical
  if (input.config.required) {
    errors.push({ path, message: `Required file ${path} not found` });
  }
  continue;
}
```

## Example: Complete Validation Plugin

```typescript
import {
  StartPluginWithLambda,
  type IPluginInput,
  type IPluginOutput,
  type PluginError,
  type PluginWarning,
} from '@atomicloud/cyan-sdk';

interface ValidatorConfig {
  requireReadme: boolean;
  requireLicense: boolean;
  requireTests: boolean;
  forbiddenPatterns: string[];
}

StartPluginWithLambda(async (input: IPluginInput): Promise<IPluginOutput> => {
  const config: ValidatorConfig = {
    requireReadme: input.config.requireReadme ?? true,
    requireLicense: input.config.requireLicense ?? true,
    requireTests: input.config.requireTests ?? false,
    forbiddenPatterns: input.config.forbiddenPatterns ?? [],
  };

  const errors: PluginError[] = [];
  const warnings: PluginWarning[] = [];

  // Check required files
  if (config.requireReadme && !(await input.fileExists('README.md'))) {
    errors.push({
      path: 'README.md',
      message: 'README.md is required but was not generated',
    });
  }

  if (config.requireLicense && !(await input.fileExists('LICENSE'))) {
    warnings.push({
      path: 'LICENSE',
      message: 'Consider adding a LICENSE file',
    });
  }

  if (config.requireTests && !(await input.fileExists('tests'))) {
    warnings.push({
      path: 'tests',
      message: 'No test directory found',
    });
  }

  // Check forbidden patterns
  const allFiles = await getAllFiles(input, '.');

  for (const file of allFiles) {
    const content = await input.readFile(file);

    for (const pattern of config.forbiddenPatterns) {
      if (content.includes(pattern)) {
        errors.push({
          path: file,
          message: `Forbidden pattern found: "${pattern}"`,
        });
      }
    }
  }

  return { errors, warnings };
});

async function getAllFiles(input: IPluginInput, dir: string): Promise<string[]> {
  const entries = await input.readDir(dir);
  const files: string[] = [];

  for (const entry of entries) {
    const path = dir === '.' ? entry : `${dir}/${entry}`;
    files.push(path);
  }

  return files;
}
```

## Directory Structure

```
my-plugin/
├── cyan/
│   ├── index.ts           # Entry point
│   └── package.json
├── plugin/
│   └── typescript/        # Plugin implementation templates
├── cyan.yaml              # Metadata
├── Dockerfile             # Container build
└── README.md
```
