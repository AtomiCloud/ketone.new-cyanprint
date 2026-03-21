---
name: writing-plugin-python
description: Write or modify CyanPrint plugin code in Python. Use when the user asks to add validation rules, change plugin behavior, modify the entry point, run commands from a plugin, or mutate files. Covers entry point (start_plugin_with_fn), native filesystem I/O (pathlib), and command execution (subprocess). Plugins receive { directory, config } and use native OS operations.
---

# Writing this Plugin (Python)

## Entry Point

Plugins use `start_plugin_with_fn` with a function that receives `PluginInput` and returns `PluginOutput`:

```python
from cyanprintsdk import start_plugin_with_fn, PluginInput, PluginOutput

def plugin_fn(input: PluginInput) -> PluginOutput:
    # Plugin logic here
    return PluginOutput(directory=input.directory)

start_plugin_with_fn(plugin_fn)
```

## PluginInput

```python
class PluginInput:
    directory: str   # Absolute path to the generated output directory
    config: Any      # Configuration from template's cyan.yaml
```

**Important**: PluginInput has NO SDK file helpers. There are no `read_dir`, `read_file`, or `file_exists` methods. Plugins use **native OS operations** for all file I/O.

## PluginOutput

```python
class PluginOutput:
    directory: str   # Return the directory path (typically input.directory)
```

## Native File I/O Patterns

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

## Command Execution Patterns

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

## File Mutation Workflow

Read files from `input.directory`, modify content, write back:

```python
from pathlib import Path

file_path = Path(input.directory) / 'src' / 'main.py'
content = file_path.read_text()
modified = content.replace('old', 'new')
file_path.write_text(modified)
```

## Entry Point Skeleton

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

## Advanced Patterns

### Walk directory recursively

```python
from pathlib import Path

all_files = list(Path(input.directory).rglob("*"))
py_files = list(Path(input.directory).rglob("*.py"))
```

### Read, modify, and write a file

```python
from pathlib import Path

file_path = Path(input.directory) / "src" / "main.py"
content = file_path.read_text()
modified = content.replace("print(", "logger.info(")
file_path.write_text(modified)
```
