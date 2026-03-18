# CyanPrint Plugin SDK Reference

## SDK Type Definitions

### TypeScript / JavaScript

Package: `@atomicloud/cyan-sdk`

```typescript
interface PluginInput {
  directory: string; // Absolute path to the generated output directory
  config: unknown; // Configuration from template's cyan.yaml
}

interface PluginOutput {
  directory: string; // Return the directory path (typically input.directory)
}

// Entry point
function StartPluginWithLambda(fn: (input: PluginInput) => Promise<PluginOutput>): void;
```

### Python

Package: `cyanprintsdk`

```python
from cyanprintsdk import start_plugin_with_fn, PluginInput, PluginOutput

class PluginInput:
    directory: str   # Absolute path to the generated output directory
    config: Any      # Configuration from template's cyan.yaml

class PluginOutput:
    directory: str   # Return the directory path (typically input.directory)

def start_plugin_with_fn(fn: Callable[[PluginInput], PluginOutput]) -> None: ...
```

### C#

Package: `sulfone_helium`

```csharp
using sulfone_helium;

public class PluginInput
{
    public string Directory { get; set; }  // Absolute path to the generated output directory
    public object Config { get; set; }     // Configuration from template's cyan.yaml
}

public class PluginOutput
{
    public string Directory { get; set; }  // Return the directory path (typically input.Directory)
}

// Entry point
CyanEngine.StartPlugin(Func<PluginInput, PluginOutput> fn);
```

## Multi-Language Entry Point Skeletons

### TypeScript

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

### JavaScript

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

### Python

```python
from cyanprintsdk import start_plugin_with_fn, PluginInput, PluginOutput
from pathlib import Path
import subprocess

def plugin_fn(input: PluginInput) -> PluginOutput:
    dir = Path(input.directory)
    config = input.config

    # Use pathlib / open() for file I/O
    # Use subprocess.run for command execution

    return PluginOutput(directory=input.directory)

start_plugin_with_fn(plugin_fn)
```

### C#

```csharp
using sulfone_helium;
using System.IO;
using System.Diagnostics;

PluginOutput PluginFn(PluginInput input)
{
    var dir = input.Directory;
    var config = input.Config;

    // Use System.IO for file I/O
    // Use System.Diagnostics.Process for command execution

    return new PluginOutput { Directory = input.Directory };
}

CyanEngine.StartPlugin(PluginFn);
```

## Native I/O Examples

### TypeScript: Read, modify, and write a file

```typescript
import * as fs from 'fs';
import * as path from 'path';

// Read
const content = fs.readFileSync(path.join(input.directory, 'src/index.ts'), 'utf-8');

// Modify
const modified = content.replace(/console\.log/g, 'logger.info');

// Write
fs.writeFileSync(path.join(input.directory, 'src/index.ts'), modified);
```

### TypeScript: Walk directory recursively

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

### Python: Read, modify, and write a file

```python
from pathlib import Path

file_path = Path(input.directory) / "src" / "main.py"

# Read
content = file_path.read_text()

# Modify
modified = content.replace("print(", "logger.info(")

# Write
file_path.write_text(modified)
```

### Python: Walk directory recursively

```python
from pathlib import Path

all_files = list(Path(input.directory).rglob("*"))
py_files = list(Path(input.directory).rglob("*.py"))
```

### C#: Read, modify, and write a file

```csharp
using System.IO;

var filePath = Path.Combine(input.Directory, "src", "Program.cs");

// Read
var content = File.ReadAllText(filePath);

// Modify
var modified = content.Replace("Console.WriteLine", "Logger.Info");

// Write
File.WriteAllText(filePath, modified);
```

### C#: Walk directory recursively

```csharp
using System.IO;

var allFiles = Directory.GetFiles(input.Directory, "*", SearchOption.AllDirectories);
var csFiles = Directory.GetFiles(input.Directory, "*.cs", SearchOption.AllDirectories);
```

### TypeScript: Execute a command

```typescript
import { execSync } from 'child_process';

const output = execSync('prettier --write .', {
  cwd: input.directory,
  encoding: 'utf-8',
});
```

### Python: Execute a command

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

### C#: Execute a command

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
