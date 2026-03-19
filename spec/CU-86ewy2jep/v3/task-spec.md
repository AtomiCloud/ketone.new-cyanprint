# Spec v3: Fix Testing Skills + Split Writing Skills Per Language

Merges v2 spec + v2 feedback. Changes from v2 are in **bold**.

---

## What Changed from v2

1. **Testing skills**: All 12 testing skills (across source + snapshots) use incorrect test.cyan.yaml syntax. Must reference `../../sulfone/iridium/` for correct format, field names, and CLI commands.
2. **Writing skills**: Split from 4 combined skills into **16 per-language skills** (4 artifacts x 4 languages). Remove the monolithic writing-{artifact} skills and their multi-language reference.md files. Reference `../../sulfone/helium/` for correct SDK patterns.

Everything else from v2 (documenting skills, introspection-first principle, trigger-rich descriptions, no hardcoded names, supporting files) remains unchanged and is correct.

---

## Plan 1: Rewrite 12 testing skills + fix writing skills structure

### Testing skills (12 files across source templates)

Rewrite all testing skills with correct test.cyan.yaml syntax. **Reference `../../sulfone/iridium/`** — read the actual test configuration source code, CLI command definitions, and real test.cyan.yaml examples to get the correct field names and format.

Source locations:

- `template/skills/.claude/skills/testing-template/SKILL.md`
- `plugin/skills/.claude/skills/testing-plugin/SKILL.md`
- `processor/skills/.claude/skills/testing-processor/SKILL.md`
- `resolver/skills/.claude/skills/testing-resolver/SKILL.md`

Each skill still follows the v2 pattern: introspect first, extract keys from entry point, correct test format.

### Writing skills (restructure from 4 combined → 16 per-language)

**Remove** the 4 combined writing skills and their reference.md files:

- `{type}/skills/.claude/skills/writing-{type}/SKILL.md`
- `{type}/skills/.claude/skills/writing-{type}/reference.md`

**Create** 16 per-language writing skills (4 artifacts x 4 languages):

```
{type}/skills/.claude/skills/
├── writing-{type}-typescript/SKILL.md
├── writing-{type}-javascript/SKILL.md
├── writing-{type}-python/SKILL.md
└── writing-{type}-dotnet/SKILL.md
```

Each per-language skill shows ONLY that language's entry point, SDK imports, types, and idiomatic patterns. **Reference `../../sulfone/helium/sdks/`** for correct SDK APIs per language.

### CLAUDE.md updates (4 files)

Update the 4 CLAUDE.md files to reference the new per-language writing skill names and remove references to old combined skills.

### Fix-meta-template-test skill

Update `.claude/skills/fix-meta-template-test/SKILL.md` if its test syntax references are also wrong (cross-check with iridium).

## Plan 2: Run all 32 tests and fix snapshots

Same as v2 Plan 2 — iteratively run all 32 test cases and fix snapshots.
