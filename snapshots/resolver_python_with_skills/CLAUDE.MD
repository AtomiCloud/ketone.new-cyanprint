# CLAUDE.md - CyanPrint Resolver

This file provides guidance to Claude Code when working with CyanPrint resolvers.

## Project Overview

This is a CyanPrint resolver project. Resolvers handle conflicts when multiple templates or layers contribute files to the same path. They receive all conflicting files and produce a single resolved output.

## Key Files

```
├── cyan/
│   ├── index.ts              # Resolver entry point - StartResolverWithLambda
│   ├── src/
│   │   └── *.ts              # Resolver logic modules
│   ├── package.json          # Dependencies (@atomicloud/cyan-sdk)
│   └── tsconfig.json         # TypeScript configuration
├── resolver/                  # Resolver artifact files (language-specific)
│   ├── typescript/
│   ├── javascript/
│   ├── python/
│   ├── dotnet/
│   └── common/
├── cyan.yaml                 # Resolver metadata and configuration
├── cyan/Dockerfile           # Resolver runtime container
├── cyan/blob.Dockerfile      # Blob storage container
└── test.cyan.yaml            # Test configuration
```

## Development Workflow

### 1. Edit Resolver Files

Modify files in `resolver/` directories to change conflict resolution behavior.

### 2. Test Locally

```bash
# Run resolver tests
cyanprint test resolver .

# Run specific test case
cyanprint test resolver . --case "test-name"
```

### 3. Publish

```bash
# Build and push resolver to registry
cyanprint push resolver --build
```

## SDK Types

### ResolverInput

```typescript
interface ResolverInput {
  config: Record<string, unknown>;
  files: ResolvedFile[];
}
```

### ResolvedFile

**All `files` entries have the same `path`** — that is the conflict being resolved:

```typescript
interface ResolvedFile {
  path: string;
  content: string;
  origin: FileOrigin;
}
```

### FileOrigin

```typescript
interface FileOrigin {
  template: string;  // Which template produced this file
  layer: number;     // Layer number — number, NOT string
}
```

**Critical**: `layer` is a `number`, not a `string`. Compare numerically, never as string.

### ResolverOutput

```typescript
interface ResolverOutput {
  path: string;     // Same path as input files
  content: string;  // Resolved content
}
```

### Entry Point

**TypeScript:**
```typescript
StartResolverWithLambda(async (input: ResolverInput): Promise<ResolverOutput> => {
  const { config, files } = input;
  const path = files[0].path;
  // Resolve conflict
  return { path, content };
});
```

**Python:**
```python
from cyanprintsdk import start_resolver_with_fn

def resolver_fn(input):
    config = input.config
    files = input.files
    path = files[0].path
    # Resolve conflict
    return {"path": path, "content": content}

start_resolver_with_fn(resolver_fn)
```

**C#:**
```csharp
using sulfone_helium;

ResolverOutput ResolverFn(ResolverInput input)
{
    var files = input.Files;
    var path = files[0].Path;
    // Resolve conflict
    return new ResolverOutput { Path = path, Content = content };
}

CyanEngine.StartResolver(ResolverFn);
```

## Commutativity Requirements

CyanPrint may call the resolver with files in **any order**. The resolver must produce **identical output** regardless of input ordering.

- Sort inputs before processing (by `layer` number, then `template` name)
- Deduplicate arrays after concatenation
- Define deterministic priority when origins conflict

## Build/Push

### cyan.yaml Build Section

```yaml
build:
  blob: ghcr.io/username/resolver-blob
  resolver: ghcr.io/username/resolver-image
```

### Push Commands

```bash
# Build and push
cyanprint push resolver --build

# Push only (no build)
cyanprint push resolver
```

## Testing

### test.cyan.yaml Format

```yaml
test_cases:
  - name: "merge-test"
    description: "Test conflict resolution"
    resolver_inputs:
      - path: "package.json"
        content: '{"name": "base"}'
        origin:
          template: "base"
          layer: 0
      - path: "package.json"
        content: '{"version": "1.0.0"}'
        origin:
          template: "extended"
          layer: 1
    config:
      strategy: deep-merge
    snapshots:
      - path: "package.json"
        name: "merged-output"
```

**Important**: In `resolver_inputs`, all entries have the same `path` and `layer` is a number (not quoted).

### Run Tests

```bash
cyanprint test resolver .
cyanprint test resolver . --verbose
cyanprint test resolver . --update-snapshots
```

## Project Structure

```
{resolver-name}/
├── cyan/                     # Resolver code
│   ├── index.ts             # Entry point
│   └── src/                 # Supporting modules
├── resolver/                 # Resolver implementation templates
│   ├── {language}/          # Language-specific implementations
│   └── common/              # Shared files
├── .claude/
│   └── skills/              # Claude Code skills (optional)
├── cyan.yaml                # Metadata
├── CLAUDE.md                # This file
└── test.cyan.yaml           # Tests
```

## Using in Templates

Reference resolver in template's cyan.yaml:

```yaml
resolvers:
  - name: username/resolver-name
    config:
      strategy: deep-merge
```

## Registry

- Browse: https://cyanprint.dev/registry
- API: `https://api.zinc.sulfone.raichu.cluster.atomi.cloud/api/v1/Resolver`
