---
name: documenting-plugin
description: Document this CyanPrint plugin into README.MD. Use when the user asks to document the plugin, write a README, explain plugin configuration, or describe what the plugin validates or transforms. Reads cyan.yaml and entry point code to extract config schema and behavior.
---

# Documenting this Plugin

## Step 1: Understand the artifact

Read `cyan.yaml` to extract:

- **name**: The plugin's full identifier (e.g., `username/plugin-name`)
- **description**: What the plugin does
- **tags**: Categories for discoverability
- **build**: Image registry information

Read the entry point code (`cyan/index.ts` or equivalent for other languages) to extract:

- What `input.config` keys the plugin reads
- What the plugin does: validation? transformation? command execution?
- What files it reads, modifies, or checks
- Any error or warning messages it produces

## Step 2: Generate README.MD

Follow the section template in [reference.md](./reference.md).

The README must include:

1. **Title** — the plugin name from `cyan.yaml`
2. **Description** — from `cyan.yaml`
3. **Purpose** — validation vs transformation
4. **Configuration Schema** — a table of key, type, default, and description for each config entry
5. **Error/Warning Messages** — for validation plugins, what errors/warnings can occur
6. **Integration Example** — how to reference this plugin in a parent template's `cyan.yaml`

## Step 3: Write README.MD

Write the generated README.MD to the project root.
