# README.MD Template for CyanPrint Templates

Use this template when generating README.MD files. Replace all `{placeholders}` with actual values extracted from `cyan.yaml` and the entry point code.

---

````markdown
# {artifact-name}

{description}

## Usage

### Run directly

To create a new project from this template:

```bash
cyanprint create {artifact-name}
```
````

### Reference in a parent template

To use this template as a dependency in another CyanPrint template's `cyan.yaml`:

```yaml
dependencies:
  templates:
    - name: { artifact-name }
      version: '1.0.0'
```

## Prompts

When you run `cyanprint create`, the template will ask the following questions:

{prompts-table}

<!-- Example prompts table format:
| Prompt ID     | Description                        | Type     |
| ------------- | ---------------------------------- | -------- |
| name          | Name of the project                | text     |
| language      | Programming language to use        | select   |
| features      | Features to include                | checkbox |
| use_docker    | Include Docker configuration?      | confirm  |
-->

## Answer State Automation

You can pre-answer all prompts in a `test.cyan.yaml` or answer state file:

```yaml
answer_state: { answer-state-example }
```

<!-- Example answer_state keyed to actual prompt IDs:
answer_state:
  name: my-project
  language: Typescript
  features:
    - docker
    - ci
  use_docker: true
-->

## Variables

Templates use double-brace syntax for variable substitution:

```
{{variable_name}}
```

### Available Variables

{variable-syntax}

<!-- List the variables passed to the processor config `vars` map, e.g.:
| Variable    | Description                  |
| ----------- | ---------------------------- |
| name        | Project name                 |
| username    | CyanPrint username           |
| description | Project description          |
-->

## Dependencies

{dependencies}

<!-- List processors and plugins used by this template:
### Processors
- `cyan/default` — Default variable substitution processor

### Plugins
- (none)
-->
