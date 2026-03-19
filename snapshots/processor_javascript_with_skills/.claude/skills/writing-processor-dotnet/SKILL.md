---
name: writing-processor-dotnet
description: Write or modify CyanPrint processor code in C#. Use when the user asks to change file transformations, modify the entry point, handle file processing, or change output generation. Covers entry point (CyanEngine.StartProcessor), CyanFileHelper (ResolveAll/Read/Copy), and VirtualFile (Content/WriteFile). Processor function receives (ProcessorInput, CyanFileHelper) as two parameters.
allowed-tools: Read, Grep, Glob, Write
---

# Writing this Processor (C#)

## Entry Point

Processors use `CyanEngine.StartProcessor` with a function that receives **two parameters** -- `ProcessorInput` and `CyanFileHelper`:

```csharp
using sulfone_helium;

ProcessorOutput ProcessorFn(ProcessorInput input, CyanFileHelper fileHelper)
{
    // Process files using fileHelper
    return new ProcessorOutput { Directory = input.WriteDirectory };
}

CyanEngine.StartProcessor(ProcessorFn);
```

## ProcessorInput

The `input` parameter has these properties:

```csharp
// input.ReadDirectory  -- Absolute path to input directory
// input.WriteDirectory -- Absolute path to output directory
// input.Globs          -- Glob patterns from cyan.yaml (IReadOnlyList<CyanGlob>)
// input.Config         -- Configuration passed from template
```

## CyanFileHelper -- The Primary API

The `fileHelper` parameter is the primary interface for working with files:

### ResolveAll() -- Start Here

Call `fileHelper.ResolveAll()` first. It reads all Template globs and copies all Copy globs:

```csharp
var files = fileHelper.ResolveAll();
// files -- IReadOnlyList<VirtualFile> available for transformation
```

### Read(glob) -- Read Specific Files

```csharp
var files = fileHelper.Read(input.Globs[0]);
// files -- IReadOnlyList<VirtualFile> matching a specific CyanGlob
```

### Copy(glob) -- Copy Files As-Is

```csharp
foreach (var glob in input.Globs)
{
    if (glob.Type == GlobType.Copy)
    {
        fileHelper.Copy(glob);
    }
}
```

### ReadDir / WriteDir -- Resolved Directory Paths

```csharp
var readDir = fileHelper.ReadDir; // string
var writeDir = fileHelper.WriteDir; // string
```

## VirtualFile -- Manipulating Files

Each VirtualFile has these properties:

```csharp
// file.Content    -- Read or write the file content (string)
// file.Relative   -- Path relative to read directory
// file.Read       -- Absolute read path
// file.Write      -- Absolute write path
// file.WriteFile() -- Persist changes to write directory
```

### Example: Transform All Files

```csharp
var files = fileHelper.ResolveAll();
foreach (var file in files)
{
    file.Content = file.Content.Replace("{{name}}", config.Name);
    file.WriteFile();
}
```

### Example: Selective Processing

```csharp
var files = fileHelper.ResolveAll();
foreach (var file in files)
{
    if (file.Relative.EndsWith(".cs"))
    {
        file.Content = $"// Header\n{file.Content}";
        file.WriteFile();
    }
}
```

## Return Value

```csharp
return new ProcessorOutput { Directory = input.WriteDirectory };
```

## Glob Types

```csharp
// CyanGlob: { string? Root, string Glob, GlobType Type, string[] Exclude }
// GlobType.Template = 0, GlobType.Copy = 1
```
