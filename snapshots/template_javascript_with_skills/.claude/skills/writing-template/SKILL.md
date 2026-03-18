---
name: writing-template
description: Write or modify CyanPrint template code. Use when the user asks to add prompts, change template logic, modify the entry point, add processors/plugins/resolvers, or change generated output. Covers IInquirer question types (text, select, checkbox, confirm, password, dateSelect), processor configuration, and IDeterminism.
allowed-tools: Read, Grep, Glob, Write
---

# Writing this Template

## Entry Point Structure

```typescript
import { StartTemplateWithLambda, type IInquirer, type IDeterminism, type Cyan } from '@atomicloud/cyan-sdk';

StartTemplateWithLambda(async (i: IInquirer, d: IDeterminism): Promise<Cyan> => {
  // Prompt users and build configuration
  return {
    processors: [...],
    plugins: [...],
  };
});
```

## IInquirer — Prompting Users

Six question types are available. Each has a simple form and a Q-form with additional options:

### text — Free-text input

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

### select — Single choice

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

### checkbox — Multiple choices

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

### confirm — Yes/No

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

### password — Secret input

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

### dateSelect — Date picker

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

## IDeterminism — Deterministic Values

Use `d.get()` for all prompt values to ensure deterministic test output:

```typescript
const name = await d.get('project-name', () => i.text('Project name?', 'project-name'));
```

In tests, `deterministic_state` provides values directly. In interactive mode, the fallback function runs.

## Configuring the Default Processor

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
        varSyntax: [['{{', '}}']],  // Optional: customize delimiters
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

## Multi-Language Entry Points

See [reference.md](./reference.md) for complete entry point skeletons in TypeScript, JavaScript, Python, and C#.
