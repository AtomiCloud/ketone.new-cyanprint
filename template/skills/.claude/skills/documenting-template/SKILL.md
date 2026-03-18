---
name: documenting-template
description: Document this CyanPrint template into README.MD. Use when the user asks to document the template, write a README, explain how to use the template, or add usage documentation. Reads cyan.yaml and entry point code to generate accurate, artifact-specific docs.
allowed-tools: Read, Grep, Glob, Write
---

# Documenting this Template

## Step 1: Understand the artifact

Read `cyan.yaml` to extract:

- **name**: The template's full identifier (e.g., `username/template-name`)
- **description**: What the template generates
- **tags**: Categories for discoverability
- **build**: Image registry information

Read the entry point code (`cyan/index.ts` or equivalent for other languages) to extract:

- All prompt IDs — the `id` parameter in every `i.text(...)`, `i.select(...)`, `i.checkbox(...)`, `i.confirm(...)`, `i.password(...)`, `i.dateSelect(...)` call
- The description/message text for each prompt
- What processors and plugins are declared in the return value
- What variables are configured in processor configs

## Step 2: Generate README.MD

Follow the section template in [reference.md](./reference.md).

The README must include:

1. **Title** — the template name from `cyan.yaml`
2. **Description** — from `cyan.yaml`
3. **Usage** — `cyanprint create {username}/{name}` with a `cyan.yaml` snippet
4. **Prompts** — a table of every prompt ID, its description, and its type (text/select/checkbox/confirm/password/dateSelect)
5. **Answer State Automation** — example `answer_state` keyed to the actual prompt IDs
6. **Variable Syntax** — `{{var}}` with processor vars documented
7. **Dependencies** — language runtime, SDK packages

## Step 3: Write README.MD

Write the generated README.MD to the project root.
