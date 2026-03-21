---
name: writing-template-typescript
description: Write or modify CyanPrint template code in TypeScript. Use when the user asks to add prompts, change template logic, modify the entry point, add processors/plugins/resolvers, or change generated output for a TypeScript template. Covers IInquirer question types (text, select, checkbox, confirm, password, dateSelect), processor configuration, and IDeterminism.
allowed-tools: Read, Grep, Glob, Write
---

# Writing this Template (TypeScript)

## Entry Point Structure

```typescript
import { StartTemplateWithLambda, type IInquirer, type IDeterminism, type Cyan, GlobType } from '@atomicloud/cyan-sdk';

StartTemplateWithLambda(async (i: IInquirer, d: IDeterminism): Promise<Cyan> => {
  const name = await i.text('Project name', 'name');
  const language = await i.select('Language', 'language', ['TypeScript', 'Python']);

  return {
    processors: [
      {
        name: 'cyan/default',
        files: [
          {
            root: `template/${language.toLowerCase()}`,
            glob: '**/*',
            exclude: [],
            type: GlobType.Template,
          },
        ],
        config: {
          vars: { name, language },
        },
      },
    ],
    plugins: [],
  };
});
```

## IInquirer -- Prompting Users

Six question types are available. Each has a simple form and a Q-form with additional options:

### text -- Free-text input

```typescript
// Simple form
const name = await i.text('What is the project name?', 'project-name');

// Q-form with validation and defaults
const name = await i.textQ({
  message: 'What is the project name?',
  id: 'project-name',
  validate: v => (/^[a-z0-9-]+$/.test(v) ? null : 'Use lowercase letters, numbers, and hyphens'),
  default: 'my-project',
  initial: 'my-project',
});
```

### select -- Single choice

```typescript
// Simple form
const lang = await i.select('What language?', 'language', ['TypeScript', 'Python', 'C#', 'JavaScript']);

// Q-form with labeled choices
const lang = await i.selectQ({
  message: 'What language?',
  id: 'language',
  choices: [
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'csharp', label: 'C#' },
    { value: 'javascript', label: 'JavaScript' },
  ],
});
```

### checkbox -- Multiple choices

```typescript
// Simple form
const features = await i.checkbox('Which features?', 'features', ['auth', 'logging', 'testing']);

// Q-form
const features = await i.checkboxQ({
  message: 'Which features?',
  id: 'features',
  choices: [
    { value: 'auth', label: 'Authentication' },
    { value: 'logging', label: 'Logging' },
    { value: 'testing', label: 'Testing' },
  ],
});
```

### confirm -- Yes/No

```typescript
// Simple form
const includeTests = await i.confirm('Include tests?', 'include-tests');

// Q-form
const includeTests = await i.confirmQ({
  message: 'Include tests?',
  id: 'include-tests',
  default: true,
  errorMessage: 'Please answer yes or no',
});
```

### password -- Secret input

```typescript
// Simple form
const apiKey = await i.password('Enter API key:', 'api-key');

// Q-form
const apiKey = await i.passwordQ({
  message: 'Enter API key:',
  id: 'api-key',
  confirmation: true,
});
```

### dateSelect -- Date picker

```typescript
// Simple form
const date = await i.dateSelect('Select release date:', 'release-date');

// Q-form
const date = await i.dateSelectQ({
  message: 'Select release date:',
  id: 'release-date',
  min: '2024-01-01',
  max: '2025-12-31',
  validate: v => (v > new Date() ? 'Date must be in the future' : null),
});
```

## IDeterminism -- Deterministic Values

Use `d.get()` for all prompt values to ensure deterministic test output:

```typescript
const name = await d.get('project-name', () => i.text('Project name?', 'project-name'));
```

In tests, `deterministic_state` provides values directly. In interactive mode, the fallback function runs.

### Why Determinism Matters

Each template script is executed multiple times — during generation, testing, and re-generation. Without `d.get()`, values from `Date.now()`, `Math.random()`, or other non-deterministic sources produce different output each time, breaking snapshot tests.

