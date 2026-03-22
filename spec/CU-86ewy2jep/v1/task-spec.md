# Task Spec: Add Resolver, Build/Push, Automated Testing, Skills & SDK v2.1.0

**Ticket**: CU-86ewy2jep
**Repo**: ketone/new-cyanprint
**Version**: v1

## Objective

Migrate the ketone/new-cyanprint meta-template to support all four CyanPrint artifact types (Template, Processor, Plugin, **Resolver**), modernize build/push workflows, add automated snapshot testing, optionally include Claude Code skills, and upgrade to SDK v2.1.0.

---

## Part A: Resolver Support (4th Artifact Type)

### A1. New `resolver/` directory structure

Create `resolver/` mirroring the existing `plugin/` and `processor/` layout:

```
resolver/
├── cyan.yaml                     # Metadata template (with build: section)
├── common/                       # CI/CD files
│   ├── .dockerignore
│   ├── .gitignore
│   ├── .github/workflows/publish.yaml
│   └── scripts/
│       ├── publish.sh
│       └── setup-ubuntu.sh
├── typescript/
│   ├── index.ts                  # StartResolverWithLambda entry point
│   ├── package.json              # @atomicloud/cyan-sdk ^2.1.0
│   ├── tsconfig.json
│   ├── bun.lockb
│   ├── Dockerfile                # oven/bun based
│   ├── .dockerignore
│   ├── .gitignore
│   └── README.MD
├── javascript/
│   ├── index.js                  # StartResolverWithLambda entry point
│   ├── package.json              # @atomicloud/cyan-sdk ^2.1.0
│   ├── jsconfig.json
│   ├── bun.lockb
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── .gitignore
│   └── README.MD
├── python/
│   ├── main.py                   # start_resolver_with_fn entry point
│   ├── requirements.txt          # cyanprintsdk
│   ├── Dockerfile                # python:3.12.12 based
│   ├── .dockerignore
│   ├── .gitignore
│   └── README.MD
└── dotnet/
    ├── Program.cs                # CyanEngine.StartResolver entry point
    ├── Processor.csproj          # (named Resolver.csproj)
    ├── Processor.sln             # (named Resolver.sln)
    ├── Dockerfile                # dotnet/sdk:8.0 multi-stage
    ├── .dockerignore
    ├── .gitignore
    └── README.MD
```

**Port**: 5553 (Template=5550, Processor=5551, Plugin=5552, Resolver=5553)

### A2. Resolver entry points (from sulfone/helium reference)

**TypeScript** (`resolver/typescript/index.ts`):

```typescript
import { StartResolverWithLambda, type ResolverInput, type ResolverOutput } from '@atomicloud/cyan-sdk';

StartResolverWithLambda(async (i: ResolverInput): Promise<ResolverOutput> => {
  const firstFile = i.files[0];
  if (!firstFile) {
    return { path: '', content: '' };
  }
  return { path: firstFile.path, content: firstFile.content };
});
```

**JavaScript** (`resolver/javascript/index.js`):

```javascript
import { StartResolverWithLambda } from '@atomicloud/cyan-sdk';

StartResolverWithLambda(async i => {
  const firstFile = i.files[0];
  if (!firstFile) {
    return { path: '', content: '' };
  }
  return { path: firstFile.path, content: firstFile.content };
});
```

**Python** (`resolver/python/main.py`):

```python
from cyanprintsdk.domain.resolver.input import ResolverInput
from cyanprintsdk.domain.resolver.output import ResolverOutput
from cyanprintsdk.main import start_resolver_with_fn

async def resolver(i: ResolverInput) -> ResolverOutput:
    if not i.files:
        return ResolverOutput(path="", content="")
    first_file = i.files[0]
    return ResolverOutput(path=first_file.path, content=first_file.content)

if __name__ == "__main__":
    start_resolver_with_fn(resolver)
```

**C#** (`resolver/dotnet/Program.cs`):

