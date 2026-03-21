# Spec v5: Fix all skill inaccuracies + script fixes

Verified against:

- Iridium source: `/Users/erng/Workspace/atomi/runbook/platforms/sulfone/iridium/`
- Helium SDK: `/Users/erng/Workspace/atomi/runbook/platforms/sulfone/helium/`
- Default processor: `/Users/erng/Workspace/atomi/runbook/platforms/ketone/ketone.default-processor/`

## Category 1: Reference.md fixes (complete v4 incomplete work)

### documenting-template/reference.md

**B1.** Remove "Answer State Automation" section (lines 49-65)
**B2.** Remove "Variables" section (lines 67-85)
**B3.** Update Dependencies section (lines 87-97) from comment-based format to version/purpose table format as specified in v4 SKILL.md
**B4.** Fix "Reference in parent template" section (lines 25-32): uses `dependencies: templates:` wrapper but iridium `CyanTemplateFileConfig` (`cli/models/template_config.rs:21-28`) has no `dependencies` key. Correct format is top-level arrays:

```yaml
templates: [username/template-name]
processors: [cyan/default]
resolvers:
  - resolver: username/resolver-name:1
    config: {}
    files: ['**/*.json']
```

Evidence: `cli/models/template_config.rs:21-28` — `processors: Vec<String>`, `plugins: Vec<String>`, `templates: Vec<String>`, `resolvers: Vec<CyanResolverRefFileConfig>`

### documenting-template/SKILL.md

**B5.** Add cyan.yaml dependency format guidance — teach correct syntax for declaring processors, plugins, and resolvers. Include version pinning. Currently has zero references to `cyan.yaml` for artifact references.

### documenting-processor/reference.md

**B6.** Remove "Testing" section (lines 63-71) — documenting skill should not contain testing instructions
**B7.** Fix "Integration" section (lines 56-61): uses `processors: [{name:}]` object syntax but cyan.yaml uses `processors: [string]` format. Evidence: `template_config.rs:21` — `processors: Vec<String>`. Meta-template `cyan.yaml:27`: `processors: - cyan/default`

### documenting-plugin/reference.md + documenting-resolver/reference.md

**B8.** Verify and fix Integration sections if they also use wrong `[{name:}]` object syntax instead of `[string]` format

### documenting-resolver/reference.md

**B9.** Remove "Origin Handling" section (lines 35-54) — v4 spec said to REMOVE

### testing-template/reference.md

**B10.** Remove `--verbose` flag (line 167). Evidence: zero grep hits for `--verbose` in iridium test commands

### testing-processor/SKILL.md + reference.md

**B11.** Remove `--verbose` from SKILL.md (line 101)
**B12.** Remove `--verbose` from reference.md (line 127)

### testing-plugin/SKILL.md + reference.md

**B13.** Remove `--verbose` from SKILL.md (line 86)
**B14.** Remove `--verbose` from reference.md (line 153)

### testing-resolver/reference.md

**B15.** Remove `validate` field from all examples (lines 23-24, 61-63). Evidence: iridium `resolver.rs` has zero references to validate execution
**B16.** Remove "validate" Key Points section (lines 184-192)
**B17.** Remove `--verbose` flag (line 230)

## Category 2: `allowed-tools` removal

**A1.** Remove `allowed-tools: Read, Grep, Glob, Write` from all 16 writing skill source files (4 artifact types × 4 languages)
**A2.** Remove from all 4 documenting skill source files
**A3.** Remove from all 3 testing skill source files (template, processor, plugin). Verify testing-resolver if it has one.

Total: ~23 source SKILL.md files. Applies only to source files — snapshots are regenerated separately.

## Category 3: writing-template skill improvements (all 4 language variants)

**W1.** Remove `flags` from default processor config description. Evidence: `ketone.default-processor/index.ts:7,11` — `Flags` type defined and `flags: Flags` in interface, but `cfg.flags` is **never read**. Only `cfg.vars` is used (line 48).

**W2.** Fix `parser.varSyntax` default description. Evidence: `default-processor/index.ts:34` — `if (varSyntax.length === 0) varSyntax.push(['var__', '__'])`. Actual default is `var__` `__`, not `{{` `}}`. The meta-template injects `['{{', '}}']` via its own processor config. Clarify this distinction.

