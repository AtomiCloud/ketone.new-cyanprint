# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a CyanPrint meta-template repository for creating CyanPrint templates, processors, and plugins. CyanPrint is a templating system that supports TypeScript, JavaScript, Python, and C# for code generation.

## Key Commands

### Build and Development

- `task build` - Builds and publishes the template (requires environment variables)
- `nix develop` - Enter development shell with all dependencies
- `nix fmt` - Format all code using treefmt
- `nix run .#pre-commit-check` - Run pre-commit checks

### CyanPrint Specific

- `cyanprint create cyan/new <folder>` - Create new project from this template
- `cyanprint push template <blob-image> <version> <template-image> <version>` - Push template to registry

### Linting and Formatting

- `biome lint --write` - TypeScript/JavaScript linting
- `shellcheck` - Shell script validation
- `infisical scan .` - Secret scanning

## Architecture

### Core Structure

```
cyan/                   # Main CyanPrint processor
├── src/
│   ├── plugin.ts      # Plugin creation logic
│   ├── processor.ts   # Processor creation logic
│   ├── template.ts    # Template creation logic
│   ├── standard.ts    # Common prompting logic
│   └── util.ts        # Utility functions
├── index.ts           # Entry point
└── package.json       # TypeScript/Bun configuration

plugin/                # Plugin templates for each language
├── dotnet/
├── javascript/
├── python/
└── typescript/

processor/             # Processor templates for each language
├── dotnet/
├── javascript/
├── python/
└── typescript/

template/              # Template templates for each language
├── dotnet/
├── javascript/
├── python/
└── typescript/
```

### Technology Stack

- **Runtime**: Bun (TypeScript execution)
- **Language**: TypeScript with ESNext targets
- **Package Manager**: Bun
- **Build System**: Nix flakes + Docker
- **CI/CD**: GitHub Actions
- **Linting**: Biome, pre-commit hooks

### CyanPrint SDK Integration

Uses `@atomicloud/cyan-sdk` v2.0.0 for:

- `StartTemplateWithLambda()` - Template entry point
- `IInquirer` interface for user prompts
- `Cyan`, `CyanGlob`, `GlobType` types for configuration
- File globbing and templating operations

### Template Generation Logic

The main entry point (`cyan/index.ts`) prompts users to:

1. Choose creation type (Template/Plugin/Processor)
2. Select language (TypeScript/C#/JavaScript/Python)
3. Collect standard metadata via `standardCyanModel()`
4. Route to language-specific generation functions

Each language variant generates appropriate:

- Directory structures
- Configuration files
- Language-specific processor/plugin definitions
- Docker configurations for containerized execution

### Environment Requirements

Must set these environment variables for builds:

- `DOMAIN`, `GITHUB_REPO_REF`, `GITHUB_SHA`, `GITHUB_BRANCH`
- `DOCKER_PASSWORD`, `DOCKER_USER`
- `CYAN_TOKEN`, `CYAN_PATH`

### Development Workflow

1. Use `nix develop` for consistent environment
2. Modify template sources in respective language directories
3. Test with `cyanprint create cyan/new <test-folder>`
4. Run pre-commit checks before committing
5. Use `task build` for publishing (CI/CD context)