```csharp
using sulfone_helium;
using sulfone_helium.Domain.Resolver;

CyanEngine.StartResolver(
    args,
    Task<ResolverOutput> (i) =>
    {
        var (config, files) = i;
        var firstFile = files.FirstOrDefault();
        if (firstFile == null)
        {
            return Task.FromResult(new ResolverOutput("", ""));
        }
        return Task.FromResult(new ResolverOutput(firstFile.Path, firstFile.Content));
    }
);
```

### A3. New `cyan/src/resolver.ts`

Follow the exact pattern of `cyan/src/plugin.ts` and `cyan/src/processor.ts`:

- Export `PromptResolver(inquirer, langType, vars): Promise<Cyan>`
- Route to `resolver/{language}/` files via `GlobType.Template`
- Copy `resolver/common/` via `GlobType.Copy`
- Template `resolver/cyan.yaml` with `{{ }}` var syntax

### A4. Update `cyan/index.ts`

- Add `'Resolver'` to the select choices: `['Template', 'Plugin', 'Processor', 'Resolver']`
- Add routing: `if (cyanType === 'Resolver') return PromptResolver(inquirer, langType, vars)`
- Import `PromptResolver` from `./src/resolver.ts`

### A5. Remove processor/plugin/resolver prompting from `cyan/src/template.ts`

Remove the existing "Add a processor?" and "Add a plugin?" interactive loops from `PromptTemplate()`. The generated template's `cyan.yaml` should no longer prompt for processors, plugins, or resolvers. Instead, set them to empty arrays.

The language-specific value functions (`TypescriptValues`, `CSharpValues`, etc.) should be simplified to no longer accept `processors`/`plugins` parameters or generate code snippets for them.

### A6. Update `template/cyan.yaml`

Remove `processors` and `plugins` template vars. Set static empty arrays. Do NOT add resolvers:

```yaml
username: { { username } }
name: { { name } }
description: { { desc } }
project: { { project } }
source: { { source } }
email: { { email } }
tags: { { tags } }
readme: cyan/README.MD
templates: []
processors: []
plugins: []
resolvers: []
```

---

## Part B: Build/Push Modernization

Replace manual `docker buildx build` + `cyanprint push` with `cyanprint push --build`.

### B1. Add `build:` section to all generated `cyan.yaml` files

The `build:` config supports env var syntax `${VAR:-default}` for values that come from CI/CD environment. This allows the same `cyan.yaml` to work locally (with defaults) and in CI (with env vars).

**Template** (`template/cyan.yaml`):

```yaml
build:
  registry: ${DOMAIN}/${GITHUB_REPO_REF}
  platforms:
    - linux/amd64
    - linux/arm64
  images:
    template:
      image: template-script
      dockerfile: cyan/Dockerfile
      context: ./cyan
    blob:
      image: template-blob
      dockerfile: cyan/blob.Dockerfile
      context: .
```

**Processor** (`processor/cyan.yaml`):

```yaml
build:
  registry: ${DOMAIN}/${GITHUB_REPO_REF}
  platforms:
    - linux/amd64
    - linux/arm64
  images:
    processor:
      image: processor
      dockerfile: Dockerfile
      context: .
```

**Plugin** (`plugin/cyan.yaml`):

```yaml
build:
  registry: ${DOMAIN}/${GITHUB_REPO_REF}
  platforms:
    - linux/amd64
    - linux/arm64
  images:
    plugin:
      image: plugin
      dockerfile: Dockerfile
      context: .
```

**Resolver** (`resolver/cyan.yaml`):

```yaml
build:
  registry: ${DOMAIN}/${GITHUB_REPO_REF}
  platforms:
    - linux/amd64
    - linux/arm64
  images:
    resolver:
      image: resolver
      dockerfile: Dockerfile
      context: .
```

### B2. Rewrite all generated `publish.sh` scripts

**Plugin/Processor/Resolver** (`{artifact}/common/scripts/publish.sh`):

