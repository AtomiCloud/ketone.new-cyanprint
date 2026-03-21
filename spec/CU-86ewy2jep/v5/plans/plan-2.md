# Plan 2: Fix cyan generators, improve writing-template skills, fix CLAUDE.md, fix publish.sh, regenerate snapshots

## Scope

Code logic changes, content improvements, and verification. Depends on Plan 1 being complete (snapshot regeneration needs all content fixes applied first).

## Tasks

### A. Skill filtering in cyan generators (O1-O4)

Fix language-specific skill filtering when `includeSkills === 'yes'`. Currently all 4 language writing skills are included regardless of selected language.

**Files:**

- `cyan/src/template.ts` — filter writing-template skills by selected language
- `cyan/src/processor.ts` — filter writing-processor skills by selected language
- `cyan/src/plugin.ts` — filter writing-plugin skills by selected language
- `cyan/src/resolver.ts` — filter writing-resolver skills by selected language

**Fix:** Use exclude patterns to filter out non-matching language writing skills. Each generator function should only include the writing skill matching the selected language.

### B. writing-template skill improvements (W1-W5, all 4 languages)

**writing-template-{typescript,javascript,python,dotnet}:**

- W1: Remove `flags` from default processor config description — `cfg.flags` is never read, only `cfg.vars` is used
- W2: Fix `parser.varSyntax` default description — actual default is `var__` `__`, not `{{` `}}`. The meta-template injects `['{{', '}}']` via its own processor config. Clarify this distinction
- W3: Expand determinism guidance — when and why to use `d.get()`, what breaks without it
- W4: Add section on cyan.yaml artifact declaration — every referenced artifact must be declared in both the Cyan return object AND cyan.yaml. Include version pinning syntax:
  ```yaml
  processors: [cyan/default]
  plugins: [username/plugin:1]
  resolvers:
    - resolver: username/resolver:1
      config: {}
      files: ['**/*.json']
  ```
- W5: Explain how Inquirer works in context of GlobType processing

### C. CLAUDE.md fixes (C1-C4)

**Fix in all 4 CLAUDE.md files** (`template/skills/CLAUDE.MD`, `processor/skills/CLAUDE.MD`, `plugin/skills/CLAUDE.MD`, `resolver/skills/CLAUDE.MD`):

- C1: Fix push command — `--build` requires a tag argument: `cyanprint push --token TOKEN --message "msg" template --build v1.0.0`
- C2: Note that `CYAN_TOKEN` env var or `--token` flag (before artifact type) is required
- C3: Deduplicate content with skills — keep basic project structure/overview, remove detailed type definitions, full test.cyan.yaml examples, and full SDK API surface that skills already cover
- C4: Note skill workflow: writing skill → testing skill → documenting skill

### D. publish.sh flag ordering fixes (S1-S4)

Fix argument ordering in publish.sh — `--token` and `--message` must come BEFORE the artifact type subcommand.

**Files:**

- `template/common/scripts/publish.sh`
- `processor/common/scripts/publish.sh`
- `plugin/common/scripts/publish.sh`
- `resolver/common/scripts/publish.sh`

**Fix (all 4):**

```bash
# Before:
cyanprint push template --build "${IMAGE_VERSION}" --token "${CYAN_TOKEN}" --message "${COMMIT_MSG}"
# After:
cyanprint push --token "${CYAN_TOKEN}" --message "${COMMIT_MSG}" template --build "${IMAGE_VERSION}"
```

### E. Snapshot regeneration (R1-R2)

- R1: Run `cyanprint test template . --update-snapshots` to regenerate all 32 snapshots
- R2: Verify all 32 tests pass

Note: Snapshots will automatically reflect the content changes from Plan 1 and the code changes from this plan.

## Dependency

Plan 2 depends on Plan 1 completion — snapshots must be regenerated after all content fixes are applied.
