# Ticket: CU-86ewy2jep

- **Type**: task
- **Status**: todo
- **URL**: https://app.clickup.com/t/86ewy2jep
- **Parent**: none

## Description

Spec: Add Resolver Support, Build/Push, Automated Testing, Skills & SDK v2.1.0

Repo: ketone/new-cyanprint
Spec files: spec/v2-resolver-migration.md and spec/skill-source-map.md (committed to repo)

Objective

Migrate the ketone/new-cyanprint meta-template to:

Add Resolver as the 4th artifact type (alongside Template, Processor, Plugin)
Adopt cyanprint build / cyanprint push --build in all generated CI/CD workflows (replacing manual docker buildx + cyanprint push scripts)
Ship test.cyan.yaml + fixtures in every generated scaffold so users get automated snapshot-based testing out of the box
Test the meta-template itself by generating projects from it and running cyanprint test <artifact> on the generated output in CI
Optionally include Claude Code skills for writing, documenting, and testing each artifact type
Upgrade to SDK v2.1.0

Reference Material

| Source                                                                  | Purpose                           |
| ----------------------------------------------------------------------- | --------------------------------- |
| sulfone/helium/sdks/node/resolver_test.ts                               | TypeScript resolver example       |
| sulfone/helium/sdks/python/resolver_test.py                             | Python resolver example           |
| sulfone/helium/sdks/dotnet/sulfone-helium-resolver-api/Program.cs       | C# resolver example               |
| sulfone/helium/sdks/\*/resolver.Dockerfile                              | Resolver Dockerfiles per language |
| sulfone/silicon/.../docs/developer/resolvers/                           | Resolver documentation            |
| sulfone/silicon/.../docs/developer/templates/reference/build-config.mdx | build: config in cyan.yaml        |
| sulfone/silicon/.../docs/developer/\*/how-to/automated-testing.mdx      | test.cyan.yaml per artifact       |
| sulfone/silicon/.../docs/developer/\*/how-to/push-to-registry.mdx       | Push patterns per artifact        |

Part A: New Feature — build: Config in Generated cyan.yaml

Background

CyanPrint now supports a build: section in cyan.yaml that configures Docker buildx. This replaces the old pattern of hand-written docker buildx build commands in publish.sh.

Commands:

cyanprint build <tag> — Reads build: from cyan.yaml, builds + pushes all defined images
cyanprint push <artifact> --build <tag> --token $CYAN_TOKEN — Build, push Docker images, AND register with the CyanPrint registry in one step

Changes to Generated cyan.yaml Files

Template cyan.yaml (template/cyan.yaml) — add build: section:

```yaml
username: {{ username }}
name: {{ name }}
description: {{ desc }}
project: {{ project }}
source: {{ source }}
email: {{ email }}
tags: {{ tags }}
readme: cyan/README.MD
templates: []
processors: {{ processors }}
plugins: {{ plugins }}
resolvers: {{ resolvers }}
build:
  registry: ghcr.io/{{ username }}
  platforms:
    - linux/amd64
    - linux/arm64
  images:
    template:
      image: {{ name }}
      dockerfile: cyan/Dockerfile
      context: ./cyan
    blob:
      image: {{ name }}-blob
      dockerfile: cyan/blob.Dockerfile
      context: .
```

Processor cyan.yaml (processor/cyan.yaml):

```yaml
username: { { username } }
name: { { name } }
description: { { desc } }
project: { { project } }
source: { { source } }
email: { { email } }
tags: { { tags } }
readme: README.MD
build:
  registry: ghcr.io/{{ username }}
  platforms:
    - linux/amd64
    - linux/arm64
  images:
    processor:
      image: { { name } }
      dockerfile: Dockerfile
      context: .
```

Plugin cyan.yaml (plugin/cyan.yaml) — same as processor but with plugin: image key.

Resolver cyan.yaml (resolver/cyan.yaml) — new file, same as processor but with resolver: image key.

Changes to Generated CI/CD Workflows

Replace the old publish.sh + publish.yaml pattern in \*/common/ for all 4 artifact types.

New publish.sh pattern (plugin/processor/resolver):

```bash
#!/usr/bin/env bash
set -eou pipefail
[ "${CYAN_TOKEN}" = '' ] && echo "CYAN_TOKEN not set" && exit 1
[ "${IMAGE_VERSION}" = '' ] && echo "IMAGE_VERSION not set" && exit 1
cyanprint push plugin --build "${IMAGE_VERSION}" --token "${CYAN_TOKEN}"
```

New publish.yaml pattern — simplified, Docker login + buildx setup still needed, but cyanprint push --build handles the actual build/push.

Part B: New Feature — Automated Testing with test.cyan.yaml

Background

CyanPrint now supports snapshot-based automated testing via test.cyan.yaml:

| Artifact  | Command                    | test init support    | Test structure                              |
| --------- | -------------------------- | -------------------- | ------------------------------------------- |
| Template  | cyanprint test template .  | Yes (auto-generates) | answer_state + fixtures/expected/           |
| Processor | cyanprint test processor . | No (manual)          | input dir + config + globs + snapshots/     |
| Plugin    | cyanprint test plugin .    | No (manual)          | input dir + config + fixtures/expected/     |
| Resolver  | cyanprint test resolver .  | No (manual)          | resolver_inputs (multi-origin) + snapshots/ |

Generated Test Files per Artifact Type

Each generated scaffold should include a working test.cyan.yaml with a minimal sample test case and corresponding fixture directories. See full spec in spec/v2-resolver-migration.md for exact file contents.

Part C: Meta-Template CI — Test Generated Outputs with cyanprint test

The current scripts/test.sh only validates Docker container boot. The new approach:

