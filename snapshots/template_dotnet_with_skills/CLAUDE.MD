# CLAUDE.md - CyanPrint Template

This file provides guidance to Claude Code when working with CyanPrint templates.

## Project Overview

This is a CyanPrint template project. CyanPrint templates generate project scaffolding by prompting users for information and producing customized file structures.

## Key Files

```
├── cyan/
│   ├── index.ts              # Template entry point - StartTemplateWithLambda
│   ├── src/
│   │   ├── standard.ts       # Standard prompting logic
│   │   └── *.ts              # Additional template logic
│   ├── package.json          # Dependencies (@atomicloud/cyan-sdk)
│   └── tsconfig.json         # TypeScript configuration
├── template/                  # Template artifact files (language-specific)
│   ├── {language}/           # Language-specific scaffolding
│   └── common/               # Shared files
├── .claude/skills/            # Claude Code skills
├── cyan.yaml                 # Template metadata and configuration
├── cyan/Dockerfile           # Template runtime container
├── cyan/blob.Dockerfile      # Blob storage container
├── test.cyan.yaml            # Test configuration
└── scripts/
    └── publish.sh            # Build and push script
```

## Development Workflow

### 1. Edit Template Files

Modify files in `template/` directories to change what gets generated.

### 2. Test Locally

```bash
cyanprint test template .
cyanprint test template . --verbose
cyanprint test template . --update-snapshots
```

### 3. Publish

Authentication is required via `--token` flag or `CYAN_TOKEN` environment variable. The `--token` and `--message` flags must come before the artifact type subcommand.

```bash
# Build and push (requires tag argument for --build)
cyanprint push --token TOKEN --message "commit message" template --build v1.0.0

# Push only (no build)
cyanprint push --token TOKEN --message "commit message" template
```

## Skill Workflow

When working on this template, follow this skill sequence:

1. **Writing skill** (`writing-template-{language}`) — implement template logic, entry point, prompts, and file generation
2. **Testing skill** (`testing-template`) — write and run test cases in `test.cyan.yaml`
3. **Documenting skill** (`documenting-template`) — update `CLAUDE.md` and documentation

Detailed SDK types, IInquirer question types, processor configuration, and IDeterminism usage are documented in the writing skill. Refer to it for implementation details.

## Variable Syntax

Templates use double-brace syntax (injected by the meta-template's processor config):

```
{{ variable_name }}
```

With comment prefixes for code files:

```
// {{ variable_name }}    # TypeScript/JavaScript/C#
# {{ variable_name }}     # Python/Shell
```

## Registry

- Browse: https://cyanprint.dev/registry
- API: `https://api.zinc.sulfone.raichu.cluster.atomi.cloud/api/v1/`
