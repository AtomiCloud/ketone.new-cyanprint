---
name: writing-resolver-javascript
description: Write or modify CyanPrint resolver code in JavaScript. Use when the user asks to change conflict resolution logic, modify merge strategies, handle file origins, or change resolution behavior. Covers entry point (StartResolverWithLambda), ResolverInput/ResolverOutput, ResolvedFile, and FileOrigin. Must ensure commutativity and associativity (sort, unique, deterministic ordering).
allowed-tools: Read, Grep, Glob, Write
---

# Writing this Resolver (JavaScript)

## Entry Point

```javascript
const { StartResolverWithLambda } = require('@atomicloud/cyan-sdk');

StartResolverWithLambda(async input => {
  // Resolve conflict
  return { path, content };
});
```

## ResolverInput

```javascript
// input.config: { [key: string]: unknown }
// input.files: ResolvedFile[]
```

## ResolvedFile

**All `files` entries have the same `path`** -- that is the conflict being resolved:

```javascript
// file.path: string
// file.content: string
// file.origin: FileOrigin
```

## FileOrigin

```javascript
// file.origin.template: string  -- Which template produced this file
// file.origin.layer: number    -- Layer number -- IMPORTANT: number, NOT string
```

**Critical**: `layer` is a `number`, not a string. Compare numerically, never as string.

## ResolverOutput

Return a single resolved file:

```javascript
// { path: string, content: string }
```

## Commutativity and Associativity

CyanPrint may call the resolver with files in **any order**. Your result must be **identical** regardless of input ordering.

### Pattern 1: Sort before processing

```javascript
const sorted = [...input.files].sort((a, b) => {
  if (a.origin.layer !== b.origin.layer) return a.origin.layer - b.origin.layer;
  return a.origin.template.localeCompare(b.origin.template);
});
```

### Pattern 2: Deduplicate after merge

```javascript
const allItems = sorted.flatMap(f => JSON.parse(f.content).items);
const unique = [...new Set(allItems)].sort();
```

### Pattern 3: Deterministic priority

```javascript
// Highest layer number wins -- deterministic regardless of input order
const winner = input.files.reduce((best, f) => (f.origin.layer > best.origin.layer ? f : best));
```

## Resolution Strategies

### Last-Write Wins (by layer)

```javascript
const sorted = [...input.files].sort((a, b) => a.origin.layer - b.origin.layer);
const last = sorted[sorted.length - 1];
return { path: last.path, content: last.content };
```

### Deep Merge (JSON)

```javascript
const sorted = [...input.files].sort((a, b) => a.origin.layer - b.origin.layer);
let merged = {};
for (const file of sorted) {
  merged = deepMerge(merged, JSON.parse(file.content));
}
return { path: input.files[0].path, content: JSON.stringify(merged, null, 2) };
```

## Entry Point Skeleton

```javascript
const { StartResolverWithLambda } = require('@atomicloud/cyan-sdk');

StartResolverWithLambda(async input => {
  const { config, files } = input;
  if (files.length === 0) throw new Error('Resolver received no files — at least 1 file is required');
  const uniquePaths = new Set(files.map(f => f.path));
  if (uniquePaths.size > 1) throw new Error(`Resolver received files with different paths: ${[...uniquePaths].join(', ')} — all files must have the same path`);
  const path = files[0].path;

  // Sort for commutativity (layer ascending, then template name)
  const sorted = [...files].sort((a, b) => {
    if (a.origin.layer !== b.origin.layer) return a.origin.layer - b.origin.layer;
    return a.origin.template.localeCompare(b.origin.template);
  });

  // TODO: Implement resolution logic
  const content = sorted[sorted.length - 1].content;

  return { path, content };
});
```

## Key Rules

1. **All `files` entries have the same `path`** -- that is the conflict being resolved
2. **`FileOrigin.layer` is a `number`** -- compare numerically, never as string
3. **Return a single `{ path, content }`** -- the resolved file
4. **Ensure commutativity** -- sort inputs before processing, deduplicate outputs
5. **Ensure associativity** -- result must be same whether resolved all-at-once or in pairs
6. **Validate input** -- reject empty files list and mismatched paths with an error
