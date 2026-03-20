# Plan 2: Restructure writing skills from 4 combined → 16 per-language

Remove the 4 combined writing skills and create 16 per-language writing skills.

## Research

Read SDK patterns from helium:

- `../../sulfone/helium/sdks/node/src/` — TypeScript/JavaScript
- `../../sulfone/helium/sdks/python/` — Python
- `../../sulfone/helium/sdks/dotnet/` — C#

## Remove (4 directories, 8 files)

- `template/skills/.claude/skills/writing-template/` (SKILL.md + reference.md)
- `plugin/skills/.claude/skills/writing-plugin/` (SKILL.md + reference.md)
- `processor/skills/.claude/skills/writing-processor/` (SKILL.md + reference.md)
- `resolver/skills/.claude/skills/writing-resolver/` (SKILL.md + reference.md)

## Create (16 SKILL.md files)

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

Each per-language skill shows ONLY that language's entry point, imports, types, and idiomatic patterns. Cross-check against helium SDKs.

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

Cross-check `.claude/skills/fix-meta-template-test/SKILL.md` — fix any wrong test syntax references per iridium.
