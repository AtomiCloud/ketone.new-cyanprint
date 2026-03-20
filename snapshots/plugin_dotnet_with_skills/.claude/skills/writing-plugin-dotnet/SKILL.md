---
name: writing-plugin-dotnet
description: Write or modify CyanPrint plugin code in C#. Use when the user asks to add validation rules, change plugin behavior, modify the entry point, run commands from a plugin, or mutate files. Covers entry point (CyanEngine.StartPlugin), native filesystem I/O (System.IO), and command execution (System.Diagnostics.Process). Plugins receive { Directory, Config } and use native OS operations.
allowed-tools: Read, Grep, Glob, Write
---

# Writing this Plugin (C#)

## Entry Point

Plugins use `CyanEngine.StartPlugin` with a function that receives `PluginInput` and returns `PluginOutput`:

```csharp
using sulfone_helium;

PluginOutput PluginFn(PluginInput input)
{
    // Plugin logic here
    return new PluginOutput { Directory = input.Directory };
}

CyanEngine.StartPlugin(PluginFn);
```

## PluginInput

```csharp
public class PluginInput
{
    public string Directory { get; set; }  // Absolute path to the generated output directory
    public object Config { get; set; }     // Configuration from template's cyan.yaml
}
```

**Important**: PluginInput has NO SDK file helpers. There are no `ReadDir`, `ReadFile`, or `FileExists` methods. Plugins use **native OS operations** for all file I/O.

## PluginOutput

```csharp
public class PluginOutput
{
    public string Directory { get; set; }  // Return the directory path (typically input.Directory)
}
```

## Native File I/O Patterns

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

Read files from `input.Directory`, modify content, write back:

```csharp
using System.IO;

var filePath = Path.Combine(input.Directory, "src", "Program.cs");
var content = File.ReadAllText(filePath);
var modified = content.Replace("old", "new");
File.WriteAllText(filePath, modified);
```

## Entry Point Skeleton

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

## Advanced Patterns

### Walk directory recursively

```csharp
using System.IO;

var allFiles = Directory.GetFiles(input.Directory, "*", SearchOption.AllDirectories);
var csFiles = Directory.GetFiles(input.Directory, "*.cs", SearchOption.AllDirectories);
```

### Read, modify, and write a file

```csharp
using System.IO;

var filePath = Path.Combine(input.Directory, "src", "Program.cs");
var content = File.ReadAllText(filePath);
var modified = content.Replace("Console.WriteLine", "Logger.Info");
File.WriteAllText(filePath, modified);
```
