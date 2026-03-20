---
name: writing-plugin-javascript
description: Write or modify CyanPrint plugin code in JavaScript. Use when the user asks to add validation rules, change plugin behavior, modify the entry point, run commands from a plugin, or mutate files. Covers entry point (StartPluginWithLambda), native filesystem I/O (fs), and command execution (child_process). Plugins receive { directory, config } and use native OS operations.
allowed-tools: Read, Grep, Glob, Write
---

# Writing this Plugin (JavaScript)

## Entry Point

Plugins use `StartPluginWithLambda` with a **single parameter** — the input object:

```javascript
const { StartPluginWithLambda } = require('@atomicloud/cyan-sdk');

StartPluginWithLambda(async (input) => {
  // Plugin logic here
  return { directory: input.directory };
});
```

## PluginInput

```javascript
// PluginInput shape:
{
  directory: string, // Absolute path to the generated output directory
  config: unknown,   // Configuration from template's cyan.yaml
}
```

**Important**: PluginInput has NO SDK file helpers. There are no `readDir`, `readFile`, or `fileExists` methods. Plugins use **native OS operations** for all file I/O.

## PluginOutput

```javascript
// PluginOutput shape:
{
  directory: string, // Return the directory path (typically input.directory)
}
```

## Native File I/O Patterns

```javascript
const fs = require('fs');
const path = require('path');

// Read a file
const content = fs.readFileSync(path.join(input.directory, 'src/index.js'), 'utf-8');

// Check if file exists
const exists = fs.existsSync(path.join(input.directory, 'README.md'));

// List directory
const files = fs.readdirSync(path.join(input.directory, 'src'));

// Write a file
fs.writeFileSync(path.join(input.directory, 'src/index.js'), modified);
```

## Command Execution Patterns

```javascript
const { execSync } = require('child_process');

const output = execSync('prettier --write .', {
  cwd: input.directory,
  encoding: 'utf-8',
});
```

## File Mutation Workflow

Read files from `input.directory`, modify content, write back:

```javascript
const fs = require('fs');
const path = require('path');

const filePath = path.join(input.directory, 'src/index.js');
const content = fs.readFileSync(filePath, 'utf-8');
const modified = content.replace(/old/g, 'new');
fs.writeFileSync(filePath, modified);

return { directory: input.directory };
```

## Entry Point Skeleton

```javascript
const { StartPluginWithLambda } = require('@atomicloud/cyan-sdk');
const fs = require('fs');
const path = require('path');

StartPluginWithLambda(async input => {
  const dir = input.directory;
  const config = input.config;

  // Use native fs operations for file I/O
  // Use child_process.execSync for command execution

  return { directory: input.directory };
});
```

## Advanced Patterns

### Walk directory recursively

```javascript
const fs = require('fs');
const path = require('path');

function walkDir(dir) {
  const results = [];
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

```javascript
const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(input.directory, 'src/index.js'), 'utf-8');
const modified = content.replace(/console\.log/g, 'logger.info');
fs.writeFileSync(path.join(input.directory, 'src/index.js'), modified);
```
