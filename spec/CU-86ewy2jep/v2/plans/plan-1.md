# Plan 1: Rewrite All 12 Skills + 4 CLAUDE.md Files

## Goal

Rewrite all 12 CyanPrint skill SKILL.md files, create 12 new reference.md supporting files, and fix 4 CLAUDE.md files to use correct SDK names and introspection-first patterns.

## Approach

Work by artifact type (template → plugin → processor → resolver), doing all 3 skills + reference.md + CLAUDE.md for each type before moving to the next.

---

## Verified SDK Reference (use this, nothing else)

### Package Names

| Language   | Package                | Entry Points                                                                                                  |
| ---------- | ---------------------- | ------------------------------------------------------------------------------------------------------------- |
| TypeScript | `@atomicloud/cyan-sdk` | `StartTemplateWithLambda`, `StartPluginWithLambda`, `StartProcessorWithLambda`, `StartResolverWithLambda`     |
| JavaScript | `@atomicloud/cyan-sdk` | Same as TypeScript                                                                                            |
| Python     | `cyanprintsdk`         | `start_template_with_fn`, `start_plugin_with_fn`, `start_processor_with_fn`, `start_resolver_with_fn`         |
| C#         | `sulfone_helium`       | `CyanEngine.StartTemplate`, `CyanEngine.StartPlugin`, `CyanEngine.StartProcessor`, `CyanEngine.StartResolver` |

### Template SDK

- **Entry point**: `StartTemplateWithLambda(async (i: IInquirer, d: IDeterminism) => Cyan)`
- **IInquirer methods**: `text(msg, id)`, `select(msg, id, options)`, `checkbox(msg, id, options)`, `confirm(msg, id)`, `password(msg, id)`, `dateSelect(msg, id)`
- **IDeterminism**: `d.get(key: string, origin: () => string): string`
- **Cyan return**: `{ processors: CyanProcessor[], plugins: CyanPlugin[] }`
- `CyanProcessor`: `{ name: string, files: CyanGlob[], config: unknown }`
- `CyanPlugin`: `{ name: string, config: unknown }`
- `CyanGlob`: `{ root?: string, glob: string, exclude: string[], type: GlobType }`
- `GlobType`: `Template` (0) | `Copy` (1)

### Processor SDK

- **Entry point**: `StartProcessorWithLambda(async (input: CyanProcessorInput, fileHelper: CyanFileHelper) => ProcessorOutput)` — TWO parameters
- `CyanProcessorInput`: `{ readDirectory: string, writeDirectory: string, globs: CyanGlob[], config: unknown }`
- **CyanFileHelper methods**:
  - `resolveAll()` → `VirtualFile[]` — reads all Template globs, copies all Copy globs. Start here.
  - `read(glob)` → `VirtualFile[]` — reads file contents matching a CyanGlob
  - `get(glob)` → `VirtualFileReference[]` — lazy references; call `.readFile()` to get VirtualFile
  - `readAsStream(glob)` → `VirtualFileStream[]`
  - `copy(glob)` → `void` — copy files from read dir to write dir
  - `readDir` / `writeDir` — resolved directory paths (strings)
- **VirtualFile**: `content: string`, `relative: string`, `read: string`, `write: string`, `writeFile()`
- **VirtualFileReference**: lazy — call `.readFile()` → `VirtualFile`
- **ProcessorOutput**: `{ directory: string }`

### Plugin SDK

