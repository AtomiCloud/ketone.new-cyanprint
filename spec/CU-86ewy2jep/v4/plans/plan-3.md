# Plan 3: Update writing-template skills (all 4 languages) + writing-resolver skills (all 4 languages)

## Writing-template changes (apply to all 4 source files)

Files:

- `template/skills/.claude/skills/writing-template-typescript/SKILL.md`
- `template/skills/.claude/skills/writing-template-javascript/SKILL.md`
- `template/skills/.claude/skills/writing-template-python/SKILL.md`
- `template/skills/.claude/skills/writing-template-dotnet/SKILL.md`

### Changes for each file:

1. **Determinism explanation** - Add a new section explaining WHY determinism matters:
   - Each template script is executed multiple times (generation, testing, re-generation)
   - First execution: `d.get()` generates a random value and stores it
   - Subsequent executions: `d.get()` returns the stored value (not a new random value)
   - Without `d.get()`, calls to `Date.now()`, `Math.random()`, etc. produce different output each execution
   - This is why ALL prompt values should go through `d.get()`

2. **Full script example** - Replace the current entry point snippet with a complete working example including: multiple question types, conditional logic, processor config, and plugin config

3. **Default processor features** - Expand the "Configuring the Default Processor" section:
   - `vars`: template variable substitution (nested objects supported)
   - `flags`: boolean flag variables (nested objects supported)
   - `parser.varSyntax`: custom delimiters (default `{{` `}}`)
   - Reference: the default processor code at `../ketone.default-processor/` uses these internally
   - Note: globbing is handled automatically by the processor via `fileHelper.resolveAll()`

4. **Registry search** - Add section on finding more processors/plugins/resolvers:
   - Browse: https://cyanprint.dev/registry
   - API: `https://api.zinc.sulfone.raichu.cluster.atomi.cloud/api/v1/`
   - Endpoints: `/api/v1/Processor`, `/api/v1/Plugin`, `/api/v1/Resolver`

## Writing-resolver changes (apply to all 4 source files)

Files:

- `resolver/skills/.claude/skills/writing-resolver-typescript/SKILL.md`
- `resolver/skills/.claude/skills/writing-resolver-javascript/SKILL.md`
- `resolver/skills/.claude/skills/writing-resolver-python/SKILL.md`
- `resolver/skills/.claude/skills/writing-resolver-dotnet/SKILL.md`

### Changes for each file:

1. **Input validation** - Add at the start of the resolver function body:
   - If `input.files` is empty, throw/raise an error ("at least 1 file required")
   - If not all files have the same `path`, throw/raise an error ("all files must have the same path")

## Not in scope

- Snapshots (handled in a separate plan)
- writing-processor (already correct)
- writing-plugin (already correct)
