---
name: writing-template-python
description: Write or modify CyanPrint template code in Python. Use when the user asks to add prompts, change template logic, modify the entry point, add processors/plugins/resolvers, or change generated output for a Python template. Covers IInquirer question types (text, select, checkbox, confirm, password, dateSelect), processor configuration, and IDeterminism for non-deterministic values.
---

# Writing this Template (Python)

## Entry Point Structure

```python
from cyanprintsdk import start_template_with_fn, IInquirer, IDeterminism, Cyan, CyanProcessor, CyanGlob, GlobType

def template_fn(i: IInquirer, d: IDeterminism) -> Cyan:
    name = i.text("Project name", "name")
    language = i.select("Language", "language", ["TypeScript", "Python"])

    return Cyan(
        processors=[
            CyanProcessor(
                name="cyan/default",
                files=[
                    CyanGlob(
                        root=f"template/{language.lower()}",
                        glob="**/*",
                        exclude=[],
                        type=GlobType.Template,
                    )
                ],
                config={"vars": {"name": name, "language": language}},
            )
        ],
        plugins=[],
    )

start_template_with_fn(template_fn)
```

## IInquirer -- Prompting Users

Six question types are available. Each has a simple form and a Q-form with additional options:

### text -- Free-text input

```python
# Simple form
name = i.text("What is the project name?", "project-name")

# Q-form with validation and defaults
name = i.text_q(
    message="What is the project name?",
    id="project-name",
    validate=lambda v: None if re.match(r'^[a-z0-9-]+$', v) else 'Use lowercase letters, numbers, and hyphens',
    default="my-project",
    initial="my-project",
)
```

### select -- Single choice

```python
# Simple form
lang = i.select("What language?", "language", ["TypeScript", "Python", "C#", "JavaScript"])

# Q-form with labeled choices
lang = i.select_q(
    message="What language?",
    id="language",
    choices=[
        {"value": "typescript", "label": "TypeScript"},
        {"value": "python", "label": "Python"},
        {"value": "csharp", "label": "C#"},
        {"value": "javascript", "label": "JavaScript"},
    ],
)
```

### checkbox -- Multiple choices

```python
# Simple form
features = i.checkbox("Which features?", "features", ["auth", "logging", "testing"])

# Q-form
features = i.checkbox_q(
    message="Which features?",
    id="features",
    choices=[
        {"value": "auth", "label": "Authentication"},
        {"value": "logging", "label": "Logging"},
        {"value": "testing", "label": "Testing"},
    ],
)
```

### confirm -- Yes/No

```python
# Simple form
include_tests = i.confirm("Include tests?", "include-tests")

# Q-form
include_tests = i.confirm_q(
    message="Include tests?",
    id="include-tests",
    default=True,
    error_message="Please answer yes or no",
)
```

### password -- Secret input

```python
# Simple form
api_key = i.password("Enter API key:", "api-key")

# Q-form
api_key = i.password_q(
    message="Enter API key:",
    id="api-key",
    confirmation=True,
)
```

### dateSelect -- Date picker

```python
# Simple form
date = i.date_select("Select release date:", "release-date")

# Q-form
date = i.date_select_q(
    message="Select release date:",
    id="release-date",
    min="2024-01-01",
    max="2025-12-31",
    validate=lambda v: 'Date must be in the future' if v > datetime.now() else None,
)
```

## IDeterminism -- Deterministic Values

Use `d.get()` for values that are inherently non-deterministic (e.g., timestamps, random strings, UUIDs). User inputs from `i.text()`, `i.select()`, etc. do NOT need wrapping — the test harness provides deterministic answers via `answer_state`.

```python
# Only wrap non-deterministic values
import time, uuid
branch_name = d.get("branch-name", lambda: f"feat-{int(time.time())}")
unique_id = d.get("unique-id", lambda: str(uuid.uuid4()))

# User inputs are already deterministic — no d.get() needed
name = i.text("Project name", "name")
lang = i.select("Language", "language", ["TypeScript", "Python"])
```

### Why Determinism Matters

Each template script is executed multiple times — during generation, testing, and re-generation. Without `d.get()`, values from `datetime.now()`, `random`, `uuid.uuid4()`, or other non-deterministic sources produce different output each time, breaking snapshot tests.

`d.get()` solves this by generating a value on first execution and storing it. Subsequent executions return the stored value instead of generating a new one.

### When to Use d.get()

Only wrap values that would naturally differ between runs:

- **Use `d.get()`**: `datetime.now()`, `time.time()`, `random`, `uuid.uuid4()`, or any other non-deterministic source
- **Do NOT wrap**: `i.text()`, `i.select()`, `i.checkbox()`, `i.confirm()`, `i.password()`, `i.date_select()` — these are user inputs, and the test harness provides deterministic answers via `answer_state`

**What breaks without it**: Snapshot tests fail because each run produces different output for non-deterministic values. The `cyanprint test --update-snapshots` command will appear to succeed, but subsequent test runs will fail on the now-stale snapshots.

