---
name: writing-template-dotnet
description: Write or modify CyanPrint template code in C#. Use when the user asks to add prompts, change template logic, modify the entry point, add processors/plugins/resolvers, or change generated output for a C#/.NET template. Covers IInquirer question types (Text, Select, Checkbox, Confirm, Password, DateSelect), processor configuration, and IDeterminism.
allowed-tools: Read, Grep, Glob, Write
---

# Writing this Template (C#)

## Entry Point Structure

```csharp
using sulfone_helium;

Cyan TemplateFn(IInquirer i, IDeterminism d)
{
    var name = i.Text("Project name", "name");
    var language = i.Select("Language", "language", new[] { "TypeScript", "Python" });

    return new Cyan
    {
        Processors = new[]
        {
            new CyanProcessor
            {
                Name = "cyan/default",
                Files = new[]
                {
                    new CyanGlob
                    {
                        Root = $"template/{language.ToLower()}",
                        Glob = "**/*",
                        Exclude = Array.Empty<string>(),
                        Type = GlobType.Template,
                    }
                },
                Config = new { vars = new { name, language } },
            }
        },
        Plugins = Array.Empty<CyanPlugin>(),
    };
}

CyanEngine.StartTemplate(TemplateFn);
```

## IInquirer -- Prompting Users

Six question types are available. Each has a simple form and a Q-form with additional options:

### Text -- Free-text input

```csharp
// Simple form
var name = i.Text("What is the project name?", "project-name");

// Q-form with validation and defaults
var name = i.TextQ(new TextQOptions
{
    Message = "What is the project name?",
    Id = "project-name",
    Validate = v => Regex.IsMatch(v, @"^[a-z0-9-]+$") ? null : "Use lowercase letters, numbers, and hyphens",
    Default = "my-project",
    Initial = "my-project",
});
```

### Select -- Single choice

```csharp
// Simple form
var lang = i.Select("What language?", "language", new[] { "TypeScript", "Python", "C#", "JavaScript" });

// Q-form with labeled choices
var lang = i.SelectQ(new SelectQOptions
{
    Message = "What language?",
    Id = "language",
    Choices = new[]
    {
        new Choice { Value = "typescript", Label = "TypeScript" },
        new Choice { Value = "python", Label = "Python" },
        new Choice { Value = "csharp", Label = "C#" },
        new Choice { Value = "javascript", Label = "JavaScript" },
    },
});
```

### Checkbox -- Multiple choices

```csharp
// Simple form
var features = i.Checkbox("Which features?", "features", new[] { "auth", "logging", "testing" });

// Q-form
var features = i.CheckboxQ(new CheckboxQOptions
{
    Message = "Which features?",
    Id = "features",
    Choices = new[]
    {
        new Choice { Value = "auth", Label = "Authentication" },
        new Choice { Value = "logging", Label = "Logging" },
        new Choice { Value = "testing", Label = "Testing" },
    },
});
```

### Confirm -- Yes/No

```csharp
// Simple form
var includeTests = i.Confirm("Include tests?", "include-tests");

// Q-form
var includeTests = i.ConfirmQ(new ConfirmQOptions
{
    Message = "Include tests?",
    Id = "include-tests",
    Default = true,
    ErrorMessage = "Please answer yes or no",
});
```

### Password -- Secret input

```csharp
// Simple form
var apiKey = i.Password("Enter API key:", "api-key");

// Q-form
var apiKey = i.PasswordQ(new PasswordQOptions
{
    Message = "Enter API key:",
    Id = "api-key",
    Confirmation = true,
});
```

### DateSelect -- Date picker

```csharp
// Simple form
var date = i.DateSelect("Select release date:", "release-date");

// Q-form
var date = i.DateSelectQ(new DateSelectQOptions
{
    Message = "Select release date:",
    Id = "release-date",
    Min = "2024-01-01",
    Max = "2025-12-31",
    Validate = v => v > DateTime.Now ? "Date must be in the future" : null,
});
```

## IDeterminism -- Deterministic Values

Use `d.Get()` for all prompt values to ensure deterministic test output:

```csharp
var name = d.Get("project-name", () => i.Text("Project name?", "project-name"));
```

In tests, `deterministic_state` provides values directly. In interactive mode, the fallback function runs.

### Why Determinism Matters

