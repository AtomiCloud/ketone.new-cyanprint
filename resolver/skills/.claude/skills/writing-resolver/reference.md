# CyanPrint Resolver SDK Reference

## Type Definitions

### TypeScript / JavaScript

```typescript
// Package: @atomicloud/cyan-sdk

interface ResolverInput {
  config: Record<string, unknown>;
  files: ResolvedFile[];
}

interface ResolvedFile {
  path: string;
  content: string;
  origin: FileOrigin;
}

interface FileOrigin {
  template: string;
  layer: number; // IMPORTANT: number, NOT string
}

interface ResolverOutput {
  path: string;
  content: string;
}
```

### Python

```python
# Package: cyanprintsdk

class FileOrigin:
    template: str
    layer: int  # IMPORTANT: int, NOT str

class ResolvedFile:
    path: str
    content: str
    origin: FileOrigin

class ResolverInput:
    config: dict
    files: list[ResolvedFile]

class ResolverOutput:
    path: str
    content: str
```

### C#

```csharp
// Package: sulfone_helium

public class FileOrigin
{
    public string Template { get; set; }
    public int Layer { get; set; }  // IMPORTANT: int, NOT string
}

public class ResolvedFile
{
    public string Path { get; set; }
    public string Content { get; set; }
    public FileOrigin Origin { get; set; }
}

public class ResolverInput
{
    public Dictionary<string, object> Config { get; set; }
    public List<ResolvedFile> Files { get; set; }
}

public class ResolverOutput
{
    public string Path { get; set; }
    public string Content { get; set; }
}
```

## Entry Point Skeletons

### TypeScript

```typescript
import { StartResolverWithLambda } from '@atomicloud/cyan-sdk';
import type { ResolverInput, ResolverOutput } from '@atomicloud/cyan-sdk';

StartResolverWithLambda(async (input: ResolverInput): Promise<ResolverOutput> => {
  const { config, files } = input;
  // All files have the same path — resolve the conflict
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

### JavaScript

```javascript
const { StartResolverWithLambda } = require('@atomicloud/cyan-sdk');

StartResolverWithLambda(async input => {
  const { config, files } = input;
  const path = files[0].path;

  // Sort for commutativity
  const sorted = [...files].sort((a, b) => {
    if (a.origin.layer !== b.origin.layer) return a.origin.layer - b.origin.layer;
    return a.origin.template.localeCompare(b.origin.template);
  });

  // TODO: Implement resolution logic
  const content = sorted[sorted.length - 1].content;

  return { path, content };
});
```

### Python

```python
from cyanprintsdk import start_resolver_with_fn

def resolver_fn(input):
    config = input.config
    files = input.files
    path = files[0].path

    # Sort for commutativity (layer ascending, then template name)
    sorted_files = sorted(files, key=lambda f: (f.origin.layer, f.origin.template))

    # TODO: Implement resolution logic
    content = sorted_files[-1].content

    return {"path": path, "content": content}

start_resolver_with_fn(resolver_fn)
```

### C#

```csharp
using sulfone_helium;

ResolverOutput ResolverFn(ResolverInput input)
{
    var files = input.Files;
    var path = files[0].Path;

    // Sort for commutativity (layer ascending, then template name)
    var sorted = files
        .OrderBy(f => f.Origin.Layer)
        .ThenBy(f => f.Origin.Template)
        .ToList();

    // TODO: Implement resolution logic
    var content = sorted.Last().Content;

    return new ResolverOutput { Path = path, Content = content };
}

CyanEngine.StartResolver(ResolverFn);
```

## Commutativity and Associativity Patterns

### Why it matters

CyanPrint may invoke the resolver with conflicting files in **any order**. The resolver must produce **identical output** regardless of input ordering. This is the commutativity requirement.

When resolving more than two files, CyanPrint may also resolve them in pairs. The resolver must produce the same result regardless of how pairs are grouped. This is the associativity requirement.

### Pattern 1: Sort before processing

Always sort input files by a deterministic key before any processing:

```typescript
const sorted = [...input.files].sort((a, b) => {
  if (a.origin.layer !== b.origin.layer) return a.origin.layer - b.origin.layer;
  return a.origin.template.localeCompare(b.origin.template);
});
```

### Pattern 2: Deduplicate after merge

When concatenating or merging arrays, deduplicate and sort the result:

```typescript
// Concatenate arrays from all files, then deduplicate and sort
const allItems = sorted.flatMap(f => JSON.parse(f.content).items);
const unique = [...new Set(allItems)].sort();
```

### Pattern 3: Deterministic priority

Never rely on input array order. Define explicit priority using `layer` number or config:

```typescript
// Highest layer number wins — deterministic regardless of input order
const winner = input.files.reduce((best, f) => (f.origin.layer > best.origin.layer ? f : best));
```

### Pattern 4: Stable deep merge

For deep merging objects, process files in sorted order so later files consistently override earlier ones:

```typescript
const sorted = [...input.files].sort((a, b) => a.origin.layer - b.origin.layer);
let merged = {};
for (const file of sorted) {
  merged = deepMerge(merged, JSON.parse(file.content));
}
// Higher layer numbers override lower ones, deterministically
```

## Key Rules

1. **All `files` entries have the same `path`** — that is the conflict being resolved
2. **`FileOrigin.layer` is a `number`** — compare numerically, never as string
3. **Return a single `{ path, content }`** — the resolved file
4. **Ensure commutativity** — sort inputs before processing, deduplicate outputs
5. **Ensure associativity** — result must be same whether resolved all-at-once or in pairs
