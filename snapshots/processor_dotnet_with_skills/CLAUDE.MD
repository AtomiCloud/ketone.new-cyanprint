# CLAUDE.md - CyanPrint Processor

This file provides guidance to Claude Code when working with CyanPrint processors.

## Project Overview

This is a CyanPrint processor project. Processors transform template files during CyanPrint execution. The processor lambda receives two parameters: `CyanProcessorInput` and `CyanFileHelper`.

## Key Files

```
├── cyan/
│   ├── index.ts              # Processor entry point - StartProcessorWithLambda
│   ├── src/
│   │   └── *.ts              # Processor logic modules
│   ├── package.json          # Dependencies (@atomicloud/cyan-sdk)
│   └── tsconfig.json         # TypeScript configuration
├── processor/                 # Processor artifact files (language-specific)
│   ├── typescript/
│   ├── javascript/
│   ├── python/
│   ├── dotnet/
│   └── common/
├── cyan.yaml                 # Processor metadata and configuration
├── cyan/Dockerfile           # Processor runtime container
├── cyan/blob.Dockerfile      # Blob storage container
└── test.cyan.yaml            # Test configuration
```

## Development Workflow

### 1. Edit Processor Files

Modify files in `processor/` directories to change transformation behavior.

### 2. Test Locally

```bash
# Run processor tests
cyanprint test processor .

# Run specific test case
cyanprint test processor . --case "test-name"
```

### 3. Publish

```bash
# Build and push processor to registry
cyanprint push processor --build
```

## SDK Types

### Entry Point (TWO parameters)

```typescript
StartProcessorWithLambda(
  async (input: CyanProcessorInput, fileHelper: CyanFileHelper): Promise<ProcessorOutput> => {
    // Process files
    return { directory: input.writeDirectory };
  }
);
```

### CyanProcessorInput

```typescript
interface CyanProcessorInput {
  readDirectory: string;   // Absolute path to input directory
  writeDirectory: string;  // Absolute path to output directory
  globs: CyanGlob[];      // Glob patterns from cyan.yaml
  config: unknown;         // Configuration from template
}
```

### CyanFileHelper

The primary API for working with files:

```typescript
interface CyanFileHelper {
  resolveAll(): VirtualFile[];                // Read all Template globs, copy all Copy globs — call this first
  read(glob: CyanGlob): VirtualFile[];        // Read files matching a specific glob
  get(glob: CyanGlob): VirtualFileReference[]; // Lazy references, call .readFile() to materialize
  copy(glob: CyanGlob): void;                 // Copy files as-is from read dir to write dir
  readDir: string;                            // Resolved read directory path
  writeDir: string;                           // Resolved write directory path
}
```

### VirtualFile

```typescript
interface VirtualFile {
  content: string;   // Read or write the file content
  relative: string;  // Path relative to read directory
  read: string;      // Absolute read path
  write: string;     // Absolute write path
  writeFile(): void; // Persist changes to write directory
}
```

### ProcessorOutput

```typescript
interface ProcessorOutput {
  directory: string;  // Return input.writeDirectory
}
```

### Multi-Language Entry Points

**Python:**
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

**C#:**
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

## Build/Push

### cyan.yaml Build Section

```yaml
build:
  blob: ghcr.io/username/processor-blob
  processor: ghcr.io/username/processor-image
```

### Push Commands

```bash
# Build and push
cyanprint push processor --build

# Push only (no build)
cyanprint push processor
```

## Testing

### test.cyan.yaml Format

```yaml
test_cases:
  - name: "transform-test"
    description: "Test file transformation"
    input:
      - path: "src/index.ts"
        content: "export function hello() {}"
    config:
      # Keys must match actual config keys from the entry point
      prefix: "// Generated\n"
    snapshots:
      - path: "src/index.ts"
        name: "transformed-output"
    validate:
      - command: "grep -q 'Generated' src/index.ts"
```

### Run Tests

```bash
cyanprint test processor .
cyanprint test processor . --verbose
cyanprint test processor . --update-snapshots
```

## Project Structure

```
{processor-name}/
├── cyan/                     # Processor code
│   ├── index.ts             # Entry point
│   └── src/                 # Supporting modules
├── processor/                # Processor implementation templates
│   ├── {language}/          # Language-specific implementations
│   └── common/              # Shared files
├── .claude/
│   └── skills/              # Claude Code skills (optional)
├── cyan.yaml                # Metadata
├── CLAUDE.md                # This file
└── test.cyan.yaml           # Tests
```

## Using in Templates

Reference processor in template's cyan.yaml:

```yaml
processors:
  - name: username/processor-name
    config:
      option1: value1
      option2: value2
```

## Registry

- Browse: https://cyanprint.dev/registry
- API: `https://api.zinc.sulfone.raichu.cluster.atomi.cloud/api/v1/Processor`
