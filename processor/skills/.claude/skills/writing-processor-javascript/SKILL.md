---
name: writing-processor-javascript
description: Write or modify CyanPrint processor code in JavaScript. Use when the user asks to change file transformations, modify the entry point, handle file processing, or change output generation. Covers entry point (StartProcessorWithLambda), CyanFileHelper (read/write/copy/resolveAll), and VirtualFile (content/read/write). Processor lambda receives (input, fileHelper) as two parameters.
---

# Writing this Processor (JavaScript)

## Entry Point

Processors use `StartProcessorWithLambda` with **two parameters** -- `input` and `fileHelper`:

```javascript
const { StartProcessorWithLambda } = require('@atomicloud/cyan-sdk');

StartProcessorWithLambda(async (input, fileHelper) => {
  // Process files using fileHelper
  return { directory: input.writeDirectory };
});
```

## Input Object

The `input` parameter has these properties:

```javascript
// input.readDirectory  -- Absolute path to input directory
// input.writeDirectory -- Absolute path to output directory
// input.globs          -- Glob patterns from cyan.yaml (array of CyanGlob)
// input.config         -- Configuration passed from template
```

## CyanFileHelper -- The Primary API

The `fileHelper` parameter is the primary interface for working with files:

### resolveAll() -- Start Here

Call `fileHelper.resolveAll()` first. It automatically handles **all glob types**:

- `GlobType.Template` (0) globs: reads files and returns them as `VirtualFile[]` for transformation
- `GlobType.Copy` (1) globs: automatically copies files to the write directory

**You do NOT need to manually check glob type or call `copy()` yourself.** The processor author does NOT manually check glob type — `resolveAll()` handles both cases:

```javascript
const files = fileHelper.resolveAll();
// files -- array of VirtualFile objects available for transformation
// Copy globs are already handled; Template globs are returned for processing
```

### read(glob) -- Read Specific Files

```javascript
const files = fileHelper.read(input.globs[0]);
// files -- array of VirtualFile objects matching a specific CyanGlob
```

### get(glob) -- Lazy References

```javascript
const refs = fileHelper.get(input.globs[0]);
// refs -- array of VirtualFileReference objects (lazy, call .readFile() to materialize)
for (const ref of refs) {
  const file = ref.readFile();
  // file -- VirtualFile object
}
```

### readDir / writeDir -- Resolved Directory Paths

```javascript
const readDir = fileHelper.readDir; // string
const writeDir = fileHelper.writeDir; // string
```

## VirtualFile -- Manipulating Files

Each VirtualFile has these properties:

```javascript
// file.content  -- Read or write the file content (string)
// file.relative -- Path relative to read directory
// file.read     -- Absolute read path
// file.write    -- Absolute write path
// file.writeFile() -- Persist changes to write directory
```

### Example: Transform All Files

```javascript
const files = fileHelper.resolveAll();
for (const file of files) {
  file.content = file.content.replaceAll('{{name}}', config.name);
  file.writeFile();
}
```

### Example: Selective Processing

```javascript
const files = fileHelper.resolveAll();
for (const file of files) {
  if (file.relative.endsWith('.js')) {
    file.content = `// Header\n${file.content}`;
    file.writeFile();
  }
}
```

### Example: Lazy References

```javascript
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

### Example: Rename Files via `file.relative` Mutation

To change the output filename, mutate `file.relative` before calling `writeFile()`:

```javascript
const files = fileHelper.resolveAll();
for (const file of files) {
  if (file.relative.startsWith('src/')) {
    // Rename: strip 'src/' prefix -> 'lib/'
    file.relative = 'lib/' + file.relative.slice(4);
    file.writeFile();
  }
}
```

## Return Value

```javascript
return { directory: input.writeDirectory };
```

## Glob Types

```javascript
// CyanGlob: { root?: string, glob: string, type: GlobType, exclude: string[] }
// GlobType.Template = 0, GlobType.Copy = 1
```
