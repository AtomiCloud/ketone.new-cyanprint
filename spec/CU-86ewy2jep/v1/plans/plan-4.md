# Plan 4: Automated Testing with test.cyan.yaml

**Spec sections**: Part C (all)
**Depends on**: Plan 3 (skills must exist for skills=yes test variants)

## Overview

Replace the old Docker container boot tests (`scripts/test.sh`) with CyanPrint's snapshot-based testing. Each generated scaffold gets its own `test.cyan.yaml` so `cyanprint test <artifact> .` works on it. The meta-template root gets a `test.cyan.yaml` with **32 test cases** (4 artifacts × 4 languages × 2 skills toggle) that generates each combo and uses `validate` to run `cyanprint test <artifact> .` on the output — nested testing.

## Test chain

```
cyanprint test template .  (at repo root)
  → generates 32 scaffolds via answer_state (4 types × 4 langs × 2 skills)
  → for each, validate runs: cyanprint test <artifact> .
    → verifies the generated scaffold's test.cyan.yaml passes
```

## Steps

### 4.1 Processor scaffold tests (4 languages)

For each `processor/{typescript,javascript,python,dotnet}/`, create:

**`test.cyan.yaml`**:

```yaml
tests:
  - name: identity_processing
    expected:
      type: snapshot
      value:
        path: ./snapshots/identity_processing
    input: ./inputs/identity
    config: {}
```

**`inputs/identity/sample.txt`** — a simple text file (e.g., `Hello, World!`)
**`snapshots/identity_processing/sample.txt`** — expected output (identical to input for the passthrough processor scaffold)

### 4.2 Plugin scaffold tests (4 languages)

For each `plugin/{typescript,javascript,python,dotnet}/`, create:

**`test.cyan.yaml`**:

```yaml
tests:
  - name: passthrough
    expected:
      type: snapshot
      value:
        path: ./snapshots/passthrough
    config: {}
```

**`snapshots/passthrough/`** — expected output matching the passthrough plugin behavior.

### 4.3 Resolver scaffold tests (4 languages)

For each `resolver/{typescript,javascript,python,dotnet}/`, create:

**`test.cyan.yaml`**:

```yaml
tests:
  - name: single_file_resolve
    expected:
      type: snapshot
      value:
        path: ./snapshots/single_file_resolve
    config: {}
    resolver_inputs:
      - path: ./inputs/single_file_resolve/template-a
        origin:
          template: template-a
          layer: 0
```

**`inputs/single_file_resolve/template-a/sample.txt`** — a sample file
**`snapshots/single_file_resolve/sample.txt`** — expected output (resolver returns first file as-is)

### 4.4 Template scaffold tests (4 languages)

For each `template/{typescript,javascript,python,dotnet}/`, create a `test.cyan.yaml` inside the `cyan/` subdirectory (where the template entry point lives):

**`cyan/test.cyan.yaml`**:

```yaml
tests:
  - name: basic_generation
    expected:
      type: snapshot
      value:
        path: fixtures/expected/basic_generation
    answer_state:
      cyan/new/username:
        type: String
        value: testuser
      cyan/new/name:
        type: String
        value: test-template
      cyan/new/description:
        type: String
        value: A test template
      cyan/new/email:
        type: String
        value: test@example.com
      cyan/new/more-tags/0:
        type: String
        value: 'no'
      cyan/new/project:
        type: String
        value: 'https://github.com/test/test'
      cyan/new/source:
        type: String
        value: 'https://github.com/test/test'
    deterministic_state: {}
```

**`cyan/fixtures/expected/basic_generation/`** — expected generated output for the template scaffold.

Note: Answer state keys use the `cyan/new/` prefix (from `util.ts`).

### 4.5 Meta-template root `test.cyan.yaml` (32 test cases)

Create at repo root with **32 test cases**: 4 artifact types × 4 languages × 2 (skills yes/no).

Each test case uses `answer_state` to select artifact type + language + skills toggle, and `validate` to run `cyanprint test <artifact> .` on the generated output.

Example test cases:

```yaml
tests:
  - name: template_typescript_no_skills
    validate:
      - command: cyanprint test template .
    answer_state:
      cyan/new/create:
        type: String
        value: Template
      cyan/new/language:
        type: String
        value: Typescript
      cyan/new/skills:
        type: String
        value: 'no'
      cyan/new/username:
        type: String
        value: testuser
      cyan/new/name:
        type: String
        value: test-template
      cyan/new/description:
        type: String
        value: A test template
      cyan/new/email:
        type: String
        value: test@example.com
      cyan/new/more-tags/0:
        type: String
        value: 'no'
      cyan/new/project:
        type: String
        value: 'https://github.com/test/test'
      cyan/new/source:
        type: String
        value: 'https://github.com/test/test'
    deterministic_state: {}

  - name: template_typescript_with_skills
    validate:
      - command: cyanprint test template .
    answer_state:
      cyan/new/create:
        type: String
        value: Template
      cyan/new/language:
        type: String
        value: Typescript
      cyan/new/skills:
        type: String
        value: 'yes'
      # ... same metadata fields as above ...
    deterministic_state: {}

  # ... 30 more test cases for remaining combos ...
```

All 32 combos (naming convention: `{type}_{language}_{no_skills|with_skills}`):

- `template_{typescript,javascript,python,dotnet}_{no_skills,with_skills}` — validate: `cyanprint test template .`
- `processor_{typescript,javascript,python,dotnet}_{no_skills,with_skills}` — validate: `cyanprint test processor .`
- `plugin_{typescript,javascript,python,dotnet}_{no_skills,with_skills}` — validate: `cyanprint test plugin .`
- `resolver_{typescript,javascript,python,dotnet}_{no_skills,with_skills}` — validate: `cyanprint test resolver .`

### 4.6 Update `.github/workflows/ci.yaml`

Replace the docker build matrix with a test job:

```yaml
test:
  name: Test
  runs-on: ubuntu-22.04
  steps:
    - uses: actions/checkout@v4
    - name: Install CyanPrint
      run: # appropriate setup
    - name: Run Tests
      run: cyanprint test template .
```

This single command runs all 32 test cases, each generating a scaffold and validating it.

## Acceptance criteria

- `scripts/test.sh` deleted (done in Plan 1)
- Every scaffold directory has `test.cyan.yaml` + fixtures
- Root `test.cyan.yaml` has 32 test cases (4 types × 4 languages × 2 skills toggle)
- Each root test case uses `validate` to run `cyanprint test <artifact> .` on generated output
- All answer_state keys use `cyan/new/` prefix
- Skills toggle key is `cyan/new/skills` with values `"yes"` / `"no"`
- `ci.yaml` updated to run `cyanprint test template .`
- Nested test chain works: meta-template test → scaffold test
