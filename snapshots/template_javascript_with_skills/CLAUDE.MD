# CLAUDE.md - CyanPrint Template

This file provides guidance to Claude Code when working with CyanPrint templates.

## Project Overview

This is a CyanPrint template project. CyanPrint templates generate project scaffolding by prompting users for information and producing customized file structures.

## Key Files

```
├── cyan/
│   ├── index.ts              # Template entry point - StartTemplateWithLambda
│   ├── src/
│   │   ├── standard.ts       # Standard prompting logic
│   │   └── *.ts              # Additional template logic
│   ├── package.json          # Dependencies (@atomicloud/cyan-sdk)
│   └── tsconfig.json         # TypeScript configuration
├── template/                  # Template artifact files (language-specific)
│   ├── typescript/
│   ├── javascript/
│   ├── python/
│   ├── dotnet/
│   └── common/
├── cyan.yaml                 # Template metadata and configuration
├── cyan/Dockerfile           # Template runtime container
├── cyan/blob.Dockerfile      # Blob storage container
└── test.cyan.yaml            # Test configuration
```

## Development Workflow

### 1. Edit Template Files

Modify files in `template/` directories to change what gets generated.

### 2. Test Locally

```bash
# Run template tests
cyanprint test template

# Run specific test case
cyanprint test template --case "test-name"
```

### 3. Publish

```bash
# Build and push template to registry
cyanprint push template --build
```

## SDK Types

### Cyan

Main configuration object returned by template:

```typescript
interface Cyan {
  processors: Processor[];   // Processors to run
  plugins: Plugin[];         // Plugins to validate/transform
  resolvers?: Resolver[];    // Resolvers for conflicts
}
```

### CyanGlob

File group definition:

```typescript
interface CyanGlob {
  root: string;        // Source directory
  glob: string;        // Glob pattern (e.g., "**/*")
  exclude: string[];   // Patterns to exclude
  type: GlobType;      // Template | Copy
}
```

### GlobType

- `GlobType.Template` - Process with variable substitution
- `GlobType.Copy` - Copy files as-is

### IInquirer

User prompting interface:

```typescript
interface IInquirer {
  text(options: TextOptions): Promise<string>;
  select(message: string, options: string[], id: string): Promise<string>;
}
```

## Build/Push

### cyan.yaml Build Section

```yaml
build:
  blob: ghcr.io/username/template-blob
  template: ghcr.io/username/template-image
```

### Push Commands

```bash
# Build and push
cyanprint push template --build

# Push only (no build)
cyanprint push template
```

## Testing

### test.cyan.yaml Format

```yaml
test_cases:
  - name: "basic-test"
    description: "Basic template test"
    answer_state:
      cyan/new/create: Template
      cyan/new/language: Typescript
      cyan/new/skills: yes
      cyan/new/username: testuser
      cyan/new/name: test-project
      cyan/new/description: A test template
      cyan/new/email: test@example.com
      cyan/new/project: https://example.com/project
      cyan/new/source: https://github.com/example/project
    deterministic_state:
      cyan/new/more-tags/0: no
    validate:
      - command: "test -f README.md"
        description: "README exists"
```

### Run Tests

```bash
cyanprint test template
cyanprint test template --verbose
cyanprint test template --update-snapshots
```

## Project Structure

```
{template-name}/
├── cyan/                     # Template processor code
│   ├── index.ts             # Entry point
│   └── src/                 # Supporting modules
├── template/                 # Generated output templates
│   ├── {language}/          # Language-specific scaffolding
│   └── common/              # Shared files
├── .claude/
│   └── skills/              # Claude Code skills (optional)
├── cyan.yaml                # Metadata
├── CLAUDE.md                # This file
└── test.cyan.yaml           # Tests
```

## Variable Syntax

Templates use double-brace syntax:

```
{{ variable_name }}
```

With comment prefixes:

```
// {{ variable_name }}    # TypeScript/JavaScript/C#
# {{ variable_name }}     # Python/Shell
```

## Registry

- Browse: https://cyanprint.dev/registry
- API: `https://api.zinc.sulfone.raichu.cluster.atomi.cloud/api/v1/`
