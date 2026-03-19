---
name: writing-resolver-dotnet
description: Write or modify CyanPrint resolver code in C#. Use when the user asks to change conflict resolution logic, modify merge strategies, handle file origins, or change resolution behavior. Covers entry point (CyanEngine.StartResolver), ResolverInput/ResolverOutput, ResolvedFile, and FileOrigin. Must ensure commutativity and associativity (sort, unique, deterministic ordering).
allowed-tools: Read, Grep, Glob, Write
---

# Writing this Resolver (C# / .NET)

## Entry Point

```csharp
using sulfone_helium;

ResolverOutput ResolverFn(ResolverInput input)
{
    // Resolve conflict
    return new ResolverOutput { Path = path, Content = content };
}

CyanEngine.StartResolver(ResolverFn);
```

## ResolverInput

```csharp
public class ResolverInput
{
    public Dictionary<string, object> Config { get; set; }
    public List<ResolvedFile> Files { get; set; }
}
```

## ResolvedFile

**All `Files` entries have the same `Path`** -- that is the conflict being resolved:

```csharp
public class ResolvedFile
{
    public string Path { get; set; }
    public string Content { get; set; }
    public FileOrigin Origin { get; set; }
}
```

## FileOrigin

```csharp
public class FileOrigin
{
    public string Template { get; set; }  // Which template produced this file
    public int Layer { get; set; }        // Layer number -- IMPORTANT: int, NOT string
}
```

**Critical**: `Layer` is an `int`, not a string. Compare numerically, never as string.

## ResolverOutput

Return a single resolved file:

```csharp
public class ResolverOutput
{
    public string Path { get; set; }
    public string Content { get; set; }
}
```

## Commutativity and Associativity

CyanPrint may call the resolver with files in **any order**. Your result must be **identical** regardless of input ordering.

### Pattern 1: Sort before processing

```csharp
var sorted = input.Files
    .OrderBy(f => f.Origin.Layer)
    .ThenBy(f => f.Origin.Template)
    .ToList();
```

### Pattern 2: Deduplicate after merge

```csharp
var allItems = sorted
    .SelectMany(f => JsonSerializer.Deserialize<List<string>>(f.Content))
    .Distinct()
    .OrderBy(x => x)
    .ToList();
```

### Pattern 3: Deterministic priority

```csharp
// Highest layer number wins -- deterministic regardless of input order
var winner = input.Files.OrderByDescending(f => f.Origin.Layer).First();
```

## Resolution Strategies

### Last-Write Wins (by layer)

```csharp
var sorted = input.Files
    .OrderBy(f => f.Origin.Layer)
    .ThenBy(f => f.Origin.Template)
    .ToList();
var last = sorted.Last();
return new ResolverOutput { Path = last.Path, Content = last.Content };
```

### Deep Merge (JSON)

```csharp
var sorted = input.Files
    .OrderBy(f => f.Origin.Layer)
    .ThenBy(f => f.Origin.Template)
    .ToList();
var merged = new Dictionary<string, object>();
foreach (var file in sorted)
{
    merged = DeepMerge(merged, JsonSerializer.Deserialize<Dictionary<string, object>>(file.Content));
}
return new ResolverOutput
{
    Path = input.Files[0].Path,
    Content = JsonSerializer.Serialize(merged, new JsonSerializerOptions { WriteIndented = true })
};
```

## Entry Point Skeleton

```csharp
using sulfone_helium;

ResolverOutput ResolverFn(ResolverInput input)
{
    var files = input.Files;
    var path = files[0].Path;

    // Sort for commutativity (layer ascending, then template name)
    var sorted = files
        .OrderBy(f => f.Origin.Layer)
        .ThenBy(f => f.Origin.Template)
        .ToList();

    // TODO: Implement resolution logic
    var content = sorted.Last().Content;

    return new ResolverOutput { Path = path, Content = content };
}

CyanEngine.StartResolver(ResolverFn);
```

## Key Rules

1. **All `Files` entries have the same `Path`** -- that is the conflict being resolved
2. **`FileOrigin.Layer` is an `int`** -- compare numerically, never as string
3. **Return a single `new ResolverOutput { Path = ..., Content = ... }`** -- the resolved file
4. **Ensure commutativity** -- sort inputs before processing, deduplicate outputs
5. **Ensure associativity** -- result must be same whether resolved all-at-once or in pairs
