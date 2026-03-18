---
name: writing-resolver
description: Write or modify CyanPrint resolver code. Use when the user asks to change conflict resolution logic, modify merge strategies, handle file origins, or change resolution behavior. Covers entry point (StartResolverWithLambda), ResolverInput/ResolverOutput, ResolvedFile, and FileOrigin. Must ensure commutativity and associativity (sort, unique, deterministic ordering).
allowed-tools: Read, Grep, Glob, Write
---

# Writing this Resolver

## Entry Point

```typescript
import { StartResolverWithLambda, type ResolverInput, type ResolverOutput } from '@atomicloud/cyan-sdk';

StartResolverWithLambda(async (input: ResolverInput): Promise<ResolverOutput> => {
  // Resolve conflict
  return { path, content };
});
```

## ResolverInput

```typescript
interface ResolverInput {
  config: Record<string, unknown>;
  files: ResolvedFile[];
}
```

## ResolvedFile

**All `files` entries have the same `path`** — that is the conflict being resolved:

```typescript
interface ResolvedFile {
  path: string;
  content: string;
  origin: FileOrigin;
}
```

## FileOrigin

```typescript
interface FileOrigin {
  template: string; // Which template produced this file
  layer: number; // Layer number — IMPORTANT: number, NOT string
}
```

**Critical**: `layer` is a `number`, not a string. Compare numerically, never as string.

## ResolverOutput

Return a single resolved file:

```typescript
interface ResolverOutput {
  path: string; // Same path as input files
  content: string; // Resolved content
}
```

## Commutativity and Associativity

CyanPrint may call the resolver with files in **any order**. Your result must be **identical** regardless of input ordering.

### Pattern 1: Sort before processing

```typescript
const sorted = [...input.files].sort((a, b) => {
  if (a.origin.layer !== b.origin.layer) return a.origin.layer - b.origin.layer;
  return a.origin.template.localeCompare(b.origin.template);
});
```

### Pattern 2: Deduplicate after merge

```typescript
const allItems = sorted.flatMap(f => JSON.parse(f.content).items);
const unique = [...new Set(allItems)].sort();
```

### Pattern 3: Deterministic priority

```typescript
// Highest layer number wins — deterministic regardless of input order
const winner = input.files.reduce((best, f) => (f.origin.layer > best.origin.layer ? f : best));
```

## Resolution Strategies

### Last-Write Wins (by layer)

```typescript
const sorted = [...input.files].sort((a, b) => a.origin.layer - b.origin.layer);
const last = sorted[sorted.length - 1];
return { path: last.path, content: last.content };
```

### Deep Merge (JSON)

```typescript
const sorted = [...input.files].sort((a, b) => a.origin.layer - b.origin.layer);
let merged = {};
for (const file of sorted) {
  merged = deepMerge(merged, JSON.parse(file.content));
}
return { path: input.files[0].path, content: JSON.stringify(merged, null, 2) };
```

## Multi-Language Entry Points

See [reference.md](./reference.md) for complete entry point skeletons in TypeScript, JavaScript, Python, and C#.