Each template script is executed multiple times — during generation, testing, and re-generation. Without `d.get()`, values from `DateTime.Now`, `Random`, or other non-deterministic sources produce different output each time, breaking snapshot tests.

`d.get()` solves this by generating a random value on first execution and storing it. Subsequent executions return the stored value instead of generating a new one. This is why ALL prompt values should go through `d.get()`, not just the obviously random ones.

## Configuring the Default Processor

The default processor (`cyan/default`) supports these config options:

- `vars`: Template variables for substitution. Supports nested objects. These are substituted using the configured syntax.
- `flags`: Boolean flag variables. Supports nested objects. Useful for conditional template logic.
- `parser.varSyntax`: Custom delimiter pairs. Default is `{{` and `}}`. Pass as array of 2-element arrays, e.g., `[['{{', '}}']]`.

**Note**: Globbing is handled automatically by the processor via `fileHelper.resolveAll()`. You don't need to implement file matching yourself.

```csharp
new Cyan
{
    Processors = new[]
    {
        new CyanProcessor
        {
            Name = "cyan/default",
            Files = new[]
            {
                new CyanGlob
                {
                    Root = "template/dotnet",
                    Glob = "**/*",
                    Type = GlobType.Template,  // Process {{var}} substitution
                    Exclude = Array.Empty<string>(),
                },
                new CyanGlob
                {
                    Root = "template/common",
                    Glob = "**/*",
                    Type = GlobType.Copy,       // Copy files as-is
                    Exclude = Array.Empty<string>(),
                },
            },
            Config = new
            {
                vars = new { username, name = projectName, description = projectDesc },
                flags = new { includeTests = true, enableAuth = false },
                parser = new { varSyntax = new[] { new[] { "{{", "}}" } } },
            },
        },
    },
    Plugins = Array.Empty<CyanPlugin>(),
}
```

## Adding Plugins

```csharp
new Cyan
{
    Processors = ...,
    Plugins = new[]
    {
        new CyanPlugin
        {
            Name = "username/plugin-name",
            Config = new { /* plugin-specific config */ },
        },
    },
}
```

## Finding Processors, Plugins, and Resolvers

Browse available artifacts:
- **Registry**: https://cyanprint.dev/registry
- **API**: `https://api.zinc.sulfone.raichu.cluster.atomi.cloud/api/v1/`

API endpoints:
- Processors: `/api/v1/Processor`
- Plugins: `/api/v1/Plugin`
- Resolvers: `/api/v1/Resolver`

## Type Definitions

### Cyan

```csharp
class Cyan
{
    CyanProcessor[] Processors { get; set; }
    CyanPlugin[] Plugins { get; set; }
}
```

### CyanProcessor

```csharp
class CyanProcessor
{
    string Name { get; set; }
    CyanGlob[] Files { get; set; }
    object Config { get; set; }
}
```

### CyanPlugin

```csharp
class CyanPlugin
{
    string Name { get; set; }
    object Config { get; set; }
}
```

### CyanGlob

```csharp
class CyanGlob
{
    string Root { get; set; }
    string Glob { get; set; }
    string[] Exclude { get; set; }
    GlobType Type { get; set; }
}
```

### GlobType

```csharp
enum GlobType
{
    Template = 0, // Process {{var}} substitution
    Copy = 1,     // Copy files as-is
}
```

### IInquirer

```csharp
interface IInquirer
{
    string Text(string msg, string id);
    string TextQ(TextQOptions options);
    string Select(string msg, string id, string[] options);
    string SelectQ(SelectQOptions options);
    string[] Checkbox(string msg, string id, string[] options);
    string[] CheckboxQ(CheckboxQOptions options);
    bool Confirm(string msg, string id);
    bool ConfirmQ(ConfirmQOptions options);
    string Password(string msg, string id);
    string PasswordQ(PasswordQOptions options);
    string DateSelect(string msg, string id);
    string DateSelectQ(DateSelectQOptions options);
}
```

### IDeterminism

```csharp
interface IDeterminism
{
    string Get(string key, Func<string> origin);
}
```

## Default Processor Config

The `cyan/default` processor accepts this config shape:

```csharp
new
{
    vars = new Dictionary<string, string>(),     // Variables for {{var}} substitution
    varSyntax = new[] { new[] { "{{", "}}" } }, // Custom delimiters, default [["{{", "}}"]]
}
```