```bash
#!/usr/bin/env bash
set -eou pipefail
[ "${CYAN_TOKEN}" = '' ] && echo "CYAN_TOKEN not set" && exit 1
[ "${IMAGE_VERSION}" = '' ] && echo "IMAGE_VERSION not set" && exit 1
COMMIT_MSG="$(git log -1 --pretty=%B | head -c 256)"
cyanprint push {artifact} --build "${IMAGE_VERSION}" --token "${CYAN_TOKEN}" --message "${COMMIT_MSG}"
```

**Template** (`template/common/scripts/publish.sh`):

```bash
#!/usr/bin/env bash
set -eou pipefail
[ "${CYAN_TOKEN}" = '' ] && echo "CYAN_TOKEN not set" && exit 1
[ "${IMAGE_VERSION}" = '' ] && echo "IMAGE_VERSION not set" && exit 1
COMMIT_MSG="$(git log -1 --pretty=%B | head -c 256)"
cyanprint push template --build "${IMAGE_VERSION}" --token "${CYAN_TOKEN}" --message "${COMMIT_MSG}"
```

### B3. Update all generated `publish.yaml` workflows

Simplify: still need Docker login + buildx setup, but the actual build/push is just the new `publish.sh`. Remove the env vars that are no longer needed (`DOMAIN`, `GITHUB_REPO_REF`, `GITHUB_SHA`, `GITHUB_BRANCH`). Keep `DOCKER_PASSWORD`, `DOCKER_USER`, `CYAN_TOKEN`. Add `IMAGE_VERSION` generation.

---

## Part C: Automated Testing with `test.cyan.yaml`

Replace `scripts/test.sh` (Docker container boot tests) entirely with CyanPrint's snapshot-based testing via `test.cyan.yaml`.

### C1. Delete `scripts/test.sh`

Remove the old Docker container boot test infrastructure completely.

### C2. Add `test.cyan.yaml` + fixtures to each generated scaffold

Each scaffold gets a minimal working test case so `cyanprint test <artifact> .` works on it.

**Processor test** (`processor/{lang}/test.cyan.yaml`):

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

Plus `inputs/identity/` with a sample file and `snapshots/identity_processing/` with expected output.

**Plugin test** (`plugin/{lang}/test.cyan.yaml`):

```yaml
tests:
  - name: passthrough
    expected:
      type: snapshot
      value:
        path: ./snapshots/passthrough
    config: {}
```

Plus `snapshots/passthrough/` with expected output.

**Resolver test** (`resolver/{lang}/test.cyan.yaml`):

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

Plus `inputs/single_file_resolve/template-a/` with a sample file and `snapshots/single_file_resolve/` with expected output.

**Template test** (`template/{lang}/cyan/test.cyan.yaml`):

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
      # ... (all required answers from standardCyanModel)
    deterministic_state: {}
```

Plus `fixtures/expected/basic_generation/` with expected output.

### C3. Meta-template root `test.cyan.yaml` (32 test cases)

Create at the project root a `test.cyan.yaml` with **32 test cases**: 4 artifact types × 4 languages × 2 (skills yes/no).

Each test case uses:

- `answer_state` — predetermined answers selecting artifact type, language, skills toggle, and standard metadata (all keys use `cyan/new/` prefix)
- `validate` — runs `cyanprint test <artifact> .` on the generated output to verify the scaffold works

This creates a nested test chain:

```
cyanprint test template .  (at repo root)
  → generates 32 scaffolds via answer_state
  → for each, validate runs: cyanprint test <artifact> .
    → verifies the generated scaffold's test.cyan.yaml passes
```

Example test case:

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
      # ... same metadata fields ...
    deterministic_state: {}
  # ... 30 more test cases for remaining combos ...
```

### C4. Update `ci.yaml`

Replace docker build matrix with a test job that runs `cyanprint test template .` at the repo root.

---

## Part D: Source Code Changes Summary