- **Entry point**: `StartPluginWithLambda(async (input: PluginInput) => PluginOutput)` — ONE parameter only
- `PluginInput`: `{ directory: string, config: unknown }` — NO file helpers, NO readDir/readFile/fileExists
- Plugins use **native OS operations**:
  - File I/O: `fs` (Node), `pathlib/open` (Python), `System.IO` (C#)
  - Command execution: `child_process` (Node), `subprocess` (Python), `Process` (C#)
- **PluginOutput**: `{ directory: string }`

### Resolver SDK

- **Entry point**: `StartResolverWithLambda(async (input: ResolverInput) => ResolverOutput)`
- `ResolverInput`: `{ config: Record<string, unknown>, files: ResolvedFile[] }`
- `ResolvedFile`: `{ path: string, content: string, origin: FileOrigin }` — all files have same `path`
- `FileOrigin`: `{ template: string, layer: number }` — **layer is number, NOT string**
- **ResolverOutput**: `{ path: string, content: string }` — single resolved file
- **Commutativity/associativity**: sort arrays, deduplicate, define priority; CyanPrint may call in any order

---

## Part A: Documenting Skills (4 SKILL.md + 4 reference.md)

### Common Pattern for All Documenting Skills

Every documenting SKILL.md follows this structure:

```markdown
---
name: documenting-{type}
description: { trigger-rich description from spec Part 4 }
allowed-tools: Read, Grep, Glob, Write
---

# Documenting this {Type}

## Step 1: Understand the artifact

Read `cyan.yaml` → name, description, tags, build info
Read entry point code → extract behavior, config schema

## Step 2: Generate README.MD

Follow the section template in reference.md for {type}

## Step 3: Write README.MD

Write to project root
```

### documenting-template

**File**: `template/skills/.claude/skills/documenting-template/SKILL.md`

**Description**: `Document this CyanPrint template into README.MD. Use when the user asks to document the template, write a README, explain how to use the template, or add usage documentation. Reads cyan.yaml and entry point code to generate accurate, artifact-specific docs.`

**SKILL.md content**:

- Step 1: Read `cyan.yaml` → extract name, description, processors/plugins declared
- Step 2: Read entry point (`cyan/index.ts` or equivalent) → extract all prompt IDs (`i.text(...)`, `i.select(...)`, etc.) and their descriptions
- Step 3: Generate README.MD with sections: Title, Description, Usage (cyan.yaml snippet), Prompts (table of ID → description → type), Answer State Automation, Variable Syntax, Dependencies
- Step 4: Write to project root

**reference.md** (`template/skills/.claude/skills/documenting-template/reference.md`):

- README.MD template with placeholders: `{artifact-name}`, `{description}`, `{prompts-table}`, etc.
- Example Usage section showing how to reference this template in a parent template's `cyan.yaml`
- Example answer_state section showing how to automate prompts
- Variable syntax documentation (`{{var}}` with processor vars)

### documenting-plugin

**File**: `plugin/skills/.claude/skills/documenting-plugin/SKILL.md`

**Description**: `Document this CyanPrint plugin into README.MD. Use when the user asks to document the plugin, write a README, explain plugin configuration, or describe what the plugin validates or transforms. Reads cyan.yaml and entry point code to extract config schema and behavior.`

**SKILL.md content**:

- Step 1: Read `cyan.yaml` → extract name, description
- Step 2: Read entry point → extract what `input.config` keys are read, what the plugin does (validation? transformation? command execution?)
- Step 3: Generate README.MD with sections: Title, Description, Purpose (validation vs transformation), Configuration Schema (table of key → type → default → description), Error/Warning Messages, Integration Example
- Step 4: Write to project root

**reference.md**: README template for plugins with config schema table, integration example cyan.yaml snippet

### documenting-processor

**File**: `processor/skills/.claude/skills/documenting-processor/SKILL.md`

**Description**: `Document this CyanPrint processor into README.MD. Use when the user asks to document the processor, write a README, explain processor configuration, or describe file transformations. Reads cyan.yaml and entry point code to extract config schema and file handling.`

**SKILL.md content**:

- Step 1: Read `cyan.yaml` → extract name, description, glob patterns
- Step 2: Read entry point → extract what `input.config` keys are read, which `fileHelper` methods are used, what file transformations happen
- Step 3: Generate README.MD with sections: Title, Description, Purpose, Configuration Schema, File Handling (which file types/patterns, what transformations), Before/After Examples
- Step 4: Write to project root

**reference.md**: README template for processors with glob pattern documentation, file transformation examples

### documenting-resolver

**File**: `resolver/skills/.claude/skills/documenting-resolver/SKILL.md`

**Description**: `Document this CyanPrint resolver into README.MD. Use when the user asks to document the resolver, write a README, explain conflict resolution strategy, or describe merge behavior. Reads cyan.yaml and entry point code to extract config schema and resolution logic.`

**SKILL.md content**:

- Step 1: Read `cyan.yaml` → extract name, description
- Step 2: Read entry point → extract `config` keys, resolution strategy (how FileOrigin is used, priority rules, merge logic)
- Step 3: Generate README.MD with sections: Title, Description, Purpose, Configuration Schema, Resolution Strategy, Origin Handling, Merge Examples
- Step 4: Write to project root

**reference.md**: README template for resolvers with conflict resolution strategy documentation, FileOrigin explanation

---

## Part B: Writing Skills (4 SKILL.md + 4 reference.md)

### writing-template

**File**: `template/skills/.claude/skills/writing-template/SKILL.md`

**Description**: `Write or modify CyanPrint template code. Use when the user asks to add prompts, change template logic, modify the entry point, add processors/plugins/resolvers, or change generated output. Covers IInquirer question types (text, select, checkbox, confirm, password, dateSelect), processor configuration, and IDeterminism.`

**SKILL.md content**:

- Entry point structure: `StartTemplateWithLambda(async (i: IInquirer, d: IDeterminism) => Cyan)`
- All 6 question types with simple and Q-form syntax:
  - `text(msg, id)` / `textQ({ message, id, validate?, default?, initial? })` → `string`
  - `select(msg, id, options)` / `selectQ({ message, id, choices: [{value, label}] })` → `string`
  - `checkbox(msg, id, options)` / `checkboxQ({ message, id, choices })` → `string[]`
  - `confirm(msg, id)` / `confirmQ({ message, id, default?, errorMessage? })` → `boolean`
  - `password(msg, id)` / `passwordQ({ message, id, confirmation? })` → `string`
  - `dateSelect(msg, id)` / `dateSelectQ({ message, id, min?, max?, validate? })` → `string`
- IDeterminism: `d.get(key, () => fallback)` — use for all prompt values to ensure deterministic test output
- Configuring `cyan/default` processor with `vars` map and optional `varSyntax`
- Adding `CyanPlugin` entries
- `CyanGlob` and `GlobType` (Template vs Copy)

**reference.md**: Full SDK type definitions, multi-language entry point skeletons (TypeScript, JavaScript, Python, C#)

### writing-plugin

**File**: `plugin/skills/.claude/skills/writing-plugin/SKILL.md`

**Description**: `Write or modify CyanPrint plugin code. Use when the user asks to add validation rules, change plugin behavior, modify the entry point, run commands from a plugin, or mutate files. Covers entry point (StartPluginWithLambda), native filesystem I/O, and command execution (child_process/subprocess). Plugins receive { directory, config } and use native OS operations.`

**SKILL.md content**:

- Entry point: `StartPluginWithLambda(async (input: PluginInput) => PluginOutput)` — **ONE parameter only**
- `PluginInput`: `{ directory: string, config: unknown }` — NO SDK file helpers
- Native file I/O patterns per language:
  - TypeScript/JavaScript: `fs.readFileSync`, `fs.writeFileSync`, `fs.readdirSync`
  - Python: `pathlib.Path(input.directory)`, `open()`
  - C#: `System.IO.File.ReadAllText`, `System.IO.File.WriteAllText`
- Command execution patterns per language:
  - TypeScript/JavaScript: `child_process.execSync`
  - Python: `subprocess.run`
  - C#: `System.Diagnostics.Process`
- File mutation workflow: read files from `input.directory`, modify content, write back

**reference.md**: Full SDK type definitions, multi-language entry point skeletons, native I/O examples

### writing-processor

**File**: `processor/skills/.claude/skills/writing-processor/SKILL.md`

**Description**: `Write or modify CyanPrint processor code. Use when the user asks to change file transformations, modify the entry point, handle file processing, or change output generation. Covers entry point (StartProcessorWithLambda), CyanFileHelper (read/write/copy/resolveAll), and VirtualFile (content/read/write). Processor lambda receives (input, fileHelper) as two parameters.`

**SKILL.md content**:

- Entry point: `StartProcessorWithLambda(async (input: CyanProcessorInput, fileHelper: CyanFileHelper) => ProcessorOutput)` — **TWO parameters**
- `CyanProcessorInput`: `{ readDirectory, writeDirectory, globs, config }`
- **CyanFileHelper** — the primary API:
  - `fileHelper.resolveAll()` → `VirtualFile[]` — **call this first** — reads all Template globs, copies all Copy globs
  - `fileHelper.read(glob)` → `VirtualFile[]` — read files matching a specific CyanGlob
  - `fileHelper.get(glob)` → `VirtualFileReference[]` — lazy references, call `.readFile()` to materialize
  - `fileHelper.copy(glob)` → `void` — copy files as-is
  - `fileHelper.readDir` / `fileHelper.writeDir` — resolved directory paths
- **VirtualFile** manipulation:
  - `file.content` — read or write the file content as string
  - `file.relative` — path relative to read dir
  - `file.writeFile()` — persist changes to disk
- Return `{ directory: input.writeDirectory }`

**reference.md**: Full SDK type definitions, multi-language entry point skeletons, VirtualFile examples

### writing-resolver

**File**: `resolver/skills/.claude/skills/writing-resolver/SKILL.md`

**Description**: `Write or modify CyanPrint resolver code. Use when the user asks to change conflict resolution logic, modify merge strategies, handle file origins, or change resolution behavior. Covers entry point (StartResolverWithLambda), ResolverInput/ResolverOutput, ResolvedFile, and FileOrigin. Must ensure commutativity and associativity (sort, unique, deterministic ordering).`

**SKILL.md content**:

- Entry point: `StartResolverWithLambda(async (input: ResolverInput) => ResolverOutput)`
- `ResolverInput`: `{ config: Record<string, unknown>, files: ResolvedFile[] }`
- **All `files` entries have the same `path`** — that's the conflict being resolved
- `ResolvedFile`: `{ path: string, content: string, origin: FileOrigin }`
- `FileOrigin`: `{ template: string, layer: number }` — **layer is `number`, NOT `string`**
- Return `{ path, content }` — single resolved file
- **Commutativity requirements**:
  - Sort arrays before concatenation
  - Deduplicate items (use `unique`)
  - Define deterministic priority when origins conflict
  - CyanPrint may call with files in any order — result must be identical

**reference.md**: Full SDK type definitions, multi-language entry point skeletons, commutativity patterns

---

## Part C: Testing Skills (4 SKILL.md + 4 reference.md)

### Common Pattern for All Testing Skills

Every testing SKILL.md follows this structure:

```markdown
---
name: testing-{type}
description: { trigger-rich description from spec Part 4 }
---

# Testing this {Type}

## Step 1: Understand what to test

Read the entry point code to find YOUR config/prompt keys

## Step 2: Write test.cyan.yaml

Follow the format for {type} tests (see reference.md for examples)

## Step 3: Run and iterate

cyanprint test {type} . --update-snapshots
```

### testing-template

**File**: `template/skills/.claude/skills/testing-template/SKILL.md`

**Description**: `Test this CyanPrint template. Use when the user asks to write tests, add test cases, update snapshots, or debug template test failures. Covers test.cyan.yaml format with answer_state, deterministic_state, validate commands, and snapshot testing.`

**SKILL.md content**:

- Step 1: Read entry point → find YOUR prompt IDs (the `id` parameter in `i.text(msg, id)`, `i.select(msg, id, opts)`, etc.)
- Step 2: Write `test.cyan.yaml` with:
  - `answer_state` — keyed to YOUR prompt IDs (NOT `cyan/new/` keys)
  - `deterministic_state` — for `d.get()` fallbacks
  - `validate` — optional commands to run on output
  - `snapshots` — expected output directories
- Step 3: Run `cyanprint test template .` and iterate

**reference.md**: Complete test.cyan.yaml example showing answer_state keyed to actual prompt IDs, deterministic_state for IDeterminism, validate commands, snapshot structure

### testing-plugin

**File**: `plugin/skills/.claude/skills/testing-plugin/SKILL.md`

**Description**: `Test this CyanPrint plugin. Use when the user asks to write plugin tests, add test cases with input files and config, update snapshots, or debug plugin test failures. Covers test.cyan.yaml format with input files, config, expect (errors/warnings), and snapshots.`

**SKILL.md content**:

- Step 1: Read entry point → find what `input.config` keys the plugin reads
- Step 2: Write `test.cyan.yaml` with:
  - `input` — test input files
  - `config` — keyed to YOUR plugin's config keys (extracted from entry point, NOT fictional examples)
  - `expect` — `errors` and `warnings` arrays (for validation plugins)
  - `validate` — optional commands
  - `snapshots` — expected output
- Step 3: Run `cyanprint test plugin .` and iterate

**reference.md**: Complete test.cyan.yaml examples for validation plugin and transformation plugin, with actual config keys from a real plugin

### testing-processor

**File**: `processor/skills/.claude/skills/testing-processor/SKILL.md`

**Description**: `Test this CyanPrint processor. Use when the user asks to write processor tests, add test cases with input files, update snapshots, or debug processor test failures. Covers test.cyan.yaml format with input files, config, validate commands, and snapshots.`

**SKILL.md content**:

- Step 1: Read entry point → find what `input.config` keys the processor reads, what file patterns it handles
- Step 2: Write `test.cyan.yaml` with:
  - `input` — test input files matching the processor's glob patterns
  - `config` — keyed to YOUR processor's config keys (extracted from entry point, NOT fictional examples)
  - `validate` — optional commands
  - `snapshots` — expected output
- Step 3: Run `cyanprint test processor .` and iterate

**reference.md**: Complete test.cyan.yaml example with input files, config, and snapshots

### testing-resolver

**File**: `resolver/skills/.claude/skills/testing-resolver/SKILL.md`

**Description**: `Test this CyanPrint resolver. Use when the user asks to write resolver tests, add test cases with conflicting files, update snapshots, or debug resolver test failures. Covers test.cyan.yaml format with resolver_inputs (multiple files, same path), config, and snapshots.`

**SKILL.md content**:

- Step 1: Read entry point → find what `input.config` keys the resolver reads, what strategy it uses
- Step 2: Write `test.cyan.yaml` with:
  - `resolver_inputs` — array of multiple entries with **same path** but different origins:
    ```yaml
    resolver_inputs:
      - path: 'config.yaml'
        content: 'version: 1'
        origin:
          template: 'template-a'
          layer: 0
      - path: 'config.yaml'
        content: 'version: 2'
        origin:
          template: 'template-b'
          layer: 1
    ```
  - `config` — keyed to YOUR resolver's config keys
  - `validate` — optional commands
  - `snapshots` — expected resolved output
- Step 3: Run `cyanprint test resolver .` and iterate

**reference.md**: Complete test.cyan.yaml example with resolver_inputs showing conflict resolution

---

## Part D: CLAUDE.md Fixes (4 files)

Each CLAUDE.md needs wrong SDK names corrected:

### Errors to fix across all 4 CLAUDE.md files

| Current (Wrong)      | Correct          | File                                      |
| -------------------- | ---------------- | ----------------------------------------- |
| `cyan_sdk`           | `cyanprintsdk`   | All 4 CLAUDE.md files that mention Python |
| `Atomicloud.CyanSDK` | `sulfone_helium` | All 4 CLAUDE.md files that mention C#     |

### Per-File Specific Fixes

**`template/skills/CLAUDE.md`**:

- Fix Python import: `from cyan_sdk import ...` → `from cyanprintsdk import start_template_with_fn, ...`
- Fix C# namespace: `Atomicloud.CyanSDK` → `sulfone_helium`
- Verify all SDK type references match the verified reference above

**`plugin/skills/CLAUDE.md`**:

- Fix Python import: `from cyan_sdk import ...` → `from cyanprintsdk import start_plugin_with_fn, ...`
- Fix C# namespace: `Atomicloud.CyanSDK` → `sulfone_helium`
- Remove any mention of `readDir`, `readFile`, `fileExists` on PluginInput — these do NOT exist
- Document that PluginInput only has `{ directory, config }`

**`processor/skills/CLAUDE.md`**:

- Fix Python import: `from cyan_sdk import ...` → `from cyanprintsdk import start_processor_with_fn, ...`
- Fix C# namespace: `Atomicloud.CyanSDK` → `sulfone_helium`
- Fix entry point signature: single `(input)` → two params `(input, fileHelper)`
- Add CyanFileHelper documentation

**`resolver/skills/CLAUDE.md`**:

- Fix Python import: `from cyan_sdk import ...` → `from cyanprintsdk import start_resolver_with_fn, ...`
- Fix C# namespace: `Atomicloud.CyanSDK` → `sulfone_helium`
- Fix FileOrigin: `layer: string` → `layer: number`
- Add commutativity/associativity documentation

---

## Complete File List

```
# Template (7 files)
template/skills/.claude/skills/documenting-template/SKILL.md     (rewrite)
template/skills/.claude/skills/documenting-template/reference.md (NEW)
template/skills/.claude/skills/writing-template/SKILL.md         (rewrite)
template/skills/.claude/skills/writing-template/reference.md     (NEW)
template/skills/.claude/skills/testing-template/SKILL.md         (rewrite)
template/skills/.claude/skills/testing-template/reference.md     (NEW)
template/skills/CLAUDE.md                                        (fix SDK names)

# Plugin (7 files)
plugin/skills/.claude/skills/documenting-plugin/SKILL.md         (rewrite)
plugin/skills/.claude/skills/documenting-plugin/reference.md     (NEW)
plugin/skills/.claude/skills/writing-plugin/SKILL.md             (rewrite)
plugin/skills/.claude/skills/writing-plugin/reference.md         (NEW)
plugin/skills/.claude/skills/testing-plugin/SKILL.md             (rewrite)
plugin/skills/.claude/skills/testing-plugin/reference.md         (NEW)
plugin/skills/CLAUDE.md                                          (fix SDK names)

# Processor (7 files)
processor/skills/.claude/skills/documenting-processor/SKILL.md   (rewrite)
processor/skills/.claude/skills/documenting-processor/reference.md (NEW)
processor/skills/.claude/skills/writing-processor/SKILL.md       (rewrite)
processor/skills/.claude/skills/writing-processor/reference.md   (NEW)
processor/skills/.claude/skills/testing-processor/SKILL.md       (rewrite)
processor/skills/.claude/skills/testing-processor/reference.md   (NEW)
processor/skills/CLAUDE.md                                       (fix SDK names)

# Resolver (7 files)
resolver/skills/.claude/skills/documenting-resolver/SKILL.md     (rewrite)
resolver/skills/.claude/skills/documenting-resolver/reference.md (NEW)
resolver/skills/.claude/skills/writing-resolver/SKILL.md         (rewrite)
resolver/skills/.claude/skills/writing-resolver/reference.md     (NEW)
resolver/skills/.claude/skills/testing-resolver/SKILL.md         (rewrite)
resolver/skills/.claude/skills/testing-resolver/reference.md     (NEW)
resolver/skills/CLAUDE.md                                        (fix SDK names)
```

Total: 16 modified files + 12 new files = 28 file operations

## Verification Checklist

- [ ] No hardcoded example names in any skill (grep for `cyan/` in skills dirs)
- [ ] No `cyan/new/` references in any skill (meta-template leakage)
- [ ] All SDK names correct (`cyanprintsdk`, `sulfone_helium`, NOT `cyan_sdk` or `Atomicloud.CyanSDK`)
- [ ] Processor entry point has two params `(input, fileHelper)`, not one
- [ ] Plugin uses native fs, not invented `readFile/readDir/fileExists` methods
- [ ] FileOrigin.layer is documented as `number`, not `string`
- [ ] All descriptions contain trigger phrases and "Use when" clauses
- [ ] All documenting skills start with introspection step
- [ ] All testing skills instruct reading entry point for prompt/config keys
- [ ] Supporting files (reference.md) exist for each skill
- [ ] All CLAUDE.md files have correct SDK names

## Edge Cases

- Skills are copied via `GlobType.Copy` — no `{{var}}` substitution, so no brace escaping needed
- `reference.md` must live alongside SKILL.md in the same directory for progressive disclosure to work
- CLAUDE.md files live at `{type}/skills/CLAUDE.md` (parent of `.claude/skills/`), not inside the skills dirs

## Integration with Plan 2

Plan 2 will run `cyanprint test template --test <test_name> --update-snapshots .` for each test to regenerate snapshots with the new skill content. All `*_with_skills` snapshots will change because the skill files they contain are being rewritten.
