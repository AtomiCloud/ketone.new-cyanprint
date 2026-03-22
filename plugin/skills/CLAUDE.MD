# CLAUDE.md - CyanPrint Plugin

This file provides guidance to Claude Code when working with CyanPrint plugins.

## Project Overview

This is a CyanPrint plugin project. Plugins validate or transform the final output of CyanPrint templates. Plugins receive the generated output directory and use native OS operations for file I/O and command execution.

## Key Files

```
├── cyan/
│   ├── index.ts              # Plugin entry point - StartPluginWithLambda
│   ├── src/
│   │   └── *.ts              # Plugin logic modules
│   ├── package.json          # Dependencies (@atomicloud/cyan-sdk)
│   └── tsconfig.json         # TypeScript configuration
├── plugin/                    # Plugin artifact files (language-specific)
│   ├── {language}/           # Language-specific implementations
│   └── common/               # Shared files
├── .claude/skills/            # Claude Code skills
├── cyan.yaml                 # Plugin metadata and configuration
├── cyan/Dockerfile           # Plugin runtime container
├── cyan/blob.Dockerfile      # Blob storage container
├── test.cyan.yaml            # Test configuration
└── scripts/
    └── publish.sh            # Build and push script
```

## Development Workflow

### 1. Edit Plugin Files

Modify files in `plugin/` directories to change validation/transformation behavior.

### 2. Test Locally

```bash
cyanprint test plugin .
cyanprint test plugin . --verbose
cyanprint test plugin . --update-snapshots
```

### 3. Publish

Authentication is required via `--token` flag or `CYAN_TOKEN` environment variable. The `--token` and `--message` flags must come before the artifact type subcommand.

```bash
# Build and push (requires tag argument for --build)
cyanprint push --token TOKEN --message "commit message" plugin --build v1.0.0

# Push only (no build)
cyanprint push --token TOKEN --message "commit message" plugin
```

## Skill Workflow

When working on this plugin, follow this skill sequence:

1. **Writing skill** (`writing-plugin-{language}`) — implement plugin logic, entry point, and validation/transformation
2. **Testing skill** (`testing-plugin`) — write and run test cases in `test.cyan.yaml`
3. **Documenting skill** (`documenting-plugin`) — update `CLAUDE.md` and documentation

Detailed SDK types (PluginInput, PluginOutput) and native file I/O patterns are documented in the writing skill. Refer to it for implementation details.

## Using in Templates

Reference plugin in template's cyan.yaml:

```yaml
plugins: [username/plugin-name]
```

## Registry

- Browse: https://cyanprint.dev/registry
- API: `https://api.zinc.sulfone.raichu.cluster.atomi.cloud/api/v1/Plugin`
