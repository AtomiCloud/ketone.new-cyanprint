# Plan 1: Rewrite 8 testing skill files (reference iridium)

Rewrite all 4 source testing SKILL.md files and their 4 reference.md files with correct test.cyan.yaml syntax.

## Research

Read the actual test configuration from iridium before writing:

- `../../sulfone/iridium/cyanprint/src/test_cmd/config.rs` — correct field names and types
- `../../sulfone/iridium/cyanprint/src/commands.rs` — correct CLI test commands
- Real test.cyan.yaml examples in `../../sulfone/iridium/` (sample/, spec/, e2e/)

## Files to rewrite (8 total)

- `template/skills/.claude/skills/testing-template/SKILL.md`
- `template/skills/.claude/skills/testing-template/reference.md`
- `plugin/skills/.claude/skills/testing-plugin/SKILL.md`
- `plugin/skills/.claude/skills/testing-plugin/reference.md`
- `processor/skills/.claude/skills/testing-processor/SKILL.md`
- `processor/skills/.claude/skills/testing-processor/reference.md`
- `resolver/skills/.claude/skills/testing-resolver/SKILL.md`
- `resolver/skills/.claude/skills/testing-resolver/reference.md`

Each skill follows the v2 pattern: introspect first, extract keys from entry point, correct test format (learned from iridium).
