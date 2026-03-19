---
name: writing-template-python
description: Write or modify CyanPrint template code in Python. Use when the user asks to add prompts, change template logic, modify the entry point, add processors/plugins/resolvers, or change generated output for a Python template. Covers IInquirer question types (text, select, checkbox, confirm, password, dateSelect), processor configuration, and IDeterminism.
allowed-tools: Read, Grep, Glob, Write
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

Use `d.get()` for all prompt values to ensure deterministic test output:

```python
name = d.get("project-name", lambda: i.text("Project name?", "project-name"))
```

In tests, `deterministic_state` provides values directly. In interactive mode, the fallback function runs.

## Configuring the Default Processor

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
                "varSyntax": [["{{", "}}"]],  # Optional: customize delimiters
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

## Type Definitions

### Cyan

```python
class Cyan:
    processors: list[CyanProcessor]
    plugins: list[CyanPlugin]
```

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
    "varSyntax": [["{{", "}}"]],      # Custom delimiters, default [["{{", "}}"]]
}
```