**W3.** Expand determinism guidance — when and why to use `d.get()`, what breaks without it (snapshot tests produce different output each run).

**W4.** Add section: how to add processors/plugins/resolvers to `cyan.yaml` — not just the Cyan return object. Every referenced artifact must be declared in both places. Include version pinning syntax:

```yaml
processors: [cyan/default]
plugins: [username/plugin:1]
resolvers:
  - resolver: username/resolver:1
    config: {}
    files: ['**/*.json']
```

Evidence: `cli/models/template_config.rs:21-28`, `CyanResolverRefFileConfig` at lines 34-44

**W5.** Explain how Inquirer works in context of GlobType processing (prompts run before files are processed, results flow into processor config vars).

## Category 4: writing-processor skill improvements (all 4 language variants)

**P1.** Clarify that `resolveAll()` automatically handles both GlobType.Copy (copies as-is) and GlobType.Template (reads for transformation). Processor author does NOT need to manually check glob type. Evidence: helium `cyan_fs_helper.ts:33-40`:

```typescript
resolveAll(): VirtualFile[] {
  const copy = this.globs.filter(x => x.type === GlobType.Copy);
  const template = this.globs.filter(x => x.type === GlobType.Template);
  for (const c of copy) this.copy(c);
  return template.flatMap(x => this.read(x));
}
```

**P2.** Teach `file.relative` mutation for filename changes. Evidence: default processor `index.ts:49` — `x.relative = varEtas.reduce((acc, eta) => eta.renderString(acc, cfg.vars ?? {}), x.relative)`.

## Category 5: CLAUDE.md fixes (all 4: template, processor, plugin, resolver)

**C1.** Fix push command: `--build` requires a tag argument. Evidence: iridium `01-push.md:90`: `cyanprint push --token YOUR_TOKEN --message "msg" template --build v1.0.0`

**C2.** Note that `CYAN_TOKEN` env var or `--token` flag (before artifact type) is required

**C3.** Deduplicate content with skills — keep basic project structure/overview, remove detailed type definitions, full test.cyan.yaml examples, and full SDK API surface that the skills already cover. Keep structure overview and file tree, just trim duplicated deep content.

**C4.** Note skill workflow: use writing skill → testing skill → documenting skill

## Category 6: Skill filtering (all languages, not just JavaScript)

**O1.** Fix `cyan/src/template.ts` — when `includeSkills === 'yes'`, exclude non-matching language writing skills. TypeScript template should only get `writing-template-typescript`, not all 4.

**O2.** Fix `cyan/src/plugin.ts` — same

**O3.** Fix `cyan/src/processor.ts` — same

**O4.** Fix `cyan/src/resolver.ts` — same

Fix: use exclude patterns to filter out non-matching language writing skills. Applies to all 4 artifact types × 4 languages = 4 generator functions.

## Category 7: publish.sh fixes

**S1.** Fix `template/common/scripts/publish.sh` line 6: move `--token` and `--message` before `template`

- Current: `cyanprint push template --build "${IMAGE_VERSION}" --token "${CYAN_TOKEN}" --message "${COMMIT_MSG}"`
- Correct: `cyanprint push --token "${CYAN_TOKEN}" --message "${COMMIT_MSG}" template --build "${IMAGE_VERSION}"`
  Evidence: `01-push.md:11` — "Push options must come BEFORE the subcommand"

**S2.** Fix `plugin/common/scripts/publish.sh` — same
**S3.** Fix `processor/common/scripts/publish.sh` — same
**S4.** Fix `resolver/common/scripts/publish.sh` — same

## Category 8: Snapshot regeneration

**R1.** Run `cyanprint test template . --update-snapshots` to regenerate all 32 snapshots
**R2.** Verify all 32 tests pass

## Not in scope

- `Cyan` type definition — confirmed correct (no `resolvers` field in iridium `cyan.rs:31-34` or helium `cyan.ts:24-27`). Resolvers are declared in cyan.yaml, not in the return value.
- CLAUDE.md test format (`test_cases` vs `tests`) — separate concern
- writing-plugin skills — user confirmed these are already correct
