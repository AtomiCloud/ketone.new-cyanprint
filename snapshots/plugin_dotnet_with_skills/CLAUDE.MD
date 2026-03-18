# CLAUDE.md - CyanPrint Plugin

This file provides guidance to Claude Code when working with CyanPrint plugins.

## Project Overview

This is a CyanPrint plugin project. Plugins validate or transform the final output of CyanPrint templates. Plugins receive the generated output directory and use native OS operations for file I/O and command execution.

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
cyanprint test plugin .

# Run specific test case
cyanprint test plugin . --case "test-name"
```

### 3. Publish

```bash
# Build and push plugin to registry
cyanprint push plugin --build
```

## SDK Types

### PluginInput

Plugins receive a single input object with directory and config:

```typescript
interface PluginInput {
  directory: string;  // Absolute path to the generated output directory
  config: unknown;    // Configuration from template's cyan.yaml
}
```

**Important**: There are NO SDK file helper methods on PluginInput. Use native OS operations (fs, pathlib, System.IO).

### PluginOutput

```typescript
interface PluginOutput {
  directory: string;  // Return the directory path (typically input.directory)
}
```

### Entry Point

**TypeScript:**
```typescript
StartPluginWithLambda(async (input: PluginInput): Promise<PluginOutput> => {
  // Use native fs for file I/O
  return { directory: input.directory };
});
```

**Python:**
```python
from cyanprintsdk import start_plugin_with_fn

def plugin_logic(input) -> PluginOutput:
    # Use pathlib / open() for file I/O
    return PluginOutput(directory=input.directory)

start_plugin_with_fn(plugin_logic)
```

**C#:**
```csharp
using sulfone_helium;

PluginOutput PluginLogic(PluginInput input)
{
    // Use System.IO for file I/O
    return new PluginOutput { Directory = input.Directory };
}

CyanEngine.StartPlugin(PluginLogic);
```

## Native File I/O

Plugins use OS-native operations:

| Operation | TypeScript | Python | C# |
|-----------|-----------|--------|-----|
| Read file | `fs.readFileSync(path, 'utf-8')` | `Path(path).read_text()` | `File.ReadAllText(path)` |
| Write file | `fs.writeFileSync(path, content)` | `Path(path).write_text(content)` | `File.WriteAllText(path, content)` |
| Check exists | `fs.existsSync(path)` | `Path(path).exists()` | `File.Exists(path)` |
| List directory | `fs.readdirSync(path)` | `list(Path(path).iterdir())` | `Directory.GetFiles(path)` |
| Run command | `execSync(cmd, { cwd })` | `subprocess.run(cmd, cwd=)` | `Process.Start()` |

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
      - path: "package.json"
        content: '{"name": "test"}'
    config:
      # Keys must match actual config keys from the entry point
      requireReadme: true
    expect:
      errors: []
      warnings: []
```

### Run Tests

```bash
cyanprint test plugin .
cyanprint test plugin . --verbose
cyanprint test plugin . --update-snapshots
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