| File                                                                         | Change                                                                             |
| ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `cyan/index.ts`                                                              | Add 'Resolver' to select, add routing                                              |
| `cyan/src/resolver.ts`                                                       | New file — follows plugin/processor pattern                                        |
| `cyan/src/template.ts`                                                       | Remove processor/plugin/resolver prompting loops                                   |
| `template/cyan.yaml`                                                         | Remove templated processors/plugins, set static empty arrays, add `build:` section |
| `plugin/cyan.yaml`                                                           | Add `build:` section                                                               |
| `processor/cyan.yaml`                                                        | Add `build:` section                                                               |
| `resolver/cyan.yaml`                                                         | New file with `build:` section                                                     |
| `cyan.yaml` (root)                                                           | Update description to mention Resolvers                                            |
| `cyan/package.json`                                                          | SDK `^2.0.0` → `^2.1.0`                                                            |
| All scaffold `package.json`                                                  | SDK `2.0.0` → `^2.1.0`                                                             |
| `scripts/test.sh`                                                            | Delete (replaced by test.cyan.yaml)                                                |
| `nix/pre-commit.nix`                                                         | Add `".*resolver.*"` to treefmt excludes                                           |
| `{template,plugin,processor,resolver}/common/scripts/publish.sh`             | New `cyanprint push --build --message` pattern                                     |
| `README.MD`                                                                  | Full documentation of meta-template                                                |
| `{template,plugin,processor,resolver}/common/.github/workflows/publish.yaml` | Simplified workflow                                                                |

---

## Part E: Claude Code Skills & CLAUDE.md (Optionally Generated)

The skills and CLAUDE.md are **optionally generated** — the meta-template asks a yes/no question, and when "yes", the generated scaffold includes Claude Code skills AND a CLAUDE.md that explains the project structure, conventions, and how to work with it.

### E1. New question in meta-template

After selecting artifact type and language, add: "Include Claude Code skills and CLAUDE.md?" (yes/no)

This question controls whether the `.claude/` skills directory and root `CLAUDE.md` are included in the generated output.

### E2. CLAUDE.md (per artifact type)

Each artifact type gets a generated `CLAUDE.md` at the project root that explains:

- **Project overview**: what this artifact is and how it fits into CyanPrint
- **Key files**: entry point, cyan.yaml, Dockerfile, test.cyan.yaml, CI/CD workflow
- **Development workflow**: how to develop, test, and publish
- **SDK concepts**: relevant SDK types and interfaces for this artifact type
- **Build/Push**: how `cyanprint build` and `cyanprint push --build` work with the `build:` section
- **Testing**: how `cyanprint test <artifact>` works with `test.cyan.yaml` and fixtures
- **Project structure**: directory layout with explanations

The CLAUDE.md content is artifact-specific (template vs processor vs plugin vs resolver) since each has different SDK entry points, test formats, and workflows.

### E3. 12 skills (3 per artifact type)

#### Writing skills — how to WRITE the artifact

| Skill               | Purpose                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `writing-template`  | How templates work: SDK entry points (`StartTemplateWithLambda`), `Cyan`/`CyanGlob`/`GlobType` types, `IInquirer` for prompts, var syntax. **How to search the CyanPrint registry** for processors/plugins/resolvers to use: registry API (`GET /api/v1/{Template,Processor,Plugin,Resolver}?Search=...&Limit=...`), reading README via slug endpoint, browsing at cyanprint.dev/registry. Mention the default processor `cyan/default` (always used). Document the API base URL (`https://api.zinc.sulfone.raichu.cluster.atomi.cloud/api/v1/`) and key search/list/slug endpoints. |
| `writing-processor` | How processors work: SDK entry points (`StartProcessorWithLambda` / `start_processor_with_fn` / `CyanEngine.StartProcessor`), `ProcessorInput` (config + readDir), `ProcessorOutput` (records of path→content), stream-based file transformation                                                                                                                                                                                                                                                                                                                                     |
| `writing-plugin`    | How plugins work: SDK entry points (`StartPluginWithLambda` / `start_plugin_with_fn` / `CyanEngine.StartPlugin`), `PluginOutput`, directory passthrough, validation vs transformation                                                                                                                                                                                                                                                                                                                                                                                                |
| `writing-resolver`  | How resolvers work: SDK entry points (`StartResolverWithLambda` / `start_resolver_with_fn` / `CyanEngine.StartResolver`), `ResolverInput` (config + files with origin/layer), `ResolverOutput` (path + content), conflict resolution concepts, used directly in template definition via `resolvers:` field                                                                                                                                                                                                                                                                           |

