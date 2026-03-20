# Plan 2: Update testing skills

## Files to modify

### testing-template source

- `template/skills/.claude/skills/testing-template/SKILL.md`

Changes:

1. **Remove** `cyanprint test template . --verbose` from Step 3 (flag doesn't exist)
2. **Clarify validate**: commands run serially, each must exit zero, test fails if any command fails. These are typically used to verify the generated scaffold is complete (e.g., `npm install`, `npm run build`, dev server starts)

### testing-resolver source

- `resolver/skills/.claude/skills/testing-resolver/SKILL.md`

Changes:

1. **Remove** `cyanprint test resolver . --verbose` (flag doesn't exist)
2. **Update** Commutativity Testing section: note there is no official commutativity checker. Developers must manually verify by including tests with swapped input order that snapshot to the same output directory

### testing-processor source

- No changes needed (validate already documented correctly, config format confirmed correct)

### testing-plugin source

- No changes needed (validate already documented correctly, config format confirmed correct)

## Not in scope

- Snapshots (handled in a separate plan)
