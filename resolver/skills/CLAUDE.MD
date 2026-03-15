# CLAUDE.md - CyanPrint Resolver

This file provides guidance to Claude Code when working with CyanPrint resolvers.

## Project Overview

This is a CyanPrint resolver project. Resolvers handle conflicts when multiple templates or layers contribute files to the same path, determining the final content.

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
cyanprint test resolver

# Run specific test case
cyanprint test resolver --case "test-name"
```

### 3. Publish

```bash
# Build and push resolver to registry
cyanprint push resolver --build
```

## SDK Types

### ResolverInput

```typescript
interface IResolverInput {
  config: Record<string, any>;  // Configuration from template
  files: ResolverFile[];        // Conflicting files from different origins
}

interface ResolverFile {
  path: string;           // File path (same for all conflicts)
  content: string;        // File content
  origin: FileOrigin;     // Where the file came from
}

interface FileOrigin {
  template?: string;      // Template name
  layer?: string;         // Layer name
}
```

### ResolverOutput

```typescript
interface IResolverOutput {
  path: string;     // Output path
  content: string;  // Resolved content
}
```

### Entry Point

**TypeScript:**
```typescript
StartResolverWithLambda(async (input: IResolverInput): Promise<IResolverOutput> => {
  // Resolve conflict
  return { path, content };
});
```

**Python:**
```python
def resolver_logic(input: ResolverInput) -> ResolverOutput:
    return ResolverOutput(path=path, content=content)

start_resolver_with_fn(resolver_logic)
```

**C#:**
```csharp
ResolverOutput ResolverLogic(ResolverInput input)
{
    return new ResolverOutput { Path = path, Content = content };
}

CyanEngine.StartResolver(ResolverLogic);
```

## Resolution Strategies

### Last-Write Wins

```typescript
const lastFile = input.files[input.files.length - 1];
return { path: lastFile.path, content: lastFile.content };
```

### Priority-Based

```typescript
const priorityOrder = input.config.priority ?? ['custom', 'extended', 'base'];
for (const priority of priorityOrder) {
  const file = input.files.find(f =>
    f.origin.template?.includes(priority) || f.origin.layer?.includes(priority)
  );
  if (file) return { path: file.path, content: file.content };
}
```

### Deep Merge (JSON)

```typescript
let merged = {};
for (const file of input.files) {
  merged = deepMerge(merged, JSON.parse(file.content));
}
return { path, content: JSON.stringify(merged, null, 2) };
```

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
    description: "Test JSON merge"
    resolver_inputs:
      - path: "package.json"
        content: '{"name": "base"}'
        origin:
          template: "base"
      - path: "package.json"
        content: '{"version": "1.0.0"}'
        origin:
          template: "extended"
    config:
      strategy: deep-merge
    snapshots:
      - path: "package.json"
        name: "merged-output"
```

### Run Tests

```bash
cyanprint test resolver
cyanprint test resolver --verbose
cyanprint test resolver --update-snapshots
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
      preserveKeys:
        - name
        - version
```

## Registry

- Browse: https://cyanprint.dev/registry
- API: `https://api.zinc.sulfone.raichu.cluster.atomi.cloud/api/v1/Resolver`
