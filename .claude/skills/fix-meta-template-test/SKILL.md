---
name: fix-meta-template-test
description: Debug and fix failing meta-template test cases for the CyanPrint ketone.new-cyanprint repository. Use when a test case fails and you need to trace the root cause back through the meta-template layer. Use when running /fix-meta-template-test.
---

# Fix Meta-Template Test Cases

Debug and fix failing test cases in the ketone.new-cyanprint meta-template repository. This repo is **meta** — it generates CyanPrint templates, plugins, processors, and resolvers, and its tests validate that the generated output is correct (including nested tests).

## When to Use

- A test case fails (from `cyanprint test template` or `task test`)
- You need to fix a specific failing test case or all failing tests
- Snapshot comparison shows mismatches between generated and expected output
- Nested validate commands fail on generated artifacts

## Prerequisites

- Docker running
- Coordinator daemon running (`docker ps` should show `cyanprint-coordinator`)
- Inside nix shell or use `direnv exec .`

## Architecture (Critical Context)

This repo generates artifacts in **two layers**:

```
Layer 1: Meta-template (this repo)
  ├─ Source templates:  template/{language}/cyan/
  ├─ Source common:     template/common/
  ├─ Source config:     template/cyan.yaml
  └─ Test config:       test.cyan.yaml (32 test cases)
        ↓ generates ↓
Layer 2: Generated artifact (e.g., a CyanPrint template)
  ├─ Entry point:      cyan/index.ts (or main.py, Program.cs, index.js)
  ├─ Config:           cyan.yaml
  ├─ Test:             test.cyan.yaml (from template/common/)
  ├─ Template files:   templates/ (from template/common/templates/)
  └─ Fixtures:         cyan/fixtures/expected/ (from template/{lang}/cyan/fixtures/)
```

**Key insight:** A test failure at Layer 1 means the source templates need fixing. A test failure at Layer 2 (nested validate) means the generated artifact's own test is failing — which still means the source templates need fixing because the generated artifact is produced from them.

## Test Case Naming Convention

Tests are named `{artifact}_{language}_{skills}`:

- `template_typescript_no_skills`, `plugin_python_with_skills`, etc.
- 4 artifacts × 4 languages × 2 skill variants = 32 test cases

## Step-by-Step Debugging Process

### Step 1: Run the failing test

Run a single test case to see the error:

```bash
cyanprint test template --test <test_name> .
```

### Step 2: Classify the failure

Read the output and determine which type of failure:

| Failure Type                | Symptom                                                     | What to Check                                                      |
| --------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------ |
| **Snapshot mismatch**       | `File '<path>' mismatched` or `Extra file`/`Missing file`   | Layer 1 — source template generates different output than expected |
| **Nested validate fail**    | `Command '...cyanprint test <artifact> ...' failed`         | Layer 2 — the generated artifact's own test fails                  |
| **Processor version error** | `processor <name> does not have a matching version defined` | `cyan.yaml` missing processor/plugin/resolver declaration          |
| **Missing output file**     | `Missing file: <path>` in nested test                       | Generated artifact's entry point doesn't produce expected output   |

### Step 3: Fix snapshot mismatches (Layer 1)

If the snapshot is stale (source templates changed intentionally):

```bash
cyanprint test template --test <test_name> --update-snapshots .
```

Then verify without the flag:

```bash
cyanprint test template --test <test_name> .
```

If the snapshot mismatch is **unexpected**, trace back to the source template that generates the differing file:

1. Read the error to find which file differs (e.g., `cyan/index.ts`)
2. Find the source template that generates it:
   - `template/{language}/cyan/` — language-specific files (processed with `GlobType.Template`)
   - `template/common/` — shared files (copied with `GlobType.Copy`)
   - `template/cyan.yaml` — artifact metadata (processed with `GlobType.Template`)
   - `template/skills/` — Claude Code skills (copied with `GlobType.Copy`, if skills enabled)
3. Fix the source template
4. Update the snapshot

### Step 4: Fix nested validate failures (Layer 2)

If the generated artifact's own test fails, you need to understand what the generated artifact expects and what it actually produces.

1. **Read the generated artifact's test config:**
   - Template tests: `snapshots/<test>/test.cyan.yaml` (from `template/common/test.cyan.yaml`)
   - Plugin/processor/resolver tests: `snapshots/<test>/test.cyan.yaml` (from respective `*/common/test.cyan.yaml`)

2. **Read the generated artifact's entry point:**
   - `snapshots/<test>/cyan/index.ts` (or `main.py`, `Program.cs`, `index.js`)
   - This is generated from `template/{language}/cyan/index.ts` (or equivalent)