#### Documenting skills — how to USE the artifact (not how to write it)

| Skill                   | Purpose                                                                                                                                                                                                                                                                                                    |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `documenting-template`  | How to USE this template: what command to run (`cyanprint create {username}/{name}`), what it generates, what question KEYS are used (the `id` fields in `IInquirer` calls, e.g. `cyan/new/username`, `cyan/new/name`), what each question means, what the generated output directory structure looks like |
| `documenting-processor` | How to USE this processor: what config to pass in (generically), how to reference it in a template's `processors:` array, what it transforms                                                                                                                                                               |
| `documenting-plugin`    | How to USE this plugin: what config to pass in, how to reference it in a template's `plugins:` array, what it validates/transforms                                                                                                                                                                         |
| `documenting-resolver`  | How to USE this resolver: how it's referenced in a template's `resolvers:` array in `cyan.yaml`, what conflicts it resolves, how it receives `ResolverInput` with multi-origin files                                                                                                                       |

#### Testing skills — how to write `test.cyan.yaml`

| Skill               | Purpose                                                                                                                                                                           |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `testing-template`  | How to write `test.cyan.yaml` for templates: `answer_state` + `deterministic_state` format, `validate` commands, fixture directories, snapshot testing, `cyanprint test template` |
| `testing-processor` | How to write `test.cyan.yaml` for processors: `input` dir + `config`, snapshots/, `cyanprint test processor`                                                                      |
| `testing-plugin`    | How to write `test.cyan.yaml` for plugins: `validate` commands, snapshots/, `cyanprint test plugin`                                                                               |
| `testing-resolver`  | How to write `test.cyan.yaml` for resolvers: `resolver_inputs` (path + origin.template + origin.layer), snapshots/, `cyanprint test resolver`                                     |

### E4. Skills storage and conditional inclusion

- Skills source files live in `{artifact}/skills/` directories in the meta-template repo
- CLAUDE.md source lives in `{artifact}/CLAUDE.md`
- Each skill follows the Claude Code convention: `.claude/skills/{skill-name}/SKILL.md` with YAML front matter (`name`, `description`), plus optional supporting files (e.g., `reference.md`, `examples.md`)
- When user answers "yes" to skills question:
  - Add a `GlobType.Copy` entry that copies `{artifact}/skills/` → `.claude/skills/` in the generated output (each skill gets its own subdirectory with `SKILL.md`)
  - Add a `GlobType.Copy` entry for `{artifact}/CLAUDE.md` → `CLAUDE.md` in the generated output
- When "no", both globs are omitted — no skills or CLAUDE.md in the generated project

### E5. Skills content source

Skills and CLAUDE.md content derived from:

- iridium docs (`docs/developer/concepts/`, `docs/developer/surfaces/cli/`)
- helium SDK examples (`sdks/node/`, `sdks/python/`, `sdks/dotnet/`)
- iridium e2e tests (`e2e/*/test.cyan.yaml` for test format examples)
- Existing codebase patterns in this repo

---

## Part F: SDK & Dependency Upgrade

### F1. Node/TypeScript/JavaScript SDK

