# Feedback (after v2 implementation)

## 1. Testing skills have incorrect test.cyan.yaml syntax

All testing skills use wrong syntax (e.g., `test_cases` instead of `tests`, `snapshots` instead of `expected`). Cross-check with the actual cyanprint implementation in `../../sulfone/iridium/` for correct test.cyan.yaml format, CLI commands, and field names.

## 2. Writing skills should be split per language

Currently each writing skill (writing-template, writing-plugin, writing-processor, writing-resolver) crams all 4 languages into one SKILL.md with a reference.md for multi-language skeletons. Instead, create **separate skills per language** (e.g., writing-template-typescript, writing-template-python, etc.). Cross-check with `../../sulfone/helium/` for correct SDK patterns per language.

### What each writing skill must teach (from v1 spec)

#### writing-template

1. All question types — text, select, checkbox, confirm, password, dateSelect with both simple and Q-forms
2. IDeterminism — d.get(key, origin) for deterministic values in tests
3. Using processors — Configure cyan/default processor with vars map and custom varSyntax
4. Using plugins — Add CyanPlugin entries when needed
5. Registry search — When cyan/default isn't enough, search for additional processors

#### writing-processor

1. CyanFileHelper — resolveAll(), read(glob), get(glob), copy(glob)
2. VirtualFile — Read/write content, call writeFile() to persist
3. Two-parameter entry — (input, fileHelper)

#### writing-plugin

1. No SDK file helpers — PluginInput only has { directory, config }
2. Native file I/O — fs (Node), pathlib/open (Python), System.IO (C#)
3. Command execution — child_process (Node), subprocess (Python), Process (C#)
4. File mutation — Read from input.directory, modify, write back

#### writing-resolver

1. All inputs have same path — Multiple ResolvedFile entries, all with same path
2. FileOrigin — { template: string, layer: number } (layer is number)
3. Commutativity/associativity — Sort arrays, deduplicate, define priority
4. Single output — Return one ResolverOutput with resolved path + content
