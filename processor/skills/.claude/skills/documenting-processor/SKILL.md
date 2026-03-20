---
name: documenting-processor
description: Document this CyanPrint processor into README.MD. Use when the user asks to document the processor, write a README, explain processor configuration, or describe file transformations. Reads cyan.yaml and entry point code to extract config schema and file handling.
allowed-tools: Read, Grep, Glob, Write
---

# Documenting this Processor

## Step 1: Understand the artifact

Read `cyan.yaml` to extract:

- **name**: The processor's full identifier (e.g., `username/processor-name`)
- **description**: What the processor does
- **tags**: Categories for discoverability
- **build**: Image registry information
- **glob patterns**: What file types/patterns are processed

Read the entry point code (`cyan/index.ts` or equivalent for other languages) to extract:

- What `input.config` keys the processor reads
- Which `fileHelper` methods are used (`resolveAll`, `read`, `get`, `copy`)
- What file transformations happen (variable substitution, string replacement, code generation)
- Whether new files are created or existing files modified

## Step 2: Generate README.MD

Follow the section template in [reference.md](./reference.md).

The README must include:

1. **Title** — the processor name from `cyan.yaml`
2. **Description** — from `cyan.yaml`
3. **Purpose** — what the processor transforms
4. **Configuration Schema** — a table of key, type, default, and description for each config entry
5. **File Handling** — which glob patterns, what transformations
6. **Before/After Examples** — showing input and output for common transformations

## Step 3: Write README.MD

Write the generated README.MD to the project root.
