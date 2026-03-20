# Plan 5: README Documentation

**Spec sections**: Part G
**Depends on**: Plans 1-4 (needs full picture of what was added)

## Overview

Update the root `README.MD` to comprehensively document the meta-template: what it generates, how to use it, the 4 artifact types, supported languages, skills toggle, testing, and CI/CD.

## Steps

### 5.1 Rewrite `README.MD`

Replace the current minimal README with comprehensive documentation covering:

**Header & Description:**

- Title: CyanPrint Meta Template
- Description: Official CyanPrint template for creating Templates, Processors, Plugins, and Resolvers

**Features:**

- 4 artifact types: Template, Processor, Plugin, Resolver
- 4 languages: TypeScript, JavaScript, Python, C#
- Optional Claude Code skills & CLAUDE.md for AI-assisted development
- Built-in snapshot-based testing via `test.cyan.yaml`
- Integrated CI/CD with `cyanprint push --build`

**Getting Started:**

```bash
cyanprint create cyan/new <folder>
```

- Walks through the interactive prompts: artifact type, language, skills toggle, metadata

**Artifact Types:**

- Brief description of each (Template, Processor, Plugin, Resolver)
- What each generates and its purpose in the CyanPrint ecosystem
- Default ports: Template (N/A — generates files), Processor (5551), Plugin (5552), Resolver (5553)

**Generated Project Structure:**

- Overview of what a generated scaffold contains
- `cyan.yaml` with `build:` section
- `scripts/publish.sh` with `cyanprint push --build --message`
- `.github/workflows/publish.yaml` CI/CD workflow
- `test.cyan.yaml` + fixtures for snapshot testing
- Optional `.claude/skills/` and `CLAUDE.MD` when skills=yes

**Testing:**

- How to run tests: `cyanprint test <artifact> .`
- What `test.cyan.yaml` does (snapshot-based testing)
- How the meta-template itself is tested (32 test cases)

**Development:**

- Prerequisites: CyanPrint CLI, Nix (optional)
- `nix develop` for dev shell
- `nix fmt` for formatting
- How to modify templates and test changes

**SDK Versions:**

- Table of current SDK versions across languages

## Acceptance criteria

- README covers all 4 artifact types including Resolver
- Getting started section with `cyanprint create cyan/new <folder>`
- Documents the skills toggle option
- Documents testing approach (`cyanprint test`)
- Documents the CI/CD publish pattern with `--build --message`
- Documents supported languages
- Mentions SDK v2.1.0
