# Plan 1: Rewrite testing skills + restructure writing skills

Rewrite all 12 testing skills with correct test.cyan.yaml syntax and restructure writing skills from 4 combined into 16 per-language skills.

## Research

Before writing any code, read the actual test configuration from iridium and SDK patterns from helium:

- Read `../../sulfone/iridium/cyanprint/src/test_cmd/config.rs` for the correct test.cyan.yaml field names and types
- Read `../../sulfone/iridium/cyanprint/src/commands.rs` for the correct CLI test commands
- Read real test.cyan.yaml examples in `../../sulfone/iridium/` (e.g., sample/, spec/, e2e/ directories)
- Read `../../sulfone/helium/sdks/node/src/` for TypeScript/JavaScript SDK patterns
- Read `../../sulfone/helium/sdks/python/` for Python SDK patterns
- Read `../../sulfone/helium/sdks/dotnet/` for C# SDK patterns

## Testing skills (12 files)

Rewrite these 4 source skills with correct test.cyan.yaml syntax (learned from iridium):

- `template/skills/.claude/skills/testing-template/SKILL.md`
- `plugin/skills/.claude/skills/testing-plugin/SKILL.md`
- `processor/skills/.claude/skills/testing-processor/SKILL.md`
- `resolver/skills/.claude/skills/testing-resolver/SKILL.md`

Update their reference.md files too:

- `template/skills/.claude/skills/testing-template/reference.md`
- `plugin/skills/.claude/skills/testing-plugin/reference.md`
- `processor/skills/.claude/skills/testing-processor/reference.md`
- `resolver/skills/.claude/skills/testing-resolver/reference.md`

## Writing skills — restructure (remove combined, create per-language)

Remove these 4 combined skills and their reference.md files:

- `{type}/skills/.claude/skills/writing-{type}/` (4 directories total)

Create 16 per-language skills:

```
template/skills/.claude/skills/
├── writing-template-typescript/SKILL.md
├── writing-template-javascript/SKILL.md
├── writing-template-python/SKILL.md
└── writing-template-dotnet/SKILL.md

plugin/skills/.claude/skills/
├── writing-plugin-typescript/SKILL.md
├── writing-plugin-javascript/SKILL.md
├── writing-plugin-python/SKILL.md
└── writing-plugin-dotnet/SKILL.md

processor/skills/.claude/skills/
├── writing-processor-typescript/SKILL.md
├── writing-processor-javascript/SKILL.md
├── writing-processor-python/SKILL.md
└── writing-processor-dotnet/SKILL.md

resolver/skills/.claude/skills/
├── writing-resolver-typescript/SKILL.md
├── writing-resolver-javascript/SKILL.md
├── writing-resolver-python/SKILL.md
└── writing-resolver-dotnet/SKILL.md
```

Each per-language skill shows ONLY that language's:

- Entry point function signature and imports
- SDK types and interfaces
- Language-idiomatic patterns (file I/O, command execution, etc.)
- Common modifications and workflows

Cross-check all SDK patterns against `../../sulfone/helium/sdks/`.

## What each writing skill must teach (from v1 spec)

### writing-template (all languages)

1. All question types — text, select, checkbox, confirm, password, dateSelect with both simple and Q-forms
2. IDeterminism — d.get(key, origin) for deterministic values in tests
3. Using processors — Configure cyan/default processor with vars map and custom varSyntax
4. Using plugins — Add CyanPlugin entries when needed
5. Registry search — When cyan/default isn't enough, search for additional processors

### writing-processor (all languages)

1. CyanFileHelper — resolveAll(), read(glob), get(glob), copy(glob)
2. VirtualFile — Read/write content, call writeFile() to persist
3. Two-parameter entry — (input, fileHelper)

### writing-plugin (all languages)

1. No SDK file helpers — PluginInput only has { directory, config }
2. Native file I/O — fs (Node), pathlib/open (Python), System.IO (C#)
3. Command execution — child_process (Node), subprocess (Python), Process (C#)
4. File mutation — Read from input.directory, modify, write back

### writing-resolver (all languages)

1. All inputs have same path — Multiple ResolvedFile entries, all with same path
2. FileOrigin — { template: string, layer: number } (layer is number)
3. Commutativity/associativity — Sort arrays, deduplicate, define priority
4. Single output — Return one ResolverOutput with resolved path + content

## CLAUDE.md updates (4 files)

Update to reference new per-language writing skill names:

- `template/skills/CLAUDE.md`
- `plugin/skills/CLAUDE.md`
- `processor/skills/CLAUDE.md`
- `resolver/skills/CLAUDE.md`

## fix-meta-template-test skill

Cross-check `.claude/skills/fix-meta-template-test/SKILL.md` — if its test syntax references are wrong (per iridium), fix them.

## Total files touched

- 8 testing skill files (4 SKILL.md + 4 reference.md)
- 4 writing skill directories removed (each with SKILL.md + reference.md = 8 files removed)
- 16 new per-language writing SKILL.md files created
- 4 CLAUDE.md files updated
- 1 fix-meta-template-test SKILL.md possibly updated