3. **Read the test fixtures:**
   - `snapshots/<test>/cyan/fixtures/expected/*/` — expected output
   - These come from `template/{language}/cyan/fixtures/` (processed with `GlobType.Template`)

4. **Trace the root cause to source templates:**
   - If the entry point is wrong → fix `template/{language}/cyan/index.ts`
   - If the test expects a file that isn't produced → the entry point needs to produce it
   - If the cyan.yaml is missing declarations → fix `template/cyan.yaml`
   - If the test fixtures are wrong → fix `template/{language}/cyan/fixtures/`

5. **Fix the source templates (all languages):**
   Apply the fix to all 4 language variants:
   - `template/typescript/cyan/`
   - `template/javascript/cyan/`
   - `template/python/cyan/`
   - `template/dotnet/cyan/`
     And/or common files:
   - `template/common/`
   - `template/cyan.yaml`

### Step 5: Update snapshots and verify

After fixing source templates:

```bash
# Update all affected snapshots
cyanprint test template --test <test_name> --update-snapshots .

# Verify all 32 pass
cyanprint test template .
```

## Common Pitfalls (Meta-Specific)

### Double `{{ }}` substitution

Source files under `template/{language}/` are processed with `GlobType.Template` — the meta-template substitutes `{{var}}` patterns. If the generated code needs **literal** `{{` and `}}` characters (e.g., for varSyntax config), they will be consumed by the meta-template's processor.

**Fix:** Construct braces at runtime:

```typescript
// In template/{language}/cyan/index.ts
const open = '{' + '{';
const close = '}' + '}';
varSyntax: [[open, close], ['// ' + open, close], ['# ' + open, close]],
```

Or place files that need literal `{{}}` in `template/common/` which uses `GlobType.Copy`.

### Variable name collisions

The meta-template's processor vars are: `project`, `source`, `username`, `name`, `desc`, `email`, `tags`. If a generated file uses `{{name}}` or `{{desc}}`, the meta-template will substitute it with the answer_state value.

**Fix:** Use non-colliding variable names (e.g., `{{projectName}}` instead of `{{name}}`).

### Processor version declaration

When a generated artifact's entry point returns a processor/plugin/resolver by name (e.g., `cyan/default`), that name **must** be declared in the artifact's `cyan.yaml`.

**Fix:** Add it to `template/cyan.yaml`:

```yaml
processors:
  - cyan/default
```

### answer_state keys must match inquirer IDs

The `test.cyan.yaml`'s `answer_state` keys must exactly match the inquirer prompt IDs in the entry point. The meta-template uses `cyan/new/` prefix (defined in `cyan/src/util.ts`).

### Nested container conflicts

Running `cyanprint test template` inside a parent `cyanprint test template` can cause Docker container name collisions.

**Fix:** Use unique image names per artifact (via `{{name }}` and `{{username }}` in `cyan.yaml` build section).

## File Map

### Source templates → Generated artifact paths

| Source                      | Generated Path        | GlobType             |
| --------------------------- | --------------------- | -------------------- |
| `template/{lang}/cyan/**/*` | `cyan/**/*`           | Template             |
| `template/common/**/*`      | (root)                | Copy                 |
| `template/cyan.yaml`        | `cyan.yaml`           | Template             |
| `template/skills/**/*`      | `.claude/skills/**/*` | Copy (if skills=yes) |

### Test config sources

| Source                            | Used By                             |
| --------------------------------- | ----------------------------------- |
| `test.cyan.yaml` (root)           | Meta-template tests (Layer 1)       |
| `template/common/test.cyan.yaml`  | Generated template tests (Layer 2)  |
| `plugin/common/test.cyan.yaml`    | Generated plugin tests (Layer 2)    |
| `processor/common/test.cyan.yaml` | Generated processor tests (Layer 2) |
| `resolver/common/test.cyan.yaml`  | Generated resolver tests (Layer 2)  |

### Entry point source files

| Language   | Source                              | Generated       |
| ---------- | ----------------------------------- | --------------- |
| TypeScript | `template/typescript/cyan/index.ts` | `cyan/index.ts` |
| JavaScript | `template/javascript/cyan/index.js` | `cyan/index.js` |
| Python     | `template/python/cyan/main.py`      | `main.py`       |
| .NET       | `template/dotnet/cyan/Program.cs`   | `Program.cs`    |

## Quick Reference Commands

```bash
# Run all 32 tests
direnv exec . cyanprint test template .

# Run one test
direnv exec . cyanprint test template --test template_typescript_no_skills .

# Update snapshots for one test
direnv exec . cyanprint test template --test template_typescript_no_skills --update-snapshots .

# Check coordinator health
docker ps --filter "name=cyanprint"
```