```python
# WRONG — non-deterministic across runs
branch_name = f"feat-{int(time.time())}"

# CORRECT — stable across runs
branch_name = d.get("branch-name", lambda: f"feat-{int(time.time())}")
```

### How d.get() Works

1. **First execution** (interactive mode): Runs the fallback function, stores the result keyed by the first argument.
2. **Test mode**: Reads directly from `deterministic_state` in `test.cyan.yaml`, ignoring the fallback function entirely.
3. **Re-generation**: Returns the previously stored value, ensuring idempotent output.

## Configuring the Default Processor

The default processor (`cyan/default`) supports these config options:

- `vars`: Template variables for substitution. Supports nested objects. These are substituted using the configured syntax.
- `parser.varSyntax`: Custom delimiter pairs. Pass as array of 2-element arrays, e.g., `[['{{', '}}']]`. **Note**: The actual SDK default is `['var__', '__']`. The meta-template typically injects `{{` `}}` via its own processor config (see the `PromptTemplate` function in this meta-template). When writing a new template, the varSyntax you set here must match the delimiters used in your template files.

**Note**: Globbing is handled automatically by the processor via `fileHelper.resolveAll()`. You don't need to implement file matching yourself.

### Inquirer and GlobType Processing

The processor uses `GlobType` to determine how each file group is handled:

- **GlobType.Template** (0): The processor reads files matching the glob pattern, substitutes `{{var}}` placeholders using `config.vars` and `parser.varSyntax`, then writes the result to the output directory.
- **GlobType.Copy** (1): Files are copied as-is from the source to the output directory with no substitution.

Inquirer prompt results become `config.vars` entries. The `id` parameter of each prompt becomes the variable name used in template files:

```python
name = i.text("Project name", "name")
# → available as {{project-name}} in GlobType.Template files
```

```python
Cyan(
    processors=[
        CyanProcessor(
            name="cyan/default",
            files=[
                CyanGlob(
                    root="template/python",
                    glob="**/*",
                    type=GlobType.Template,  # Process {{var}} substitution
                    exclude=[],
                ),
                CyanGlob(
                    root="template/common",
                    glob="**/*",
                    type=GlobType.Copy,       # Copy files as-is
                    exclude=[],
                ),
            ],
            config={
                "vars": {
                    "username": username,
                    "name": project_name,
                    "description": project_desc,
                },
                "parser": {
                    "varSyntax": [["{{", "}}"]],
                },
            },
        ),
    ],
    plugins=[],
)
```

## Adding Plugins

```python
Cyan(
    processors=[...],
    plugins=[
        CyanPlugin(
            name="username/plugin-name",
            config={ /* plugin-specific config */ },
        ),
    ],
)
```

## Adding Resolvers

```python
Cyan(
    processors=[...],
    plugins=[...],
    resolvers=[
        CyanResolver(
            resolver="username/resolver-name:1",
            config={ /* resolver-specific config */ },
            files=["**/*.json"],
        ),
    ],
)
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

````

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

```python
class Cyan:
    processors: list[CyanProcessor]
    plugins: list[CyanPlugin]
````

### CyanProcessor

```python
class CyanProcessor:
    name: str
    files: list[CyanGlob]
    config: unknown
```

### CyanPlugin

```python
class CyanPlugin:
    name: str
    config: unknown
```

### CyanGlob

```python
class CyanGlob:
    root: str | None
    glob: str
    exclude: list[str]
    type: GlobType
```

### GlobType

```python
class GlobType:
    Template = 0  # Process {{var}} substitution
    Copy = 1       # Copy files as-is
```

### IInquirer

```python
class IInquirer:
    def text(self, msg: str, id: str) -> str: ...
    def text_q(self, message: str, id: str, validate=None, default=None, initial=None) -> str: ...
    def select(self, msg: str, id: str, options: list[str]) -> str: ...
    def select_q(self, message: str, id: str, choices: list[dict]) -> str: ...
    def checkbox(self, msg: str, id: str, options: list[str]) -> list[str]: ...
    def checkbox_q(self, message: str, id: str, choices: list[dict]) -> list[str]: ...
    def confirm(self, msg: str, id: str) -> bool: ...
    def confirm_q(self, message: str, id: str, default=None, error_message=None) -> bool: ...
    def password(self, msg: str, id: str) -> str: ...
    def password_q(self, message: str, id: str, confirmation=None) -> str: ...
    def date_select(self, msg: str, id: str) -> str: ...
    def date_select_q(self, message: str, id: str, min=None, max=None, validate=None) -> str: ...
```

### IDeterminism

```python
class IDeterminism:
    def get(self, key: str, origin: callable) -> str: ...
```

## Default Processor Config

The `cyan/default` processor accepts this config shape:

```python
{
    "vars": {"key": "value"},         # Variables for {{var}} substitution
    "parser": {
        "varSyntax": [["{{", "}}"]],  # Custom delimiters, default [["var__", "__"]], commonly overridden to [["{{", "}}"]]
    },
}
```
