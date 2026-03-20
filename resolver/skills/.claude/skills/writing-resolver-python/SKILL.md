---
name: writing-resolver-python
description: Write or modify CyanPrint resolver code in Python. Use when the user asks to change conflict resolution logic, modify merge strategies, handle file origins, or change resolution behavior. Covers entry point (start_resolver_with_fn), ResolverInput/ResolverOutput, ResolvedFile, and FileOrigin. Must ensure commutativity and associativity (sort, unique, deterministic ordering).
allowed-tools: Read, Grep, Glob, Write
---

# Writing this Resolver (Python)

## Entry Point

```python
from cyanprintsdk import start_resolver_with_fn

def resolver_fn(input):
    config = input.config
    files = input.files
    # Resolve conflict
    return {"path": path, "content": content}

start_resolver_with_fn(resolver_fn)
```

## ResolverInput

```python
class ResolverInput:
    config: dict           # { str: unknown }
    files: list[ResolvedFile]
```

## ResolvedFile

**All `files` entries have the same `path`** -- that is the conflict being resolved:

```python
class ResolvedFile:
    path: str
    content: str
    origin: FileOrigin
```

## FileOrigin

```python
class FileOrigin:
    template: str   # Which template produced this file
    layer: int      # Layer number -- IMPORTANT: int, NOT str
```

**Critical**: `layer` is an `int`, not a string. Compare numerically, never as string.

## ResolverOutput

Return a single resolved file:

```python
{"path": str, "content": str}
```

## Commutativity and Associativity

CyanPrint may call the resolver with files in **any order**. Your result must be **identical** regardless of input ordering.

### Pattern 1: Sort before processing

```python
sorted_files = sorted(files, key=lambda f: (f.origin.layer, f.origin.template))
```

### Pattern 2: Deduplicate after merge

```python
all_items = []
for f in sorted_files:
    all_items.extend(json.loads(f.content)["items"])
unique = sorted(set(all_items))
```

### Pattern 3: Deterministic priority

```python
# Highest layer number wins -- deterministic regardless of input order
winner = max(files, key=lambda f: f.origin.layer)
```

## Resolution Strategies

### Last-Write Wins (by layer)

```python
sorted_files = sorted(files, key=lambda f: f.origin.layer)
last = sorted_files[-1]
return {"path": last.path, "content": last.content}
```

### Deep Merge (JSON)

```python
sorted_files = sorted(files, key=lambda f: f.origin.layer)
merged = {}
for f in sorted_files:
    merged = deep_merge(merged, json.loads(f.content))
return {"path": files[0].path, "content": json.dumps(merged, indent=2)}
```

## Entry Point Skeleton

```python
from cyanprintsdk import start_resolver_with_fn

def resolver_fn(input):
    config = input.config
    files = input.files
    if len(files) == 0:
        raise ValueError("Resolver received no files — at least 1 file is required")
    unique_paths = set(f["path"] for f in files)
    if len(unique_paths) > 1:
        raise ValueError(f"Resolver received files with different paths: {', '.join(unique_paths)} — all files must have the same path")
    path = files[0].path

    # Sort for commutativity (layer ascending, then template name)
    sorted_files = sorted(files, key=lambda f: (f.origin.layer, f.origin.template))

    # TODO: Implement resolution logic
    content = sorted_files[-1].content

    return {"path": path, "content": content}

start_resolver_with_fn(resolver_fn)
```

## Key Rules

1. **All `files` entries have the same `path`** -- that is the conflict being resolved
2. **`FileOrigin.layer` is an `int`** -- compare numerically, never as string
3. **Return a single `{"path": ..., "content": ...}`** -- the resolved file
4. **Ensure commutativity** -- sort inputs before processing, deduplicate outputs
5. **Ensure associativity** -- result must be same whether resolved all-at-once or in pairs
6. **Validate input** -- reject empty files list and mismatched paths with an error
