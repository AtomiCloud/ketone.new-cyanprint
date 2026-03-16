---
name: writing-template
description: Guide for writing CyanPrint templates
---

# Writing CyanPrint Templates

## Overview

This guide explains how to write CyanPrint templates - the primary artifact type that generates project scaffolding.

## Template Architecture

### Entry Point

All templates use `StartTemplateWithLambda` as their entry point:

**TypeScript:**

```typescript
import { StartTemplateWithLambda, type IInquirer, type IDeterminism, type Cyan } from '@atomicloud/cyan-sdk';

StartTemplateWithLambda(async (inquirer: IInquirer, determinism: IDeterminism): Promise<Cyan> => {
  // Your template logic here
});
```

**Python:**

```python
from cyan_sdk import start_template_with_fn, IInquirer, Cyan

def template_logic(inquirer: IInquirer, determinism: IDeterminism) -> Cyan:
    # Your template logic here
    pass

start_template_with_fn(template_logic)
```

**C#:**

```csharp
using Atomicloud.CyanSDK;

Cyan TemplateLogic(IInquirer inquirer, IDeterminism determinism)
{
    // Your template logic here
}

CyanEngine.StartTemplate(TemplateLogic);
```

### Core Types

#### Cyan

The main configuration object returned by your template:

```typescript
interface Cyan {
  processors: Processor[]; // Processors to run on template files
  plugins: Plugin[]; // Plugins to validate/transform output
  resolvers?: Resolver[]; // Resolvers for multi-origin file conflicts
}
```

#### CyanGlob

Defines file groups to process:

```typescript
interface CyanGlob {
  root: string; // Source directory relative to template root
  glob: string; // Glob pattern to match files (e.g., "**/*")
  exclude: string[]; // Patterns to exclude
  type: GlobType; // How to handle matched files
}
```

#### GlobType

- `GlobType.Template` - Process files through the template engine (replace `{{ variables }}`)
- `GlobType.Copy` - Copy files as-is without processing

#### IInquirer

Interface for prompting users:

```typescript
interface IInquirer {
  // Ask a text question
  text(options: {
    message: string;
    id: string; // Unique key for the answer (used in templates)
    desc?: string; // Optional description
    type: QuestionType;
    validate?: (input: string) => string | null;
  }): Promise<string>;

  // Ask a selection question
  select(message: string, options: string[], id: string): Promise<string>;
}
```

### Variable Syntax

Templates use double-brace syntax for variables:

```
{{ variable_name }}
```

For language-specific comment prefixes:

```
// {{ variable_name }}    // JavaScript/TypeScript
# {{ variable_name }}     // Python/Shell
// {{ variable_name }}    // C#
```

## Default Processor

All templates use `cyan/default` as the default processor. This processor handles:

- Variable substitution using `{{ }}` syntax
- File templating based on `CyanGlob` configurations
- Standard parser configuration

Example configuration:

```typescript
{
  processors: [
    {
      name: 'cyan/default',
      files: [
        {
          root: 'template/typescript',
          glob: '**/*',
          type: GlobType.Template,
          exclude: [],
        },
      ],
      config: {
        vars: {
          username: 'myuser',
          name: 'my-template',
          // ... other variables
        },
        parser: {
          varSyntax: [['{{', '}}']],
        },
      },
    },
  ],
  plugins: [],
}
```

## Searching the CyanPrint Registry

### API Endpoints

The CyanPrint registry API is available at:

```
https://api.zinc.sulfone.raichu.cluster.atomi.cloud/api/v1/
```

### Search for Artifacts

Search for templates, processors, plugins, or resolvers:

```
GET /api/v1/{Type}?Search=<query>&Limit=<n>&Skip=<n>
```

Types: `Template`, `Processor`, `Plugin`, `Resolver`

Example:

```bash
curl "https://api.zinc.sulfone.raichu.cluster.atomi.cloud/api/v1/Processor?Search=license&Limit=10"
```

### Get Artifact Details by Slug

```
GET /api/v1/{Type}/slug/{username}/{name}
```

Returns full details including README documentation.

Example:

```bash
curl "https://api.zinc.sulfone.raichu.cluster.atomi.cloud/api/v1/Processor/slug/cyan/license"
```

### Browse Registry Web Interface

Visit https://cyanprint.dev/registry to visually browse available artifacts.

## Best Practices

1. **Use descriptive question IDs**: The `id` field in `IInquirer` calls becomes the variable key in templates. Use a consistent prefix (e.g., `my-template/username`).

2. **Validate user input**: Always provide validation functions for user prompts to catch errors early.

3. **Organize files by type**: Use `GlobType.Template` for files that need variable substitution, `GlobType.Copy` for static files.

4. **Document your template**: Create a clear README that explains what the template generates and what questions it asks.

5. **Test your template**: Use `test.cyan.yaml` to define deterministic test cases.

## Example Template Structure

```
my-template/
├── cyan/
│   ├── index.ts          # Entry point
│   ├── src/
│   │   └── prompts.ts    # User prompts
│   ├── package.json
│   └── tsconfig.json
├── template/
│   ├── typescript/       # TypeScript template files
│   ├── javascript/       # JavaScript template files
│   └── common/           # Shared files
├── cyan.yaml             # Template metadata
├── test.cyan.yaml        # Test configuration
└── README.md
```
