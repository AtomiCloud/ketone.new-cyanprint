---
name: writing-processor-python
description: Write or modify CyanPrint processor code in Python. Use when the user asks to change file transformations, modify the entry point, handle file processing, or change output generation. Covers entry point (start_processor_with_fn), CyanFileHelper (resolve_all/read/copy), and VirtualFile (content/write_file). Processor function receives (input, file_helper) as two parameters.
---

# Writing this Processor (Python)

## Entry Point

Processors use `start_processor_with_fn` with a function that receives **two parameters** -- `input` and `file_helper`:

```python
from cyanprintsdk import start_processor_with_fn

def processor_fn(input, file_helper):
    # Process files using file_helper
    return {"directory": input.write_directory}

start_processor_with_fn(processor_fn)
```

## Input Object

The `input` parameter has these attributes:

```python
# input.read_directory  -- Absolute path to input directory
# input.write_directory -- Absolute path to output directory
# input.globs           -- Glob patterns from cyan.yaml (list of CyanGlob)
# input.config          -- Configuration passed from template
```

## CyanFileHelper -- The Primary API

The `file_helper` parameter is the primary interface for working with files:

### resolve_all() -- Start Here

Call `file_helper.resolve_all()` first. It automatically handles **all glob types**:

- `GlobType.Template` (0) globs: reads files and returns them as `VirtualFile[]` for transformation
- `GlobType.Copy` (1) globs: automatically copies files to the write directory

**You do NOT need to manually check glob type or call `copy()` yourself.** The processor author does NOT manually check glob type — `resolve_all()` handles both cases:

```python
files = file_helper.resolve_all()
# files -- list of VirtualFile objects available for transformation
# Copy globs are already handled; Template globs are returned for processing
```

### read(glob) -- Read Specific Files

```python
files = file_helper.read(input.globs[0])
# files -- list of VirtualFile objects matching a specific CyanGlob
```

### read_dir / write_dir -- Resolved Directory Paths

```python
read_dir = file_helper.read_dir  # string
write_dir = file_helper.write_dir  # string
```

## VirtualFile -- Manipulating Files

Each VirtualFile has these attributes:

```python
# f.content    -- Read or write the file content (string)
# f.relative   -- Path relative to read directory
# f.read       -- Absolute read path
# f.write      -- Absolute write path
# f.write_file() -- Persist changes to write directory
```

### Example: Transform All Files

```python
files = file_helper.resolve_all()
for f in files:
    f.content = f.content.replace('{{name}}', config['name'])
    f.write_file()
```

### Example: Selective Processing

```python
files = file_helper.resolve_all()
for f in files:
    if f.relative.endswith('.py'):
        f.content = f"# Header\n{f.content}"
        f.write_file()
```

### Example: Rename Files via `f.relative` Mutation

To change the output filename, mutate `f.relative` before calling `write_file()`:

```python
files = file_helper.resolve_all()
for f in files:
    if f.relative.startswith('src/'):
        # Rename: strip 'src/' prefix -> 'lib/'
        f.relative = 'lib/' + f.relative[4:]
        f.write_file()
```

## Return Value

```python
return {"directory": input.write_directory}
```

## Glob Types

```python
# CyanGlob: { root: str | None, glob: str, type: GlobType, exclude: list[str] }
# GlobType.Template = 0, GlobType.Copy = 1
```
