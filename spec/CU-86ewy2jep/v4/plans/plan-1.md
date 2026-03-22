# Plan 1: Update documenting-template and documenting-resolver skills

## Files to modify

### documenting-template source

- `template/skills/.claude/skills/documenting-template/SKILL.md`

Changes:

1. **Problems table** - show how each problem impacts the template itself (what breaks, what degrades)
2. **Remove** "Answer State Automation" from README sections (internal, not for external users)
3. **Remove** "Variable Syntax" from README sections (internal implementation detail, not user-facing)
4. **Dependencies** - include version (from cyan.yaml or package.json), explain WHY it's needed and WHAT it's used for. Dependencies include: language runtime, SDK packages, processors, plugins, resolvers
5. **Mermaid graph** - add guidance to generate a deterministic question flow tree by analyzing the script's control flow (if/else branches from i.confirm, i.select, etc.)

### documenting-resolver source

- `resolver/skills/.claude/skills/documenting-resolver/SKILL.md`

Changes:

1. **Remove** "Origin Handling" section entirely
2. **Remove** "What resolution strategy it uses (how FileOrigin is used)" from Step 1
3. **Focus** on: commutativity (sort before process), associativity (pair-wise same as all-at-once), deterministic output
4. **Add** "How config affects merge" section - explain each config key's impact on resolution behavior
5. **Keep** Configuration Schema, Resolution Strategy, Merge Examples

## Not in scope

- Snapshots (handled in a separate plan)
- Other documenting skills (processor and plugin are good)
