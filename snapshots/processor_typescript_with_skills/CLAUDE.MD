# CLAUDE.md - CyanPrint Processor

This file provides guidance to Claude Code when working with CyanPrint processors.

## Project Overview

This is a CyanPrint processor project. Processors transform template files during CyanPrint execution, receiving files and configuration, then outputting transformed content.

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
cyanprint test processor

# Run specific test case
cyanprint test processor --case "test-name"
```

### 3. Publish

```bash
# Build and push processor to registry
cyanprint push processor --build
```

## SDK Types

### ProcessorInput

```typescript
interface IProcessorInput {
  config: Record<string, any>;  // Configuration from template
  readDir: (path: string) => Promise<string[]>;
  readFile: (path: string) => Promise<string>;
  fileExists: (path: string) => Promise<boolean>;
}
```

### ProcessorOutput

```typescript
interface IProcessorOutput {
  records: ProcessorRecord[];
}

interface ProcessorRecord {
  path: string;     // Output file path
  content: string;  // File content
}
```

### Entry Point

**TypeScript:**
```typescript
StartProcessorWithLambda(async (input: IProcessorInput): Promise<IProcessorOutput> => {
  // Transform files
  return { records };
});
```

**Python:**
```python
def processor_logic(input: ProcessorInput) -> ProcessorOutput:
    return ProcessorOutput(records=records)

start_processor_with_fn(processor_logic)
```

**C#:**
```csharp
ProcessorOutput ProcessorLogic(ProcessorInput input)
{
    return new ProcessorOutput { Records = records };
}

CyanEngine.StartProcessor(ProcessorLogic);
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
      prefix: "// Generated\n"
    snapshots:
      - path: "src/index.ts"
        name: "transformed-output"
    validate:
      - command: "grep -q 'Generated' src/index.ts"
```

### Run Tests

```bash
cyanprint test processor
cyanprint test processor --verbose
cyanprint test processor --update-snapshots
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
