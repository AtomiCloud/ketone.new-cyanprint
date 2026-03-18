# Plan 1: Rewrite All 12 Skills + 4 CLAUDE.md Files

## Goal

Rewrite all 12 CyanPrint skill SKILL.md files, create 12 new reference.md supporting files, and fix 4 CLAUDE.md files to use correct SDK names and introspection-first patterns.

## Scope

### SKILL.md rewrites (12 files)

Each skill gets a complete rewrite following the v2 spec principles:

1. **Introspection-first** — always start with "read cyan.yaml + entry point code"
2. **Trigger-rich descriptions** — include WHAT, WHEN (trigger phrases), and scope
3. **No hardcoded names** — use "this {type}" or placeholder names, never `cyan/lint-validator`
4. **Correct SDK reference** — use verified names from helium source
5. **Progressive disclosure** — SKILL.md is concise, details in reference.md

#### Documenting skills (4)

- `template/skills/.claude/skills/documenting-template/SKILL.md`
- `plugin/skills/.claude/skills/documenting-plugin/SKILL.md`
- `processor/skills/.claude/skills/documenting-processor/SKILL.md`
- `resolver/skills/.claude/skills/documenting-resolver/SKILL.md`

Each follows structure:

1. Read `cyan.yaml` → name, description, tags, build info
2. Read entry point code → extract prompt IDs (template) or config keys (plugin/processor/resolver)
3. Generate README.MD with artifact-specific sections
4. Write README.MD to project root

#### Writing skills (4)

- `template/skills/.claude/skills/writing-template/SKILL.md`
- `plugin/skills/.claude/skills/writing-plugin/SKILL.md`
- `processor/skills/.claude/skills/writing-processor/SKILL.md`
- `resolver/skills/.claude/skills/writing-resolver/SKILL.md`

Key corrections per skill:

- **writing-template**: All IInquirer question types, IDeterminism, processor config
- **writing-plugin**: PluginInput only `{ directory, config }` — NO SDK file helpers, native fs only
- **writing-processor**: Two params `(input, fileHelper)` — CyanFileHelper with resolveAll/read/get/copy
- **writing-resolver**: FileOrigin.layer is `number`, all inputs have same path, commutativity required

#### Testing skills (4)

- `template/skills/.claude/skills/testing-template/SKILL.md`
- `plugin/skills/.claude/skills/testing-plugin/SKILL.md`
- `processor/skills/.claude/skills/testing-processor/SKILL.md`
- `resolver/skills/.claude/skills/testing-resolver/SKILL.md`

Each teaches:

1. Read entry point to find YOUR prompt/config keys (not hardcoded examples)
2. Correct test.cyan.yaml format per artifact type
3. Snapshot workflow

### reference.md files (12 NEW files)

Each SKILL.md gets a companion `reference.md` with detailed technical content:

- **documenting-\*/reference.md**: README.MD section templates per artifact type
- **writing-\*/reference.md**: Full SDK type definitions, multi-language entry point skeletons
- **testing-\*/reference.md**: Complete test.cyan.yaml examples per artifact type

### CLAUDE.md fixes (4 files)

Fix wrong SDK names in:

- `template/skills/CLAUDE.md`
- `plugin/skills/CLAUDE.md`
- `processor/skills/CLAUDE.md`
- `resolver/skills/CLAUDE.md`

Correct SDK names:
| Language | Correct Package | Wrong Name (current) |
|----------|----------------|---------------------|
| Python | `cyanprintsdk` | `cyan_sdk` |
| C# | `sulfone_helium` | `Atomicloud.CyanSDK` |

## Approach

Work by artifact type (template → plugin → processor → resolver), doing all 3 skills + reference.md + CLAUDE.md for each type before moving to the next. This keeps context coherent.

For each artifact type:

1. Rewrite the 3 SKILL.md files (documenting, writing, testing)
2. Create the 3 reference.md files
3. Fix the CLAUDE.md

## Verified SDK Reference (use this, nothing else)

| Language   | Package                | Entry Points                                                                                                  |
| ---------- | ---------------------- | ------------------------------------------------------------------------------------------------------------- |
| TypeScript | `@atomicloud/cyan-sdk` | `StartTemplateWithLambda`, `StartPluginWithLambda`, `StartProcessorWithLambda`, `StartResolverWithLambda`     |
| JavaScript | `@atomicloud/cyan-sdk` | Same                                                                                                          |
| Python     | `cyanprintsdk`         | `start_template_with_fn`, `start_plugin_with_fn`, `start_processor_with_fn`, `start_resolver_with_fn`         |
| C#         | `sulfone_helium`       | `CyanEngine.StartTemplate`, `CyanEngine.StartPlugin`, `CyanEngine.StartProcessor`, `CyanEngine.StartResolver` |

Key type corrections:

- **PluginInput**: only `{ directory: string, config: unknown }` — no file helpers
- **ProcessorInput**: two params `(input: CyanProcessorInput, fileHelper: CyanFileHelper)`
- **FileOrigin**: `{ template: string, layer: number }` — layer is number, not string
- **ResolverInput**: `{ config: Record<string, unknown>, files: ResolvedFile[] }` — all files have same path

## Files to Modify

```
template/skills/.claude/skills/
├── documenting-template/SKILL.md (rewrite)
├── documenting-template/reference.md (NEW)
├── writing-template/SKILL.md (rewrite)
├── writing-template/reference.md (NEW)
├── testing-template/SKILL.md (rewrite)
└── testing-template/reference.md (NEW)

plugin/skills/.claude/skills/
├── documenting-plugin/SKILL.md (rewrite)
├── documenting-plugin/reference.md (NEW)
├── writing-plugin/SKILL.md (rewrite)
├── writing-plugin/reference.md (NEW)
├── testing-plugin/SKILL.md (rewrite)
└── testing-plugin/reference.md (NEW)

processor/skills/.claude/skills/
├── documenting-processor/SKILL.md (rewrite)
├── documenting-processor/reference.md (NEW)
├── writing-processor/SKILL.md (rewrite)
├── writing-processor/reference.md (NEW)
├── testing-processor/SKILL.md (rewrite)
└── testing-processor/reference.md (NEW)

resolver/skills/.claude/skills/
├── documenting-resolver/SKILL.md (rewrite)
├── documenting-resolver/reference.md (NEW)
├── writing-resolver/SKILL.md (rewrite)
├── writing-resolver/reference.md (NEW)
├── testing-resolver/SKILL.md (rewrite)
└── testing-resolver/reference.md (NEW)

template/skills/CLAUDE.md (fix SDK names)
plugin/skills/CLAUDE.md (fix SDK names)
processor/skills/CLAUDE.md (fix SDK names)
resolver/skills/CLAUDE.md (fix SDK names)
```

Total: 16 modified files + 12 new files = 28 file operations

## Testing

This plan is content-only (markdown files). Verification is done in Plan 2 when we run the full test suite and update snapshots.

## Edge Cases

- Skills are copied via `GlobType.Copy` — no `{{var}}` substitution, so no brace escaping needed
- reference.md must live alongside SKILL.md in the same directory for progressive disclosure to work
- CLAUDE.md files live at `{type}/skills/CLAUDE.md` (parent of `.claude/skills/`), not inside the skills dirs

## Integration with Plan 2

Plan 2 will run `cyanprint test template --test <test_name> --update-snapshots .` for each test to regenerate snapshots with the new skill content. All `*_with_skills` snapshots will change.
