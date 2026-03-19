---
name: writing-processor-typescript
description: Write or modify CyanPrint processor code in TypeScript. Use when the user asks to change file transformations, modify the entry point, handle file processing, or change output generation. Covers entry point (StartProcessorWithLambda), CyanFileHelper (read/write/copy/resolveAll), and VirtualFile (content/read/write). Processor lambda receives (input, fileHelper) as two parameters.
allowed-tools: Read, Grep, Glob, Write
---

# Writing this Processor (TypeScript)

## Entry Point

Processors use `StartProcessorWithLambda` with **two parameters** -- `CyanProcessorInput` and `CyanFileHelper`:

```typescript
import {
  StartProcessorWithLambda,
  type CyanProcessorInput,
  type CyanFileHelper,
  type ProcessorOutput,
} from '@atomicloud/cyan-sdk';

StartProcessorWithLambda(async (input: CyanProcessorInput, fileHelper: CyanFileHelper): Promise<ProcessorOutput> => {
  // Process files using fileHelper
  return { directory: input.writeDirectory };
});
```

## CyanProcessorInput

```typescript
interface CyanProcessorInput {
  readDirectory: string; // Absolute path to input directory
  writeDirectory: string; // Absolute path to output directory
  globs: CyanGlob[]; // Glob patterns from cyan.yaml
  config: unknown; // Configuration from template
}
```

## CyanFileHelper -- The Primary API

The `fileHelper` parameter is the primary interface for working with files:

### resolveAll() -- Start Here

Call `fileHelper.resolveAll()` first. It reads all Template globs and copies all Copy globs:

```typescript
const files = fileHelper.resolveAll();
// files: VirtualFile[] -- all files available for transformation
```

### read(glob) -- Read Specific Files

```typescript
const files = fileHelper.read(input.globs[0]);
// files: VirtualFile[] -- files matching a specific CyanGlob
```

### get(glob) -- Lazy References

```typescript
const refs = fileHelper.get(input.globs[0]);
// refs: VirtualFileReference[] -- lazy, call .readFile() to materialize
for (const ref of refs) {
  const file = ref.readFile();
  // file: VirtualFile
}
```

### copy(glob) -- Copy Files As-Is

```typescript
for (const glob of input.globs) {
  if (glob.type === GlobType.Copy) {
    fileHelper.copy(glob);
  }
}
```

### readDir / writeDir -- Resolved Directory Paths

```typescript
const readDir = fileHelper.readDir; // string
const writeDir = fileHelper.writeDir; // string
```

## VirtualFile -- Manipulating Files

```typescript
interface VirtualFile {
  content: string; // Read or write the file content
  relative: string; // Path relative to read directory
  read: string; // Absolute read path
  write: string; // Absolute write path
  writeFile(): void; // Persist changes to write directory
}
```

### Example: Transform All Files

```typescript
const files = fileHelper.resolveAll();
for (const file of files) {
  file.content = file.content.replaceAll('{{name}}', config.name);
  file.writeFile();
}
```

### Example: Selective Processing

```typescript
const files = fileHelper.resolveAll();
for (const file of files) {
  if (file.relative.endsWith('.ts')) {
    file.content = `// Header\n${file.content}`;
    file.writeFile();
  }
}
```

### Example: Lazy References

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

## Return Value

```typescript
return { directory: input.writeDirectory };
```

## Type Definitions

```typescript
// Entry point
StartProcessorWithLambda(
  fn: (input: CyanProcessorInput, fileHelper: CyanFileHelper) => Promise<ProcessorOutput>
): void

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
