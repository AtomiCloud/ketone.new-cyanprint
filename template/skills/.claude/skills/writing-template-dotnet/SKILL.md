---
name: writing-template-dotnet
description: Write or modify CyanPrint template code in C#. Use when the user asks to add prompts, change template logic, modify the entry point, add processors/plugins/resolvers, or change generated output for a C#/.NET template. Covers IInquirer question types (Text, Select, Checkbox, Confirm, Password, DateSelect), processor configuration, and IDeterminism.
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

Each template script is executed multiple times — during generation, testing, and re-generation. Without `d.Get()`, values from `DateTime.Now`, `Random`, or other non-deterministic sources produce different output each time, breaking snapshot tests.

`d.Get()` solves this by generating a random value on first execution and storing it. Subsequent executions return the stored value instead of generating a new one. This is why ALL prompt values should go through `d.Get()`, not just the obviously random ones.

### When to Use d.Get()

**Always** wrap every `i.Text()`, `i.Select()`, `i.Checkbox()`, `i.Confirm()`, `i.Password()`, and `i.DateSelect()` call with `d.Get()`. Even prompts with fixed option lists produce non-deterministic ordering internally without it.

**What breaks without it**: Snapshot tests fail because each run produces different `{{var}}` substitutions. The `cyanprint test --update-snapshots` command will appear to succeed, but subsequent test runs will fail on the now-stale snapshots.

```csharp
// WRONG — non-deterministic test output
var name = i.Text("Project name", "name");
var lang = i.Select("Language", "language", new[] { "TypeScript", "Python" });

// CORRECT — deterministic across all runs
var name = d.Get("project-name", () => i.Text("Project name", "name"));
var lang = d.Get("language", () => i.Select("Language", "language", new[] { "TypeScript", "Python" }));
```

### How d.Get() Works

1. **First execution** (interactive mode): Runs the fallback function, stores the result keyed by the first argument.
2. **Test mode**: Reads directly from `deterministic_state` in `test.cyan.yaml`, ignoring the fallback function entirely.
3. **Re-generation**: Returns the previously stored value, ensuring idempotent output.

## Configuring the Default Processor

The default processor (`cyan/default`) supports these config options:

- `vars`: Template variables for substitution. Supports nested objects. These are substituted using the configured syntax.
- `parser.varSyntax`: Custom delimiter pairs. Pass as array of 2-element arrays, e.g., `[['{{', '}}']]`. **Note**: The actual SDK default is `['__', '__']`. The meta-template typically injects `{{` `}}` via its own processor config (see the `PromptTemplate` function in this meta-template). When writing a new template, the varSyntax you set here must match the delimiters used in your template files.

**Note**: Globbing is handled automatically by the processor via `fileHelper.resolveAll()`. You don't need to implement file matching yourself.

### Inquirer and GlobType Processing

The processor uses `GlobType` to determine how each file group is handled:

- **GlobType.Template** (0): The processor reads files matching the glob pattern, substitutes `{{var}}` placeholders using `config.vars` and `parser.varSyntax`, then writes the result to the output directory.
- **GlobType.Copy** (1): Files are copied as-is from the source to the output directory with no substitution.

Inquirer prompt results become `config.vars` entries. The `id` parameter of each prompt becomes the variable name used in template files:

```csharp
var name = d.Get("project-name", () => i.Text("Project name", "name"));
// → available as {{project-name}} in GlobType.Template files
```

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

## Adding Resolvers

```csharp
new Cyan
{
    Processors = ...,
    Plugins = ...,
    Resolvers = new[]
    {
        new CyanResolver
        {
            Resolver = "username/resolver-name:1",
            Config = new { /* resolver-specific config */ },
            Files = new[] { "**/*.json" },
        },
    },
}
```

## cyan.yaml Artifact Declaration

Every processor, plugin, and resolver referenced in the Cyan return object must also be declared in `cyan.yaml`. Version pinning is supported with `:version` syntax:

```yaml
processors: [cyan/default]
plugins: [username/plugin:1]
resolvers:
  - resolver: username/resolver:1
    config: {}
    files: ['**/*.json']
```

The `processors` and `plugins` fields accept arrays of strings. The `resolvers` field accepts an array of objects because each resolver needs additional `config` and `files` configuration.
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
    parser = new
    {
        varSyntax = new[] { new[] { "{{", "}}" } }, // Custom delimiters, default [["__", "__"]], commonly overridden to [["{{", "}}"]]
    },
}
```