- `cyan/package.json`: `@atomicloud/cyan-sdk` `^2.0.0` → `^2.1.0`
- All scaffold `package.json` files (template/plugin/processor/resolver TS & JS): `2.0.0` → `^2.1.0`
- Regenerate all `bun.lockb` files by running `bun install` in each directory
- Keep Bun runtime at 1.3.8 in Dockerfiles (already newer than helium's 1.0.30)

### F2. Python dependencies

- All `requirements.txt`: `cyanprintsdk` `2.0.1` → `2.1.0`
- All `requirements.txt`: `pydantic` `2.9.2` → `2.11.4`
- All `requirements.txt`: `aiohttp` `3.9.5` → `3.11.18`
- Update `pydantic_core` and other transitive deps to match helium's versions
- Keep Python runtime at 3.12.12 in Dockerfiles (already newer than helium's 3.11)

### F3. .NET SDK

- Update `AtomiCloud.CyanPrint` (sulfone-helium) NuGet package to match helium 2.1.0
- .NET 8.0 runtime stays the same (matches helium)

---

## Part G: README Update

Update the root `README.MD` to document the full meta-template:

- All 4 artifact types (Template, Processor, Plugin, Resolver) with descriptions
- All 4 supported languages (TypeScript, JavaScript, Python, C#)
- Getting started: `cyanprint create cyan/new <folder>`
- What each artifact type does and when to use it
- The optional Claude Code skills + CLAUDE.md question
- Build/Push: how `cyanprint push --build` works with the `build:` section in generated projects
- Testing: how `cyanprint test <artifact>` works with `test.cyan.yaml` in generated projects
- Development: how to work on this meta-template itself, running `cyanprint test template .` at the root
- SDK version: v2.1.0
- Port assignments: Template=5550, Processor=5551, Plugin=5552, Resolver=5553

---

## Acceptance Criteria

### Resolver Support

- [ ] `resolver/` directory exists with all 4 language scaffolds
- [ ] `resolver/common/` has CI/CD files matching plugin/processor pattern
- [ ] `cyan/src/resolver.ts` exists and follows plugin/processor pattern exactly
- [ ] `cyan/index.ts` offers "Resolver" as a 4th option
- [ ] All resolver Dockerfiles build and log port 5553
- [ ] `scripts/test.sh` deleted
- [ ] `template/cyan.yaml` has static empty arrays for processors/plugins/resolvers
- [ ] `cyan/src/template.ts` no longer prompts for processors/plugins/resolvers

### Build/Push Modernization

- [ ] All generated `cyan.yaml` files include `build:` section
- [ ] All generated `publish.sh` use `cyanprint push --build --message` pattern
- [ ] `--message` uses latest git commit message truncated at 256 chars
- [ ] All generated `publish.yaml` workflows updated accordingly
- [ ] Existing template/processor/plugin publish scripts migrated

### Automated Testing

- [ ] Every generated scaffold includes `test.cyan.yaml` + fixtures
- [ ] Meta-template root `test.cyan.yaml` has 32 test cases (4 types × 4 langs × 2 skills toggle)
- [ ] Each root test case uses `validate` to run `cyanprint test <artifact> .` on generated output
- [ ] All answer_state keys use `cyan/new/` prefix
- [ ] `ci.yaml` runs `cyanprint test template .` at repo root

### Claude Code Skills & CLAUDE.md

- [ ] 12 skills written (3 per artifact type)
- [ ] Skills stored in `{artifact}/skills/` directories
- [ ] CLAUDE.md written per artifact type in `{artifact}/CLAUDE.md`
- [ ] "Include Claude Code skills and CLAUDE.md?" question added to meta-template
- [ ] Conditional glob includes skills + CLAUDE.md when user answers "yes"
- [ ] CLAUDE.md explains project structure, SDK concepts, dev workflow, build/push, testing
- [ ] writing-template skill documents CyanPrint registry API search
- [ ] documenting skills explain how to USE the artifact (question keys, commands, config)
- [ ] testing skills explain how to write test.cyan.yaml

### Other

- [ ] SDK upgraded to `^2.1.0` across all package.json files
- [ ] Python deps upgraded: `cyanprintsdk` 2.1.0, `pydantic` 2.11.4, `aiohttp` 3.11.18
- [ ] .NET `AtomiCloud.CyanPrint` upgraded to match helium 2.1.0
- [ ] All `bun.lockb` regenerated
- [ ] `nix/pre-commit.nix` excludes `resolver/.*`
- [ ] `cyan.yaml` (root) description mentions Resolvers
- [ ] `nix fmt` and pre-commit checks pass
- [ ] `README.MD` documents all 4 artifact types, languages, build/push, testing, skills
