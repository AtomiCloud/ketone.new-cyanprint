# Processor SDK Reference

## Type Definitions (TypeScript)

```typescript
// Entry point
StartProcessorWithLambda(
  fn: (input: CyanProcessorInput, fileHelper: CyanFileHelper) => Promise<ProcessorOutput>
): void

// Input
interface CyanProcessorInput {
  readDirectory: string;   // Absolute path to input directory
  writeDirectory: string;  // Absolute path to output directory
  globs: CyanGlob[];      // Glob patterns from cyan.yaml
  config: unknown;         // Configuration passed from template
}

// File Helper
interface CyanFileHelper {
  resolveAll(): VirtualFile[];           // Read all Template globs, copy all Copy globs
  read(glob: CyanGlob): VirtualFile[];  // Read files matching a specific glob
  get(glob: CyanGlob): VirtualFileReference[];  // Lazy references
  readAsStream(glob: CyanGlob): VirtualFileStream[];  // Stream-based reading
  copy(glob: CyanGlob): void;           // Copy files as-is
  readDir: string;                       // Resolved read directory path
  writeDir: string;                      // Resolved write directory path
}

// Virtual File (materialized)
interface VirtualFile {
  content: string;     // File content (read/write)
  relative: string;    // Path relative to read directory
  read: string;        // Absolute read path
  write: string;       // Absolute write path
  writeFile(): void;   // Persist changes to write directory
}

// Virtual File Reference (lazy)
interface VirtualFileReference {
  relative: string;        // Path relative to read directory
  readFile(): VirtualFile; // Materialize the file
}

// Output
interface ProcessorOutput {
  directory: string;  // Return input.writeDirectory
}

// Glob types
interface CyanGlob {
  root?: string;
  glob: string;
  type: GlobType;    // Template (0) or Copy (1)
  exclude: string[];
}

enum GlobType {
  Template = 0,
  Copy = 1,
}
```

## Multi-Language Entry Points

### TypeScript

```typescript
import { StartProcessorWithLambda } from '@atomicloud/cyan-sdk';
import type { CyanProcessorInput, CyanFileHelper, ProcessorOutput } from '@atomicloud/cyan-sdk';

StartProcessorWithLambda(async (input: CyanProcessorInput, fileHelper: CyanFileHelper): Promise<ProcessorOutput> => {
  const files = fileHelper.resolveAll();

  for (const file of files) {
    // Transform file.content
    file.writeFile();
  }

  return { directory: input.writeDirectory };
});
```

### JavaScript

```javascript
const { StartProcessorWithLambda } = require('@atomicloud/cyan-sdk');

StartProcessorWithLambda(async (input, fileHelper) => {
  const files = fileHelper.resolveAll();

  for (const file of files) {
    // Transform file.content
    file.writeFile();
  }

  return { directory: input.writeDirectory };
});
```

### Python

```python
from cyanprintsdk import start_processor_with_fn

def processor_fn(input, file_helper):
    files = file_helper.resolve_all()

    for f in files:
        # Transform f.content
        f.write_file()

    return {"directory": input.write_directory}

start_processor_with_fn(processor_fn)
```

### C#

```csharp
using sulfone_helium;

ProcessorOutput ProcessorFn(ProcessorInput input, CyanFileHelper fileHelper)
{
    var files = fileHelper.ResolveAll();

    foreach (var file in files)
    {
        // Transform file.Content
        file.WriteFile();
    }

    return new ProcessorOutput { Directory = input.WriteDirectory };
}

CyanEngine.StartProcessor(ProcessorFn);
```

## VirtualFile Usage Examples

### String replacement

```typescript
const files = fileHelper.resolveAll();
for (const file of files) {
  file.content = file.content.replaceAll('{{name}}', config.name);
  file.writeFile();
}
```

### Selective processing by extension

```typescript
const files = fileHelper.resolveAll();
for (const file of files) {
  if (file.relative.endsWith('.ts')) {
    file.content = `// Header\n${file.content}`;
    file.writeFile();
  }
}
```

### Using lazy references

```typescript
const refs = fileHelper.get(input.globs[0]);
for (const ref of refs) {
  if (ref.relative.endsWith('.json')) {
    const file = ref.readFile();
    const data = JSON.parse(file.content);
    data.generated = true;
    file.content = JSON.stringify(data, null, 2);
    file.writeFile();
  }
}
```

### Copy globs as-is

```typescript
// Copy binary/static files without transformation
for (const glob of input.globs) {
  if (glob.type === GlobType.Copy) {
    fileHelper.copy(glob);
  }
}
```
