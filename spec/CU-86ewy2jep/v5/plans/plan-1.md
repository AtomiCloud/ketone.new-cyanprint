# Plan 1: Fix skill content inaccuracies and remove phantom content

## Scope

Content-only fixes across documenting, testing, and writing skill source files. No code logic changes.

## Tasks

### A. `allowed-tools` removal (A1-A3)

Remove `allowed-tools: Read, Grep, Glob, Write` from all writing, documenting, and testing SKILL.md source files:

- **Writing skills** (16 files): `writing-{template,processor,plugin,resolver}-{typescript,javascript,python,dotnet}/SKILL.md`
- **Documenting skills** (4 files): `documenting-{template,processor,plugin,resolver}/SKILL.md`
- **Testing skills** (3 files): `testing-{template,processor,plugin}/SKILL.md`
- **Also check**: `testing-resolver/SKILL.md` if it has one

### B. documenting-template fixes (B1-B5)

**documenting-template/reference.md:**

- B1: Remove "Answer State Automation" section
- B2: Remove "Variables" section
- B3: Update Dependencies section to version/purpose table format
- B4: Fix "Reference in parent template" section — use top-level arrays, not `dependencies:` wrapper:
  ```yaml
  templates: [username/template-name]
  processors: [cyan/default]
  resolvers:
    - resolver: username/resolver-name:1
      config: {}
      files: ['**/*.json']
  ```

**documenting-template/SKILL.md:**

- B5: Add cyan.yaml dependency format guidance with version pinning

### C. documenting-processor fixes (B6-B7)

**documenting-processor/reference.md:**

- B6: Remove "Testing" section
- B7: Fix "Integration" section — change `[{name:}]` object syntax to `[string]` format

### D. documenting-plugin + documenting-resolver fixes (B8-B9)

**documenting-plugin/reference.md:**

- B8: Verify and fix Integration section if it uses wrong `[{name:}]` syntax

**documenting-resolver/reference.md:**

- B8: Same check as plugin
- B9: Remove "Origin Handling" section

### E. testing skill `--verbose` removal (B10-B17)

**testing-template/reference.md:**

- B10: Remove `--verbose` flag

**testing-processor:**

- B11: Remove `--verbose` from SKILL.md
- B12: Remove `--verbose` from reference.md

**testing-plugin:**

- B13: Remove `--verbose` from SKILL.md
- B14: Remove `--verbose` from reference.md

**testing-resolver:**

- B15: Remove `validate` field from all examples
- B16: Remove "validate" Key Points section
- B17: Remove `--verbose` flag

### F. writing-processor improvements (P1-P2, all 4 languages)

**writing-processor-{typescript,javascript,python,dotnet}:**

- P1: Clarify `resolveAll()` automatically handles both GlobType.Copy and GlobType.Template — processor author does NOT manually check glob type
- P2: Teach `file.relative` mutation for filename changes

## Source file locations

All skills are under their respective artifact type's `skills/.claude/skills/` directory:

- Template: `template/skills/.claude/skills/`
- Processor: `processor/skills/.claude/skills/`
- Plugin: `plugin/skills/.claude/skills/`
- Resolver: `resolver/skills/.claude/skills/`

## Verification

After all edits, grep for residual `--verbose`, `allowed-tools`, and `validate` references in skill source files to confirm complete removal.
