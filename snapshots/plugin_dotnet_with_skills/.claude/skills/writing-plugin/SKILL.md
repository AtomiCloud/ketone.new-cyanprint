---
name: writing-plugin
description: Write or modify CyanPrint plugin code. Use when the user asks to add validation rules, change plugin behavior, modify the entry point, run commands from a plugin, or mutate files. Covers entry point (StartPluginWithLambda), native filesystem I/O, and command execution (child_process/subprocess). Plugins receive { directory, config } and use native OS operations.
allowed-tools: Read, Grep, Glob, Write
---

# Writing this Plugin

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

### TypeScript / JavaScript

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

### Python

```python
from pathlib import Path

dir = Path(input.directory)

# Read a file
content = (dir / 'src' / 'main.py').read_text()

# Check if file exists
exists = (dir / 'README.md').exists()

# List directory
files = list((dir / 'src').iterdir())

# Write a file
(dir / 'src' / 'main.py').write_text(modified)
```

### C#

```csharp
using System.IO;

var dir = input.Directory;

// Read a file
var content = File.ReadAllText(Path.Combine(dir, "src", "Program.cs"));

// Check if file exists
var exists = File.Exists(Path.Combine(dir, "README.md"));

// List directory
var files = Directory.GetFiles(Path.Combine(dir, "src"));

// Write a file
File.WriteAllText(Path.Combine(dir, "src", "Program.cs"), modified);
```

## Command Execution Patterns

### TypeScript / JavaScript

```typescript
import { execSync } from 'child_process';

const output = execSync('prettier --write .', {
  cwd: input.directory,
  encoding: 'utf-8',
});
```

### Python

```python
import subprocess

result = subprocess.run(
    ["prettier", "--write", "."],
    cwd=input.directory,
    capture_output=True,
    text=True,
    check=True,
)
```

### C#

```csharp
using System.Diagnostics;

var process = new Process
{
    StartInfo = new ProcessStartInfo
    {
        FileName = "prettier",
        Arguments = "--write .",
        WorkingDirectory = input.Directory,
        RedirectStandardOutput = true,
        UseShellExecute = false,
    }
};
process.Start();
var output = process.StandardOutput.ReadToEnd();
process.WaitForExit();
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

## Multi-Language Entry Points

See [reference.md](./reference.md) for complete entry point skeletons in TypeScript, JavaScript, Python, and C#.
