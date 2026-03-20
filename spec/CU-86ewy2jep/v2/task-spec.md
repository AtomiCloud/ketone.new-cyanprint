# Spec v2: Rewrite All 12 CyanPrint Skills

## Context

This repo is a **meta-template** (ketone.new-cyanprint) that generates CyanPrint templates, plugins, processors, and resolvers. Each generated artifact gets skills copied into `.claude/skills/`.

```
Layer 1: This repo (meta-template)
  └─ {type}/skills/.claude/skills/ (writing, documenting, testing)
       ↓ copied via GlobType.Copy ↓
Layer 2: Generated artifact (e.g., a plugin)
  └─ .claude/skills/ + README.MD
       ↓ consumed by ↓
Layer 3: End user running cyanprint create
```

Skills at Layer 2 help the LLM develop/document/test the artifact for Layer 3 consumers.

---

## Part 1: Research — Claude Code Skills Best Practices

Source: Official docs at `https://docs.anthropic.com/en/docs/claude-code/skills`

### Skill Mechanics

- **Model-invoked**: Claude decides when to use a skill based on the `description` field — NOT user-invoked
- **Auto-discovered**: Skills in `.claude/skills/*/SKILL.md` are automatically loaded
- **Progressive disclosure**: Supporting files are loaded on-demand when referenced from SKILL.md

### Frontmatter

- `name` (required): lowercase, hyphens only, max 64 chars
- `description` (required): max 1024 chars — must include WHAT the skill does AND WHEN to use it
- `allowed-tools` (optional): restrict which tools Claude can use while the skill is active

### Description Best Practices

The description is the **most important field** — it determines when Claude activates the skill. Good descriptions:

