---
name: writing-plugin-typescript
description: Write or modify CyanPrint plugin code in TypeScript. Use when the user asks to add validation rules, change plugin behavior, modify the entry point, run commands from a plugin, or mutate files. Covers entry point (StartPluginWithLambda), native filesystem I/O (fs), and command execution (child_process). Plugins receive { directory, config } and use native OS operations.
allowed-tools: Read, Grep, Glob, Write
---

# Writing this Plugin (TypeScript)

## Entry Point

Plugins use `StartPluginWithLambda` with a **single parameter** — `PluginInput`:

```typescript
import { StartPluginWithLambda, type PluginInput, type PluginOutput } from '@atomicloud/cyan-sdk';

StartPluginWithLambda(async (input: PluginInput): Promise<PluginOutput> => {
  // Plugin logic here
  return { directory: input.directory };
});
```

## PluginInput

```typescript
interface PluginInput {
  directory: string; // Absolute path to the generated output directory
  config: unknown; // Configuration from template's cyan.yaml
}
```

**Important**: PluginInput has NO SDK file helpers. There are no `readDir`, `readFile`, or `fileExists` methods. Plugins use **native OS operations** for all file I/O.

## PluginOutput

```typescript
interface PluginOutput {
  directory: string; // Return the directory path (typically input.directory)
}
```

## Native File I/O Patterns

```typescript
import * as fs from 'fs';
import * as path from 'path';

// Read a file
const content = fs.readFileSync(path.join(input.directory, 'src/index.ts'), 'utf-8');

// Check if file exists
const exists = fs.existsSync(path.join(input.directory, 'README.md'));

// List directory
const files = fs.readdirSync(path.join(input.directory, 'src'));

// Write a file
fs.writeFileSync(path.join(input.directory, 'src/index.ts'), modified);
```

## Command Execution Patterns

```typescript
import { execSync } from 'child_process';

const output = execSync('prettier --write .', {
  cwd: input.directory,
  encoding: 'utf-8',
});
```

## File Mutation Workflow

Read files from `input.directory`, modify content, write back:

```typescript
import * as fs from 'fs';
import * as path from 'path';

const filePath = path.join(input.directory, 'src/index.ts');
const content = fs.readFileSync(filePath, 'utf-8');
const modified = content.replace(/old/g, 'new');
fs.writeFileSync(filePath, modified);

return { directory: input.directory };
```

## Entry Point Skeleton

```typescript
import { StartPluginWithLambda, type PluginInput, type PluginOutput } from '@atomicloud/cyan-sdk';
import * as fs from 'fs';
import * as path from 'path';

StartPluginWithLambda(async (input: PluginInput): Promise<PluginOutput> => {
  const dir = input.directory;
  const config = input.config as Record<string, any>;

  // Use native fs operations for file I/O
  // Use child_process.execSync for command execution

  return { directory: input.directory };
});
```

## Advanced Patterns

### Walk directory recursively

```typescript
import * as fs from 'fs';
import * as path from 'path';

function walkDir(dir: string): string[] {
  const results: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkDir(fullPath));
    } else {
      results.push(fullPath);
    }
  }
  return results;
}

const allFiles = walkDir(input.directory);
```

### Read, modify, and write a file

```typescript
import * as fs from 'fs';
import * as path from 'path';

const content = fs.readFileSync(path.join(input.directory, 'src/index.ts'), 'utf-8');
const modified = content.replace(/console\.log/g, 'logger.info');
fs.writeFileSync(path.join(input.directory, 'src/index.ts'), modified);
```
