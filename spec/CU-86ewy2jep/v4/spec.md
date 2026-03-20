# v4 Feedback: Skill Content Improvements

## Research Findings

### Iridium test system

- No `--verbose` flag exists for any test command
- `validate` IS supported for all 4 artifact types (array of shell commands, exit zero check, serial execution)
- `answer_state` format: `key: {type: String|StringArray|Bool, value: ...}`
- No official commutativity checker for resolvers - manual testing only

### Default processor (ketone.default-processor)

- Globbing is automatic via `fileHelper.resolveAll()`
- Features beyond `{{var}}`: custom `varSyntax`, nested `vars`, `flags`, raw output (`~`), JS execution (`=`)
- IDeterminism is NOT used by the processor (template-only concept)
- Config schema: `vars` (nested Record), `flags` (nested Record), `parser.varSyntax`

### Registry

- Browse: https://cyanprint.dev/registry
- API: `https://api.zinc.sulfone.raichu.cluster.atomi.cloud/api/v1/`

## Changes

### documenting-template

- Problems table: show impact on template itself
- Remove answer_state automation section (internal, not external user facing)
- Clarify variables section purpose or remove
- Dependencies: include version, purpose, what used for
- Add Mermaid graph guidance for question flow (deterministic tree)

### documenting-resolver

- Remove origin handling explanation
- Focus on commutativity, associativity, deterministic
- Explain how config affects merge behavior

### testing-template

- Remove `--verbose` flag (doesn't exist)
- Clarify validate: serial commands, exit zero only

### testing-processor

- Config format is correct, no changes needed

### testing-plugin

- Config format is correct, no changes needed

### testing-resolver

- Commutativity testing: no official checker, manual only (update docs)

### writing-template (all 4 languages)

- Determinism explanation: multiple executions, first generates random value then stores, subsequent reuse stored value
- Full script example (not just snippets)
- Default processor features: custom varSyntax, nested vars, flags, raw output (`~`), JS execution (`=`)
- How to search registry for processors/plugins/resolvers

### writing-processor

- Globbing is automatic (already documented correctly via resolveAll)
- No other changes needed

### writing-plugin

- Looks good, note about returned directory already present
- No changes needed

### writing-resolver (all 4 languages)

- Input validation: all files must have same path, else error
- Must have at least 1 file, else error