- Include both WHAT the skill does and WHEN to trigger it
- Contain trigger phrases the user would naturally say (e.g., "document", "README", "test", "write")
- Are specific about scope (what's in/out of bounds)
- List key terms users might mention

**Good example** (from this repo's nix skill):

```yaml
description: Use for ALL Nix flake configuration questions. This includes file structure (flake.nix, nix/, .envrc), adding/removing packages or binaries, PATH configuration, development shells, pre-commit hooks, formatters, linters, enforcers, environment variables, adding registries, and how the Nix template structure works. Use when user asks about nix, flake, packages, binaries, shells, PATH, formatting, linting, git hooks, or registries.
```

**Bad example** (current documenting-template):

```yaml
description: Guide for documenting and using CyanPrint templates
```

### Supporting Files

- `reference.md`: Detailed technical specs, complete file lists, compatibility info
- `examples.md`: Practical code examples, real-world use cases, sample workflows
- `scripts/`: Helper utilities, automation scripts
- `templates/`: Reusable templates, code snippets

Pattern: SKILL.md should be concise with instructions + links to supporting files for details.

### Other Best Practices

- Keep each skill focused on ONE capability
- Write clear step-by-step instructions
- Include troubleshooting sections where appropriate
- Test that skills activate when expected

---

## Part 2: Issues With Current Skills (Based on Their Goals)

### Issue Analysis Framework

For each skill, I evaluate: **does this skill achieve its goal at Layer 2 for Layer 3 consumers?**

---

### A. Documenting Skills — Goal: Tell the LLM how to document THIS artifact into README.MD

| Skill                 | Core Issue                                                        | Evidence                                                                                                                                         |
| --------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| documenting-template  | Documents the **meta-template** instead of teaching introspection | References `cyan/new/` keys (meta-template internals), shows meta-template's directory structure, hardcodes answer_state with meta-template keys |
| documenting-plugin    | Uses hardcoded fictional plugin names instead of introspection    | Shows `cyan/lint-validator`, `cyan/license-checker`, `cyan/schema-validator` as examples — none of these exist in the user's artifact            |
| documenting-processor | Same hardcoded example problem                                    | Shows `cyan/license`, `cyan/formatter`, `cyan/env-var-injector` — fictional examples                                                             |
| documenting-resolver  | Same hardcoded example problem                                    | Shows `cyan/json-merge`, `cyan/yaml-merge`, `cyan/last-wins` — fictional examples                                                                |

**Root cause**: All documenting skills describe GENERIC artifact types with HARDCODED examples instead of teaching the LLM to READ the actual artifact's code and generate artifact-specific documentation.

**What they should do**:

1. First step: Read `cyan.yaml` to get artifact name, description, config keys
2. Read entry point code to extract actual prompt IDs, config schema, behavior
3. Generate README.MD sections specific to THIS artifact (not fictional examples)

---

### B. Writing Skills — Goal: Guide the LLM on how to write/modify THIS artifact's code

| Skill             | Core Issue                                         | Evidence                                                                                                                                                                                          |
| ----------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| writing-template  | Wrong SDK names for Python/C#, leaks internal APIs | Python import `cyan_sdk` should be `cyanprintsdk`; C# namespace `Atomicloud.CyanSDK` should be `sulfone_helium`; includes internal registry API URL `api.zinc.sulfone.raichu.cluster.atomi.cloud` |
| writing-plugin    | Wrong SDK names + **invented interface**           | Python/C# SDK name errors; shows `readDir/readFile/fileExists` methods that DON'T EXIST on PluginInput (actual interface only has `{ directory, config }`)                                        |
| writing-processor | Wrong SDK names + **wrong entry point signature**  | SDK name errors; shows single `(input)` param but actual entry is `(input, fileHelper)` — missing the CyanFileHelper parameter                                                                    |
| writing-resolver  | Wrong SDK names + wrong FileOrigin type            | SDK name errors; shows `layer: string` but actual type is `layer: number`                                                                                                                         |

**Root cause**: SDK interfaces were guessed/hallucinated, not verified against actual helium source:

- Python: `cyanprintsdk` (correct) not `cyan_sdk`
- C#: `sulfone_helium` (correct) not `Atomicloud.CyanSDK`
- PluginInput: only `{ directory, config }` — no file helpers
- ProcessorInput: separate `CyanFileHelper` parameter with `resolveAll/read/get/copy` methods
- FileOrigin.layer: `number` not `string`

---

### C. Testing Skills — Goal: Guide the LLM on how to test THIS artifact

| Skill             | Core Issue                                                  | Evidence                                                                                                                                                                                            |
| ----------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| testing-template  | Uses meta-template's `cyan/new/` answer_state keys verbatim | Lines 22-30: `cyan/new/create`, `cyan/new/language`, `cyan/new/skills` etc. — these are keys from the meta-template, not from the generated template. A generated template has its OWN prompt keys. |
| testing-plugin    | Hardcoded config for fictional plugin                       | Config uses `requireReadme`, `requireLicense` etc. — specific to a validator plugin that doesn't exist in the user's artifact                                                                       |
| testing-processor | Hardcoded config for fictional processor                    | Config uses `type: MIT`, `holder`, `year` — specific to a license processor that doesn't exist                                                                                                      |
| testing-resolver  | Hardcoded config for fictional resolver                     | Config uses `strategy: deep-merge`, `arrayStrategy` — specific to a JSON merge resolver                                                                                                             |

**Root cause for testing-template**: The skill was written by documenting the meta-template's own test.cyan.yaml, so it inherited the meta-template's answer_state keys. This is a meta-template leakage problem — the skill should teach "read your template's entry point to find YOUR prompt keys", not hardcode the meta-template's keys.

**Root cause for others**: Same pattern — config schemas are for fictional examples, not instructions to read the actual artifact's code to determine test inputs.

---

### D. Cross-Cutting Issues (All 12 Skills)

| Issue                     | Impact                                                                     | Affected Skills                                                                             |
| ------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| **Vague descriptions**    | Claude may never activate these skills                                     | All 12 — descriptions are just "Guide for {verb}ing CyanPrint {type}" with no trigger words |
| **No introspection step** | LLM works blindly instead of reading the actual artifact                   | All 12 — none start with "read cyan.yaml first"                                             |
| **No supporting files**   | All content crammed into one file, no progressive disclosure               | All 12 — no reference.md or examples.md                                                     |
| **No `allowed-tools`**    | Missing tool restriction for skills that should be read-only (documenting) | Documenting skills could use `allowed-tools: Read, Grep, Glob`                              |
| **Meta-template leakage** | References internals meaningless to consumers                              | documenting-template, testing-template                                                      |
| **Wrong SDK names**       | Generated code would fail                                                  | All 4 writing skills                                                                        |

---

## Part 3: Accurate SDK Reference (Verified Against Helium Source)

Source: `/Users/erng/Workspace/atomi/runbook/platforms/sulfone/helium/sdks/`

### Correct Package Names

| Language   | Package                | Entry Point Functions                                                                                         |
| ---------- | ---------------------- | ------------------------------------------------------------------------------------------------------------- |
| TypeScript | `@atomicloud/cyan-sdk` | `StartTemplateWithLambda`, `StartPluginWithLambda`, `StartProcessorWithLambda`, `StartResolverWithLambda`     |
| JavaScript | `@atomicloud/cyan-sdk` | Same as TypeScript                                                                                            |
| Python     | `cyanprintsdk`         | `start_template_with_fn`, `start_plugin_with_fn`, `start_processor_with_fn`, `start_resolver_with_fn`         |
| C#         | `sulfone_helium`       | `CyanEngine.StartTemplate`, `CyanEngine.StartPlugin`, `CyanEngine.StartProcessor`, `CyanEngine.StartResolver` |

### Template SDK

**Entry point**: `StartTemplateWithLambda(async (i: IInquirer, d: IDeterminism) => Cyan)`

**IInquirer** — All question types:
| Method | Q-form | Returns | Notes |
|--------|--------|---------|-------|
| `text(msg, id)` | `textQ(TextQ)` | `string` | Free text input, supports validate/default/initial |
| `select(msg, id, options)` | `selectQ(SelectQ)` | `string` | Single choice from list |
| `checkbox(msg, id, options)` | `checkboxQ(CheckboxQ)` | `string[]` | Multi-select from list |
| `confirm(msg, id)` | `confirmQ(ConfirmQ)` | `boolean` | Yes/no, supports default/errorMessage |
| `password(msg, id)` | `passwordQ(PasswordQ)` | `string` | Hidden input, supports confirmation |
| `dateSelect(msg, id)` | `dateSelectQ(DateQ)` | `string` | Date picker, supports min/max/validate |

**IDeterminism**: `d.get(key: string, origin: () => string): string` — deterministic values for test reproducibility

**Cyan return type**: `{ processors: CyanProcessor[], plugins: CyanPlugin[] }`

- `CyanProcessor`: `{ name: string, files: CyanGlob[], config: unknown }`
- `CyanPlugin`: `{ name: string, config: unknown }`
- `CyanGlob`: `{ root?: string, glob: string, exclude: string[], type: GlobType }`
- `GlobType`: `Template` (0) | `Copy` (1)

### Processor SDK

**Entry point**: `StartProcessorWithLambda(async (input: CyanProcessorInput, fileHelper: CyanFileHelper) => ProcessorOutput)`

Note: **Two parameters** — `input` and `fileHelper`.

**CyanProcessorInput**: `{ readDirectory: string, writeDirectory: string, globs: CyanGlob[], config: unknown }`

**CyanFileHelper** — File operations:
| Method | Returns | Description |
|--------|---------|-------------|
| `resolveAll()` | `VirtualFile[]` | Reads all Template globs, copies all Copy globs. Start here. |
| `read(glob)` | `VirtualFile[]` | Reads file contents matching a CyanGlob |
| `get(glob)` | `VirtualFileReference[]` | Lazy references; call `.readFile()` to get VirtualFile |
| `readAsStream(glob)` | `VirtualFileStream[]` | Stream-based for large files |
| `copy(glob)` | `void` | Copy files from read dir to write dir |
| `readDir` | `string` | Resolved read directory path |
| `writeDir` | `string` | Resolved write directory path |

**VirtualFile**:

- `content: string` — read/write the file content
- `relative: string` — relative path
- `read: string` — full read path
- `write: string` — full write path
- `writeFile()` — write content to disk

**VirtualFileReference**: lazy — call `.readFile()` → `VirtualFile`

**ProcessorOutput**: `{ directory: string }`

### Plugin SDK

**Entry point**: `StartPluginWithLambda(async (input: PluginInput) => PluginOutput)`

Note: **Only one parameter** — `input`. No built-in file helpers.

**PluginInput**: `{ directory: string, config: unknown }`

Plugins use **native OS operations**:

- **File I/O**: `fs` (Node), `pathlib/open` (Python), `System.IO` (C#)
- **Command execution**: `child_process` (Node), `subprocess` (Python), `Process` (C#)
- **File mutation**: Read files from `input.directory`, modify, write back

**PluginOutput**: `{ directory: string }`

### Resolver SDK

**Entry point**: `StartResolverWithLambda(async (input: ResolverInput) => ResolverOutput)`

**ResolverInput**: `{ config: Record<string, unknown>, files: ResolvedFile[] }`

**ResolvedFile**: `{ path: string, content: string, origin: FileOrigin }`

- All files in the array have the **same `path`** (that's the conflict)

**FileOrigin**: `{ template: string, layer: number }` — note: `layer` is `number`, not `string`

**ResolverOutput**: `{ path: string, content: string }` — single resolved file

**Commutativity/associativity requirements**:

- Resolution must produce the same result regardless of input file order
- Use **sorting** before merge to ensure order independence
- Use **deduplication** (unique) for array concatenation
- Define **priority rules** for which origin wins on conflicts
- CyanPrint may call the resolver with files in any order

---

## Part 4: Guidelines — How to Write Each Skill

### Principle 1: Introspection First

Every skill must start by telling the LLM to READ the artifact's code before taking action.

```
## Step 1: Understand the artifact
Read `cyan.yaml` to learn:
- Artifact name, description, version
- Declared processors/plugins/resolvers
- Build configuration

Read the entry point code to learn:
- What prompts the artifact asks (for templates)
- What config keys it reads (for plugins/processors/resolvers)
- What it actually does (transformation logic, validation rules, resolution strategy)
```

### Principle 2: Trigger-Rich Descriptions

Each description must include:

1. **What** the skill does
2. **When** to use it (trigger phrases)
3. **Scope** (what's in/out of bounds)

| Skill                 | Description                                                                                                                                                                                                                                                                                                                                                                      |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| documenting-template  | Document this CyanPrint template into README.MD. Use when the user asks to document the template, write a README, explain how to use the template, or add usage documentation. Reads cyan.yaml and entry point code to generate accurate, artifact-specific docs.                                                                                                                |
| documenting-plugin    | Document this CyanPrint plugin into README.MD. Use when the user asks to document the plugin, write a README, explain plugin configuration, or describe what the plugin validates or transforms. Reads cyan.yaml and entry point code to extract config schema and behavior.                                                                                                     |
| documenting-processor | Document this CyanPrint processor into README.MD. Use when the user asks to document the processor, write a README, explain processor configuration, or describe file transformations. Reads cyan.yaml and entry point code to extract config schema and file handling.                                                                                                          |
| documenting-resolver  | Document this CyanPrint resolver into README.MD. Use when the user asks to document the resolver, write a README, explain conflict resolution strategy, or describe merge behavior. Reads cyan.yaml and entry point code to extract config schema and resolution logic.                                                                                                          |
| writing-template      | Write or modify CyanPrint template code. Use when the user asks to add prompts, change template logic, modify the entry point, add processors/plugins/resolvers, or change generated output. Covers IInquirer question types (text, select, checkbox, confirm, password, dateSelect), processor configuration, and IDeterminism.                                                 |
| writing-plugin        | Write or modify CyanPrint plugin code. Use when the user asks to add validation rules, change plugin behavior, modify the entry point, run commands from a plugin, or mutate files. Covers entry point (StartPluginWithLambda), native filesystem I/O, and command execution (child_process/subprocess). Plugins receive { directory, config } and use native OS operations.     |
| writing-processor     | Write or modify CyanPrint processor code. Use when the user asks to change file transformations, modify the entry point, handle file processing, or change output generation. Covers entry point (StartProcessorWithLambda), CyanFileHelper (read/write/copy/resolveAll), and VirtualFile (content/read/write). Processor lambda receives (input, fileHelper) as two parameters. |
| writing-resolver      | Write or modify CyanPrint resolver code. Use when the user asks to change conflict resolution logic, modify merge strategies, handle file origins, or change resolution behavior. Covers entry point (StartResolverWithLambda), ResolverInput/ResolverOutput, ResolvedFile, and FileOrigin. Must ensure commutativity and associativity (sort, unique, deterministic ordering).  |
| testing-template      | Test this CyanPrint template. Use when the user asks to write tests, add test cases, update snapshots, or debug template test failures. Covers test.cyan.yaml format with answer_state, deterministic_state, validate commands, and snapshot testing.                                                                                                                            |
| testing-plugin        | Test this CyanPrint plugin. Use when the user asks to write plugin tests, add test cases with input files and config, update snapshots, or debug plugin test failures. Covers test.cyan.yaml format with input files, config, expect (errors/warnings), and snapshots.                                                                                                           |
| testing-processor     | Test this CyanPrint processor. Use when the user asks to write processor tests, add test cases with input files, update snapshots, or debug processor test failures. Covers test.cyan.yaml format with input files, config, validate commands, and snapshots.                                                                                                                    |
| testing-resolver      | Test this CyanPrint resolver. Use when the user asks to write resolver tests, add test cases with conflicting files, update snapshots, or debug resolver test failures. Covers test.cyan.yaml format with resolver_inputs (multiple files, same path), config, and snapshots.                                                                                                    |

### Principle 3: No Hardcoded Names

Never use specific artifact names like `cyan/lint-validator` or `myorg/my-template`. Instead:

- Use "this {type}" or "the artifact"
- Use placeholder names like `your-username/your-plugin-name`
- Teach the LLM to extract the actual name from `cyan.yaml`

### Principle 4: Supporting Files (Progressive Disclosure)

| Skill Type     | SKILL.md (concise)                                                      | Supporting Files                                                                |
| -------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| documenting-\* | Step-by-step instructions for introspection + README generation         | `reference.md`: README.MD section templates per artifact type                   |
| writing-\*     | Entry point structure, key types, modification workflow                 | `reference.md`: Full SDK type definitions, multi-language entry point skeletons |
| testing-\*     | Test format, how to find prompt keys / config schema, snapshot workflow | `reference.md`: Complete test.cyan.yaml examples per artifact type              |

### Principle 5: Consider `allowed-tools` for Documenting Skills

Documenting skills are primarily read-only (generate README.MD). Consider:

```yaml
allowed-tools: Read, Grep, Glob, Write
```

---

## Part 5: Per-Skill Content Specification

### Documenting Skills (4 files)

Each documenting skill must follow this structure:

```
1. Read cyan.yaml → get name, description, tags, build info
2. Read entry point code → extract:
   - For templates: prompt keys and their descriptions
   - For plugins/processors/resolvers: config keys, defaults, types
3. Generate README.MD with these sections:
   - # {artifact-name}
   - {description}
   - ## Usage (cyan.yaml snippet showing how to add this artifact)
   - ## Configuration (extracted config schema with types, defaults, descriptions)
   - ## {type-specific sections}
4. Write README.MD to project root
```

**Artifact-specific README sections**:

- **Template**: Prompts, Answer State Automation, Variable Syntax, Dependencies (processors/plugins/resolvers used)
- **Plugin**: Purpose (validation vs transformation), Config Schema, Error/Warning Messages, Integration Example
- **Processor**: Purpose, Config Schema, File Handling (which extensions, how modified), Before/After Examples
- **Resolver**: Purpose, Config Schema, Resolution Strategy, Origin Handling, Merge Examples

### Writing Skills (4 files)

#### writing-template — Must teach:

1. **All question types** — `text`, `select`, `checkbox`, `confirm`, `password`, `dateSelect` with both simple and Q-forms
2. **IDeterminism** — `d.get(key, origin)` for deterministic values in tests
3. **Using processors** — Configure `cyan/default` processor with `vars` map and custom `varSyntax`
4. **Using plugins** — Add `CyanPlugin` entries when needed
5. **Registry search** — When `cyan/default` isn't enough, search for additional processors

#### writing-processor — Must teach:

1. **CyanFileHelper** — `resolveAll()`, `read(glob)`, `get(glob)`, `copy(glob)`
2. **VirtualFile** — Read/write `content`, call `writeFile()` to persist
3. **Two-parameter entry** — `(input: CyanProcessorInput, fileHelper: CyanFileHelper)`

#### writing-plugin — Must teach:

1. **No SDK file helpers** — PluginInput only has `{ directory, config }`
2. **Native file I/O** — `fs` (Node), `pathlib/open` (Python), `System.IO` (C#)
3. **Command execution** — `child_process` (Node), `subprocess` (Python), `Process` (C#)
4. **File mutation** — Read from `input.directory`, modify, write back

#### writing-resolver — Must teach:

1. **All inputs have same path** — Multiple `ResolvedFile` entries, all with same `path`
2. **FileOrigin** — `{ template: string, layer: number }` (layer is number)
3. **Commutativity/associativity** — Sort arrays, deduplicate, define priority
4. **Single output** — Return one `ResolverOutput` with resolved path + content

### Testing Skills (4 files)

Each testing skill must:

1. **Introspect first** — Read the entry point to determine what to test
2. **Extract keys** — Prompt IDs from templates, config keys from plugins/processors/resolvers
3. **Correct format**:
   - **Template**: `answer_state` (keyed to THIS template's prompts), `deterministic_state`, `validate`, `snapshots`
   - **Plugin**: `input` (files), `config`, `expect` (errors/warnings), `validate`, `snapshots`
   - **Processor**: `input` (files), `config`, `validate`, `snapshots`
   - **Resolver**: `resolver_inputs` (multiple files, same path + origin), `config`, `validate`, `snapshots`

---

## Part 6: Files to Modify

### Source skills (12 SKILL.md + 12 NEW reference.md files):

```
template/skills/.claude/skills/
├── documenting-template/SKILL.md + reference.md (NEW)
├── writing-template/SKILL.md + reference.md (NEW)
└── testing-template/SKILL.md + reference.md (NEW)

plugin/skills/.claude/skills/
├── documenting-plugin/SKILL.md + reference.md (NEW)
├── writing-plugin/SKILL.md + reference.md (NEW)
└── testing-plugin/SKILL.md + reference.md (NEW)

processor/skills/.claude/skills/
├── documenting-processor/SKILL.md + reference.md (NEW)
├── writing-processor/SKILL.md + reference.md (NEW)
└── testing-processor/SKILL.md + reference.md (NEW)

resolver/skills/.claude/skills/
├── documenting-resolver/SKILL.md + reference.md (NEW)
├── writing-resolver/SKILL.md + reference.md (NEW)
└── testing-resolver/SKILL.md + reference.md (NEW)
```

### CLAUDE.md files (fix wrong SDK names):

- `template/skills/CLAUDE.md`
- `plugin/skills/CLAUDE.md`
- `processor/skills/CLAUDE.md`
- `resolver/skills/CLAUDE.md`

### Snapshots (auto-update via --update-snapshots):

- All `snapshots/{artifact}_{lang}_with_skills/` directories

---

## Part 7: Implementation Steps

### Step 1: Rewrite all 12 source SKILL.md files + create 12 reference.md files

Order: documenting skills first (highest impact, most broken), then writing, then testing.

### Step 2: Fix CLAUDE.md files for each artifact type

Correct any wrong SDK names in the 4 CLAUDE.md files.

### Step 3: Iteratively test and fix — one test case at a time

Use `--test` to run each test individually. For each failure, follow the [fix-meta-template-test](/.claude/skills/fix-meta-template-test/SKILL.md) skill to classify and fix.

```bash
# Test one case at a time
direnv exec . cyanprint test template --test <test_name> .

# If snapshot is stale (source changed intentionally), update it
direnv exec . cyanprint test template --test <test_name> --update-snapshots .
```

**Test order** — all 32 test cases (4 artifacts × 4 languages × 2 skill variants), grouped by artifact then skills variant:

| #   | Test Case                          | Artifact  | Skills |
| --- | ---------------------------------- | --------- | ------ |
| 1   | `template_typescript_with_skills`  | template  | yes    |
| 2   | `template_typescript_no_skills`    | template  | no     |
| 3   | `template_javascript_with_skills`  | template  | yes    |
| 4   | `template_javascript_no_skills`    | template  | no     |
| 5   | `template_python_with_skills`      | template  | yes    |
| 6   | `template_python_no_skills`        | template  | no     |
| 7   | `template_dotnet_with_skills`      | template  | yes    |
| 8   | `template_dotnet_no_skills`        | template  | no     |
| 9   | `plugin_typescript_with_skills`    | plugin    | yes    |
| 10  | `plugin_typescript_no_skills`      | plugin    | no     |
| 11  | `plugin_javascript_with_skills`    | plugin    | yes    |
| 12  | `plugin_javascript_no_skills`      | plugin    | no     |
| 13  | `plugin_python_with_skills`        | plugin    | yes    |
| 14  | `plugin_python_no_skills`          | plugin    | no     |
| 15  | `plugin_dotnet_with_skills`        | plugin    | yes    |
| 16  | `plugin_dotnet_no_skills`          | plugin    | no     |
| 17  | `processor_typescript_with_skills` | processor | yes    |
| 18  | `processor_typescript_no_skills`   | processor | no     |
| 19  | `processor_javascript_with_skills` | processor | yes    |
| 20  | `processor_javascript_no_skills`   | processor | no     |
| 21  | `processor_python_with_skills`     | processor | yes    |
| 22  | `processor_python_no_skills`       | processor | no     |
| 23  | `processor_dotnet_with_skills`     | processor | yes    |
| 24  | `processor_dotnet_no_skills`       | processor | no     |
| 25  | `resolver_typescript_with_skills`  | resolver  | yes    |
| 26  | `resolver_typescript_no_skills`    | resolver  | no     |
| 27  | `resolver_javascript_with_skills`  | resolver  | yes    |
| 28  | `resolver_javascript_no_skills`    | resolver  | no     |
| 29  | `resolver_python_with_skills`      | resolver  | yes    |
| 30  | `resolver_python_no_skills`        | resolver  | no     |
| 31  | `resolver_dotnet_with_skills`      | resolver  | yes    |
| 32  | `resolver_dotnet_no_skills`        | resolver  | no     |

For each test:

1. Run `direnv exec . cyanprint test template --test <test_name> .`
2. **If it passes** → move to next
3. **If it fails** → follow `/fix-meta-template-test` to diagnose:
   - Snapshot mismatch (Layer 1) → source template produces different output than expected
     - If the diff is expected (skills changed), run `--update-snapshots`
     - If unexpected, trace back to source templates and fix
   - Nested validate fail (Layer 2) → generated artifact's own test fails
     - Read the generated artifact's test config and entry point in `snapshots/<test>/`
     - Trace root cause back to source templates (all 4 languages)
     - Fix source, then update snapshot
4. Re-run to confirm fix
5. Move to next test

### Step 4: Final verification — run all 32 tests

```bash
direnv exec . cyanprint test template .
```

All 32 must pass (including `*_no_skills` variants — those should be unaffected).

## Verification

- [ ] All 32/32 tests pass
- [ ] No hardcoded example names in any skill (grep for `cyan/` in skills)
- [ ] No `cyan/new/` references in any skill (meta-template leakage)
- [ ] All SDK names correct (`cyanprintsdk`, `sulfone_helium`, NOT `cyan_sdk` or `Atomicloud.CyanSDK`)
- [ ] Processor entry point has two params `(input, fileHelper)`, not one
- [ ] Plugin uses native fs, not invented `readFile/readDir/fileExists` methods
- [ ] FileOrigin.layer is documented as `number`, not `string`
- [ ] All descriptions contain trigger phrases and "Use when" clauses
- [ ] All documenting skills start with introspection step
- [ ] All testing skills instruct reading entry point for prompt/config keys
- [ ] Supporting files (reference.md) exist for each skill
