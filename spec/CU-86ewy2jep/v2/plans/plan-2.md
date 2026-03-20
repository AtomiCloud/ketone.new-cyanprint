# Plan 2: Iterative Test-and-Fix All 32 Test Cases

## Goal

Run each of the 32 meta-template test cases individually using `--test` flag, fix any failures using the `/fix-meta-template-test` skill, and update snapshots. All 32 must pass.

## Prerequisites

- Plan 1 complete (all 28 skill/CLAUDE.md files rewritten)
- Docker running
- Coordinator daemon running (`docker ps` should show `cyanprint-coordinator`)
- Inside nix shell or use `direnv exec .`

## Scope

All 32 test cases: 4 artifacts × 4 languages × 2 skill variants

## Approach

Run tests one at a time. For each failure, classify and fix per the fix-meta-template-test skill. Group by artifact type: run all template tests, then plugin, then processor, then resolver.

### Test Order

| #   | Test Case                          | Artifact  | Skills |
| --- | ---------------------------------- | --------- | ------ |
| 1   | `template_typescript_with_skills`  | template  | yes    |
| 2   | `template_typescript_no_skills`    | template  | no     |
| 3   | `template_javascript_with_skills`  | template  | yes    |
| 4   | `template_javascript_no_skills`    | template  | no     |
| 5   | `template_python_with_skills`      | template  | yes    |
| 6   | `template_python_no_skills`        | template  | no     |
| 7   | `template_dotnet_with_skills`      | template  | yes    |
| 8   | `template_dotnet_no_skills`        | template  | no     |
| 9   | `plugin_typescript_with_skills`    | plugin    | yes    |
| 10  | `plugin_typescript_no_skills`      | plugin    | no     |
| 11  | `plugin_javascript_with_skills`    | plugin    | yes    |
| 12  | `plugin_javascript_no_skills`      | plugin    | no     |
| 13  | `plugin_python_with_skills`        | plugin    | yes    |
| 14  | `plugin_python_no_skills`          | plugin    | no     |
| 15  | `plugin_dotnet_with_skills`        | plugin    | yes    |
| 16  | `plugin_dotnet_no_skills`          | plugin    | no     |
| 17  | `processor_typescript_with_skills` | processor | yes    |
| 18  | `processor_typescript_no_skills`   | processor | no     |
| 19  | `processor_javascript_with_skills` | processor | yes    |
| 20  | `processor_javascript_no_skills`   | processor | no     |
| 21  | `processor_python_with_skills`     | processor | yes    |
| 22  | `processor_python_no_skills`       | processor | no     |
| 23  | `processor_dotnet_with_skills`     | processor | yes    |
| 24  | `processor_dotnet_no_skills`       | processor | no     |
| 25  | `resolver_typescript_with_skills`  | resolver  | yes    |
| 26  | `resolver_typescript_no_skills`    | resolver  | no     |
| 27  | `resolver_javascript_with_skills`  | resolver  | yes    |
| 28  | `resolver_javascript_no_skills`    | resolver  | no     |
| 29  | `resolver_python_with_skills`      | resolver  | yes    |
| 30  | `resolver_python_no_skills`        | resolver  | no     |
| 31  | `resolver_dotnet_with_skills`      | resolver  | yes    |
| 32  | `resolver_dotnet_no_skills`        | resolver  | no     |

### Per-Test Workflow

```bash
# Run one test
direnv exec . cyanprint test template --test <test_name> .
```

**If it passes**: move to next test.

**If it fails**, follow `/fix-meta-template-test`:

1. **Classify the failure**:
   - **Snapshot mismatch** (Layer 1): Source template produces different output than expected
     - If diff is expected (skills changed): `direnv exec . cyanprint test template --test <test_name> --update-snapshots .`
     - If unexpected: trace to source templates and fix
   - **Nested validate fail** (Layer 2): Generated artifact's own test fails
     - Read generated test config: `snapshots/<test>/test.cyan.yaml`
     - Read generated entry point: `snapshots/<test>/cyan/index.ts`
     - Trace root cause to source templates (all 4 languages)
     - Fix source, then update snapshot
   - **Processor version error**: `cyan.yaml` missing declaration
   - **Missing output file**: Entry point doesn't produce expected file

2. **Fix source templates** (apply to all 4 language variants):
   - `template/{typescript,javascript,python,dotnet}/cyan/`
   - `template/common/`
   - `{type}/skills/` (for skill-related fixes)

3. **Update snapshot**: `direnv exec . cyanprint test template --test <test_name> --update-snapshots .`

4. **Re-run to verify**: `direnv exec . cyanprint test template --test <test_name> .`

5. Move to next test

### Final Verification

After all 32 pass individually, run the full suite:

```bash
direnv exec . cyanprint test template .
```

## Expected Behavior

- **`*_with_skills` tests**: Will have snapshot mismatches (skills content changed). Update snapshots on first run.
- **`*_no_skills` tests**: Should pass unchanged. If they fail, something in Plan 1 accidentally affected non-skill files.

## Edge Cases

- **Nested container conflicts**: Each test runs Docker containers. If names collide, use unique names.
- **Double `{{}}` substitution**: If fixing source templates, remember files in `{type}/{lang}/` get Template substitution. Use runtime brace construction or `template/common/` for literal `{{}}`.
- **Variable name collisions**: Meta-template vars are `project`, `source`, `username`, `name`, `desc`, `email`, `tags`. Don't use `{{name}}` in generated code.

## Files Modified

- `snapshots/*/` — snapshot directories updated via `--update-snapshots`
- Source templates — only if unexpected failures require fixes
