# CLAUDE.md - CyanPrint Plugin

This file provides guidance to Claude Code when working with CyanPrint plugins.

## Project Overview

This is a CyanPrint plugin project. Plugins validate or transform the final output of CyanPrint templates, receiving the entire generated directory structure.

## Key Files

```
├── cyan/
│   ├── index.ts              # Plugin entry point - StartPluginWithLambda
│   ├── src/
│   │   └── *.ts              # Plugin logic modules
│   ├── package.json          # Dependencies (@atomicloud/cyan-sdk)
│   └── tsconfig.json         # TypeScript configuration
├── plugin/                    # Plugin artifact files (language-specific)
│   ├── typescript/
│   ├── javascript/
│   ├── python/
│   ├── dotnet/
│   └── common/
├── cyan.yaml                 # Plugin metadata and configuration
├── cyan/Dockerfile           # Plugin runtime container
├── cyan/blob.Dockerfile      # Blob storage container
└── test.cyan.yaml            # Test configuration
```

## Development Workflow

### 1. Edit Plugin Files

Modify files in `plugin/` directories to change validation/transformation behavior.

### 2. Test Locally

```bash
# Run plugin tests
cyanprint test plugin

# Run specific test case
cyanprint test plugin --case "test-name"
```

### 3. Publish

```bash
# Build and push plugin to registry
cyanprint push plugin --build
```

## SDK Types

### PluginInput

```typescript
interface IPluginInput {
  config: Record<string, any>;  // Configuration from template
  readDir: (path: string) => Promise<string[]>;
  readFile: (path: string) => Promise<string>;
  fileExists: (path: string) => Promise<boolean>;
}
```

### PluginOutput

```typescript
interface IPluginOutput {
  errors?: PluginError[];      // Validation errors (fails build)
  warnings?: PluginWarning[];  // Warnings (non-blocking)
  records?: PluginRecord[];    // Modified files
}

interface PluginError {
  path: string;
  message: string;
  line?: number;
  column?: number;
}

interface PluginWarning {
  path: string;
  message: string;
  line?: number;
  column?: number;
}

interface PluginRecord {
  path: string;
  content: string;
}
```

### Entry Point

**TypeScript:**
```typescript
StartPluginWithLambda(async (input: IPluginInput): Promise<IPluginOutput> => {
  // Validate or transform
  return { errors, warnings, records };
});
```

**Python:**
```python
def plugin_logic(input: PluginInput) -> PluginOutput:
    return PluginOutput(errors=errors, warnings=warnings, records=records)

start_plugin_with_fn(plugin_logic)
```

**C#:**
```csharp
PluginOutput PluginLogic(PluginInput input)
{
    return new PluginOutput { Errors = errors, Warnings = warnings, Records = records };
}

CyanEngine.StartPlugin(PluginLogic);
```

## Plugin Types

### Validation Plugins

Check output without modifying files:

```typescript
const errors: PluginError[] = [];

if (!await input.fileExists('README.md')) {
  errors.push({
    path: 'README.md',
    message: 'README.md is required'
  });
}

return { errors };
```

### Transformation Plugins

Modify output files:

```typescript
const records: PluginRecord[] = [];

const content = await input.readFile('src/index.ts');
records.push({
  path: 'src/index.ts',
  content: transformContent(content)
});

return { records };
```

## Build/Push

### cyan.yaml Build Section

```yaml
build:
  blob: ghcr.io/username/plugin-blob
  plugin: ghcr.io/username/plugin-image
```

### Push Commands

```bash
# Build and push
cyanprint push plugin --build

# Push only (no build)
cyanprint push plugin
```

## Testing

### test.cyan.yaml Format

```yaml
test_cases:
  - name: "validation-test"
    description: "Test validation logic"
    input:
      - path: "README.md"
        content: "# Project"
    config:
      requireReadme: true
    expect:
      errors: []
      warnings: []
```

### Run Tests

```bash
cyanprint test plugin
cyanprint test plugin --verbose
cyanprint test plugin --update-snapshots
```

## Project Structure

```
{plugin-name}/
├── cyan/                     # Plugin code
│   ├── index.ts             # Entry point
│   └── src/                 # Supporting modules
├── plugin/                   # Plugin implementation templates
│   ├── {language}/          # Language-specific implementations
│   └── common/              # Shared files
├── .claude/
│   └── skills/              # Claude Code skills (optional)
├── cyan.yaml                # Metadata
├── CLAUDE.md                # This file
└── test.cyan.yaml           # Tests
```

## Using in Templates

Reference plugin in template's cyan.yaml:

```yaml
plugins:
  - name: username/plugin-name
    config:
      option1: value1
      option2: value2
```

## Registry

- Browse: https://cyanprint.dev/registry
- API: `https://api.zinc.sulfone.raichu.cluster.atomi.cloud/api/v1/Plugin`
