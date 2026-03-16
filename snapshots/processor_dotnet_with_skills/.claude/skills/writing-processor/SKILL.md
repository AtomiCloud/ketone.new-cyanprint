---
name: writing-processor
description: Guide for writing CyanPrint processors
---

# Writing CyanPrint Processors

## Overview

Processors transform template files during CyanPrint execution. They receive files from the template, process them, and output transformed content.

## Processor Architecture

### Entry Points

**TypeScript:**

```typescript
import { StartProcessorWithLambda, type IProcessorInput, type IProcessorOutput } from '@atomicloud/cyan-sdk';

StartProcessorWithLambda(async (input: IProcessorInput): Promise<IProcessorOutput> => {
  // Your processor logic here
});
```

**Python:**

```python
from cyan_sdk import start_processor_with_fn, ProcessorInput, ProcessorOutput

def processor_logic(input: ProcessorInput) -> ProcessorOutput:
    # Your processor logic here
    pass

start_processor_with_fn(processor_logic)
```

**C#:**

```csharp
using Atomicloud.CyanSDK;

ProcessorOutput ProcessorLogic(ProcessorInput input)
{
    // Your processor logic here
}

CyanEngine.StartProcessor(ProcessorLogic);
```

### Core Types

#### ProcessorInput

```typescript
interface IProcessorInput {
  config: Record<string, any>; // Configuration from template
  readDir: (path: string) => Promise<string[]>; // List directory contents
  readFile: (path: string) => Promise<string>; // Read file content
  fileExists: (path: string) => Promise<boolean>; // Check if file exists
}
```

#### ProcessorOutput

```typescript
interface IProcessorOutput {
  records: ProcessorRecord[]; // Array of output records
}

interface ProcessorRecord {
  path: string; // Output file path
  content: string; // File content
}
```

## Stream-Based File Transformation

Processors follow a stream-based pattern:

1. **Read input files** using `readDir` and `readFile`
2. **Transform content** according to processor logic
3. **Return output records** with transformed content

### Example: License Header Processor

```typescript
import {
  StartProcessorWithLambda,
  type IProcessorInput,
  type IProcessorOutput,
  type ProcessorRecord,
} from '@atomicloud/cyan-sdk';

StartProcessorWithLambda(async (input: IProcessorInput): Promise<IProcessorOutput> => {
  const config = input.config;
  const licenseText = config.license || 'MIT';
  const files = await input.readDir('.');

  const records: ProcessorRecord[] = [];

  for (const file of files) {
    if (file.endsWith('.ts') || file.endsWith('.js')) {
      const content = await input.readFile(file);
      const header = `// License: ${licenseText}\n\n`;
      records.push({
        path: file,
        content: header + content,
      });
    }
  }

  return { records };
});
```

## Configuration

Processors receive configuration from the template's `cyan.yaml`:

```yaml
processors:
  - name: myorg/my-processor
    config:
      license: Apache-2.0
      includeTests: true
      # ... processor-specific options
```

Access this configuration in your processor:

```typescript
const config = input.config;
const license = config.license;
const includeTests = config.includeTests || false;
```

## File Operations

### Reading Directory Structure

```typescript
// List all files in a directory
const files = await input.readDir('src');

// Recursively list files
async function listAllFiles(dir: string): Promise<string[]> {
  const entries = await input.readDir(dir);
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = `${dir}/${entry}`;
    // Assuming you can determine if it's a directory
    files.push(fullPath);
  }

  return files;
}
```

### Reading File Content

```typescript
const content = await input.readFile('src/index.ts');
```

### Checking File Existence

```typescript
const exists = await input.fileExists('README.md');
if (exists) {
  const readme = await input.readFile('README.md');
}
```

## Output Records

### Creating New Files

```typescript
records.push({
  path: 'generated/config.json',
  content: JSON.stringify(config, null, 2),
});
```

### Modifying Existing Files

```typescript
const original = await input.readFile('src/index.ts');
const modified = original.replace(/OLD/g, 'NEW');

records.push({
  path: 'src/index.ts',
  content: modified,
});
```

### Filtering Files

To exclude a file from output, simply don't include it in the records array.

## Best Practices

1. **Handle missing config gracefully**: Provide sensible defaults
2. **Validate configuration early**: Check required fields at the start
3. **Use async operations**: File operations are asynchronous
4. **Document your config**: Clearly document expected configuration options
5. **Preserve file metadata**: Consider preserving file permissions if relevant

## Example: Full Processor Implementation

```typescript
import {
  StartProcessorWithLambda,
  type IProcessorInput,
  type IProcessorOutput,
  type ProcessorRecord,
} from '@atomicloud/cyan-sdk';

interface MyProcessorConfig {
  prefix: string;
  extensions: string[];
  excludePatterns: string[];
}

StartProcessorWithLambda(async (input: IProcessorInput): Promise<IProcessorOutput> => {
  // Parse and validate config
  const config: MyProcessorConfig = {
    prefix: input.config.prefix || '',
    extensions: input.config.extensions || ['.ts', '.js'],
    excludePatterns: input.config.excludePatterns || [],
  };

  if (!config.prefix) {
    console.warn('No prefix configured, processor will not modify files');
  }

  const records: ProcessorRecord[] = [];
  const files = await input.readDir('.');

  for (const file of files) {
    // Check extension
    const hasValidExtension = config.extensions.some(ext => file.endsWith(ext));
    if (!hasValidExtension) continue;

    // Check exclusion patterns
    const isExcluded = config.excludePatterns.some(pattern => new RegExp(pattern).test(file));
    if (isExcluded) continue;

    // Process file
    const content = await input.readFile(file);
    const prefixed = config.prefix + content;

    records.push({
      path: file,
      content: prefixed,
    });
  }

  return { records };
});
```

## Directory Structure

```
my-processor/
├── cyan/
│   ├── index.ts           # Entry point
│   └── package.json
├── processor/
│   └── typescript/        # Processor implementation templates
├── cyan.yaml              # Metadata
├── Dockerfile             # Container build
└── README.md
```