Generate a project from the meta-template using cyanprint create with predetermined answers
Run cyanprint test <artifact> . on each generated project
This validates the full round-trip: meta-template → generated project → working CyanPrint artifact

New files:

scripts/test-generated.sh — orchestrates generate + test
test.cyan.yaml at project root — the meta-template's own snapshot tests
fixtures/expected/ — expected output for each artifact type × language combo
Updated ci.yaml with test-generated job

Part D: Resolver Directory Structure

Create resolver/ directory mirroring plugin/ and processor/:

```
resolver/
├── cyan.yaml                    # Metadata template with build: section
├── common/                      # CI/CD files (publish.yaml, publish.sh, setup-ubuntu.sh)
├── typescript/                  # StartResolverWithLambda + Dockerfile + test.cyan.yaml
├── javascript/                  # Same structure
├── python/                      # start_resolver_with_fn + Dockerfile + test.cyan.yaml
└── dotnet/                      # CyanEngine.StartResolver + Dockerfile + test.cyan.yaml
```

Port: 5553 (Template=5550, Processor=5551, Plugin=5552, Resolver=5553)

Part E: Source Code Changes

New: cyan/src/resolver.ts — follows plugin/processor pattern
Update: cyan/index.ts — add "Resolver" to select prompt, route to PromptResolver
Update: cyan/src/template.ts — add resolver prompting (like processors/plugins)
Update: template/cyan.yaml — add resolvers: {{ resolvers }} field
Update: cyan.yaml (root) — description mentions Resolvers

Part F: Optional Claude Code Skills

New Question in Meta-Template

After selecting artifact type and language, ask: "Include Claude Code skills for writing, documenting, and testing?"

Skills per Artifact Type (12 total)

| Skill                  | Purpose                                                              |
| ---------------------- | -------------------------------------------------------------------- |
| writing-<artifact>     | Big picture: what the artifact does, SDK entry points, core concepts |
| documenting-<artifact> | cyan.yaml, README, Dockerfile, build config, project structure       |
| testing-<artifact>     | test.cyan.yaml, fixtures, snapshot tests, CI integration             |

Skills are stored in <artifact>/skills/ directories and conditionally included via GlobType.Copy when user answers "yes".

Source material: See spec/skill-source-map.md in the repo for complete mapping of each skill to its silicon documentation source files.

Part G: Other Updates

SDK upgrade: 2.0.0 → ^2.1.0 across all package.json files
Regenerate all bun.lockb files
nix/pre-commit.nix: add resolver/.\* to exclusion list
scripts/test.sh: add resolver container boot tests (port 5553)
Migrate existing plugin/processor/template publish.sh to new pattern

Implementation Order

Phase 1: Core Resolver Support

Create resolver/ directory structure (all 4 languages, Dockerfiles, entry points)
Create cyan/src/resolver.ts
Update cyan/index.ts to add Resolver option
Update scripts/test.sh for resolver containers
Update nix/pre-commit.nix exclusions

Phase 2: Build/Push Modernization

Add build: section to ALL generated cyan.yaml files
Rewrite ALL generated publish.sh to use cyanprint push --build
Update ALL generated publish.yaml workflows accordingly

Phase 3: Automated Testing Infrastructure

Create test.cyan.yaml + fixtures for each artifact × language scaffold
Create meta-template's own test.cyan.yaml + fixtures/expected/ snapshots
Create scripts/test-generated.sh

Phase 4: Claude Code Skills

Write 12 skills (3 per artifact type) — extract from silicon docs
Add skills question to meta-template
Add skills glob entries (conditional on user answer)
Store skills in <artifact>/skills/ directories

Phase 5: CI/CD Integration

Update ci.yaml to add test-generated job
Update cyan/src/template.ts to prompt for resolvers
Update template/cyan.yaml to include resolvers field

Phase 6: Finalize

Upgrade SDK to ^2.1.0 across all package.json files
Regenerate all bun.lockb files
Update cyan.yaml (root) description
Run full test suite

Testing Strategy

| Level | What            | How                                                                     |
| ----- | --------------- | ----------------------------------------------------------------------- |
| 1     | Container Boot  | scripts/test.sh — 16 containers (4 types × 4 langs), check port in logs |
| 2     | Scaffold Tests  | cyanprint test <artifact> . on each scaffold directory                  |
| 3     | Round-Trip Test | Generate project from meta-template, run cyanprint test on output       |

Acceptance Criteria

Resolver Support

resolver/ directory exists with all 4 language scaffolds
resolver/common/ has CI/CD files
cyan/src/resolver.ts exists and follows plugin/processor pattern
cyan/index.ts offers "Resolver" as a 4th option
All resolver Dockerfiles build and log 5553
scripts/test.sh tests all 16 containers (4x4)

Build/Push Modernization

All generated cyan.yaml files include build: section
All generated publish.sh use cyanprint push --build pattern
All generated publish.yaml workflows updated
Existing template/processor/plugin publish scripts migrated

Automated Testing

Every generated scaffold includes test.cyan.yaml + fixtures
cyanprint test <artifact> . passes on each scaffold directory
Meta-template has its own test.cyan.yaml with snapshot tests
scripts/test-generated.sh exists and passes

CI/CD

ci.yaml has test-generated job
Generated project round-trip test passes in CI

Claude Code Skills

12 skills written (3 per artifact type: writing, documenting, testing)
Skills stored in <artifact>/skills/ directories
Skills question added to meta-template
Conditional glob includes skills when user answers "yes"
Skill content is self-contained (no external doc dependencies)
Source material mapped in spec/skill-source-map.md

Other

SDK upgraded to ^2.1.0
nix/pre-commit.nix excludes resolver/.\*
cyan.yaml description mentions Resolvers
Template generation supports resolvers field
nix fmt and pre-commit checks pass

## Comments

(none)
