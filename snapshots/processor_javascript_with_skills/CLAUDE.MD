# CLAUDE.md - CyanPrint Processor

This file provides guidance to Claude Code when working with CyanPrint processors.

## Project Overview

This is a CyanPrint processor project. Processors transform template files during CyanPrint execution. The processor lambda receives two parameters: `CyanProcessorInput` and `CyanFileHelper`.

## Key Files

```text
├── cyan/
│   ├── index.ts              # Processor entry point - StartProcessorWithLambda
│   ├── src/
│   │   └── *.ts              # Processor logic modules
│   ├── package.json          # Dependencies (@atomicloud/cyan-sdk)
│   └── tsconfig.json         # TypeScript configuration
├── processor/                 # Processor artifact files (language-specific)
│   ├── {language}/           # Language-specific implementations
│   └── common/               # Shared files
├── .claude/skills/            # Claude Code skills
├── cyan.yaml                 # Processor metadata and configuration
├── cyan/Dockerfile           # Processor runtime container
├── cyan/blob.Dockerfile      # Blob storage container
├── test.cyan.yaml            # Test configuration
└── scripts/
    └── publish.sh            # Build and push script
```

## Development Workflow

### 1. Edit Processor Files

Modify files in `processor/` directories to change transformation behavior.

### 2. Test Locally

```bash
cyanprint test processor .
cyanprint test processor . --verbose
cyanprint test processor . --update-snapshots
```

### 3. Publish

Authentication is required via `--token` flag or `CYAN_TOKEN` environment variable. The `--token` and `--message` flags must come before the artifact type subcommand.

```bash
# Build and push (requires tag argument for --build)
cyanprint push --token TOKEN --message "commit message" processor --build v1.0.0

# Push only (no build)
cyanprint push --token TOKEN --message "commit message" processor
```

## Skill Workflow

When working on this processor, follow this skill sequence:

1. **Writing skill** (`writing-processor-{language}`) — implement processor logic, entry point, and file transformation
2. **Testing skill** (`testing-processor`) — write and run test cases in `test.cyan.yaml`
3. **Documenting skill** (`documenting-processor`) — update `CLAUDE.md` and documentation

Detailed SDK types (CyanFileHelper, VirtualFile, ProcessorOutput) and implementation patterns are documented in the writing skill. Refer to it for implementation details.

## Using in Templates

Reference processor in template's cyan.yaml:

```yaml
processors: [username/processor-name]
```

## Registry

- Browse: https://cyanprint.dev/registry
- API: `https://api.zinc.sulfone.raichu.cluster.atomi.cloud/api/v1/Processor`