`d.get()` solves this by generating a random value on first execution and storing it. Subsequent executions return the stored value instead of generating a new one. This is why ALL prompt values should go through `d.get()`, not just the obviously random ones.

## Configuring the Default Processor

The default processor (`cyan/default`) supports these config options:

- `vars`: Template variables for substitution. Supports nested objects. These are substituted using the configured syntax.
- `flags`: Boolean flag variables. Supports nested objects. Useful for conditional template logic.
- `parser.varSyntax`: Custom delimiter pairs. Default is `{{` and `}}`. Pass as array of 2-element arrays, e.g., `[['{{', '}}']]`.

**Note**: Globbing is handled automatically by the processor via `fileHelper.resolveAll()`. You don't need to implement file matching yourself.

```typescript
{
  processors: [
    {
      name: 'cyan/default',
      files: [
        {
          root: 'template/typescript',
          glob: '**/*',
          type: GlobType.Template,  // Process {{var}} substitution
          exclude: [],
        },
        {
          root: 'template/common',
          glob: '**/*',
          type: GlobType.Copy,       // Copy files as-is
          exclude: [],
        },
      ],
      config: {
        vars: {
          username: username,
          name: projectName,
          description: projectDesc,
        },
        flags: {
          includeTests: true,
          enableAuth: false,
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

## Adding Plugins

```typescript
{
  processors: [...],
  plugins: [
    {
      name: 'username/plugin-name',
      config: { /* plugin-specific config */ },
    },
  ],
}
```

## Finding Processors, Plugins, and Resolvers

Browse available artifacts:

- **Registry**: https://cyanprint.dev/registry
- **API**: `https://api.zinc.sulfone.raichu.cluster.atomi.cloud/api/v1/`

API endpoints:

- Processors: `/api/v1/Processor`
- Plugins: `/api/v1/Plugin`
- Resolvers: `/api/v1/Resolver`

## Type Definitions

### Cyan

```typescript
interface Cyan {
  processors: CyanProcessor[];
  plugins: CyanPlugin[];
}
```

### CyanProcessor

```typescript
interface CyanProcessor {
  name: string;
  files: CyanGlob[];
  config: unknown;
}
```

### CyanPlugin

```typescript
interface CyanPlugin {
  name: string;
  config: unknown;
}
```

### CyanGlob

```typescript
interface CyanGlob {
  root?: string;
  glob: string;
  exclude: string[];
  type: GlobType;
}
```

### GlobType

```typescript
enum GlobType {
  Template = 0, // Process {{var}} substitution
  Copy = 1, // Copy files as-is
}
```

### IInquirer

```typescript
interface IInquirer {
  text(msg: string, id: string): Promise<string>;
  textQ(options: {
    message: string;
    id: string;
    validate?(v: string): string | null;
    default?: string;
    initial?: string;
  }): Promise<string>;
  select(msg: string, id: string, options: string[]): Promise<string>;
  selectQ(options: { message: string; id: string; choices: { value: string; label: string }[] }): Promise<string>;
  checkbox(msg: string, id: string, options: string[]): Promise<string[]>;
  checkboxQ(options: { message: string; id: string; choices: { value: string; label: string }[] }): Promise<string[]>;
  confirm(msg: string, id: string): Promise<boolean>;
  confirmQ(options: { message: string; id: string; default?: boolean; errorMessage?: string }): Promise<boolean>;
  password(msg: string, id: string): Promise<string>;
  passwordQ(options: { message: string; id: string; confirmation?: boolean }): Promise<string>;
  dateSelect(msg: string, id: string): Promise<string>;
  dateSelectQ(options: {
    message: string;
    id: string;
    min?: string;
    max?: string;
    validate?(v: string): string | null;
  }): Promise<string>;
}
```

### IDeterminism

```typescript
interface IDeterminism {
  get(key: string, origin: () => string): string;
}
```

## Default Processor Config

The `cyan/default` processor accepts this config shape:

```typescript
{
  vars: Record<string, string>,    // Variables for {{var}} substitution
  varSyntax?: [string, string][],  // Custom delimiters, default [["{{", "}}"]]
}
```
