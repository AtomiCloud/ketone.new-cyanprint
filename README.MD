# CyanPrint Meta Template

Official CyanPrint template for creating CyanPrint Templates, Processors, Plugins, and Resolvers.

## Features

- **4 artifact types**: Template, Processor, Plugin, Resolver
- **4 languages**: TypeScript, JavaScript, Python, C#
- **Optional Claude Code skills** and `CLAUDE.md` for AI-assisted development
- **Built-in snapshot-based testing** via `test.cyan.yaml`
- **Integrated CI/CD** with `cyanprint push --build` and GitHub Actions

## Getting Started

```bash
cyanprint create cyan/new <folder>
```

The interactive prompt walks you through:

1. **Artifact type** -- Template, Plugin, Processor, or Resolver
2. **Language** -- TypeScript, JavaScript, Python, or C#
3. **Claude Code skills** -- whether to include `.claude/skills/` and `CLAUDE.md`
4. **Metadata** -- username, name, description, email, project URL, source URL, tags

## Artifact Types

| Type | Purpose | Default Port |
|------|---------|-------------|
| **Template** | Generates project scaffolds from user prompts and configuration | N/A |
| **Processor** | Transforms files during the template generation pipeline | 5551 |
| **Plugin** | Validates or transforms the final output of a template run | 5552 |
| **Resolver** | Resolves individual files with custom logic, called by the engine as needed | 5553 |

### Template

Templates are the entry point of the CyanPrint ecosystem. They use `StartTemplateWithLambda` to prompt users for input and produce a `Cyan` configuration that defines files, processors, and plugins to apply.

### Processor

Processors run during generation to transform files. They receive files and produce modified output as part of the pipeline.

### Plugin

Plugins run after generation is complete. They receive the entire generated directory and can validate it (returning errors/warnings) or transform it (returning modified file records).

### Resolver

Resolvers handle individual file resolution with custom logic. The engine may call a resolver multiple times, passing files one at a time. Each call returns a single resolved output with a path and content.

## Generated Project Structure

Every generated project includes:

```
<project>/
├── cyan.yaml              # Metadata and build configuration
├── Dockerfile             # Runtime container
├── .dockerignore
├── .gitignore
├── README.MD
├── test.cyan.yaml         # Snapshot-based test configuration
├── scripts/
│   ├── publish.sh         # cyanprint push --build --message
│   └── setup-ubuntu.sh    # CI environment setup
├── .github/workflows/
│   └── publish.yaml       # CI/CD pipeline (triggered on push to main)
├── <language files>       # index.ts, main.py, *.csproj, etc.
└── .claude/               # (optional, when skills=yes)
    ├── CLAUDE.md
    └── skills/
        ├── writing-<type>/SKILL.md
        ├── testing-<type>/SKILL.md
        └── documenting-<type>/SKILL.md
```

### cyan.yaml Build Configuration

Generated projects include a `build:` section in `cyan.yaml`:

```yaml
build:
  registry: ${DOMAIN}/${GITHUB_REPO_REF}
  platforms:
    - linux/amd64
    - linux/arm64
  images:
    <type>:
      image: <image-name>
      dockerfile: Dockerfile
      context: .
```

### CI/CD

The generated `.github/workflows/publish.yaml` provides a complete pipeline:

- Triggers on push to `main`
- Sets up Docker buildx and QEMU for multi-arch builds (linux/amd64, linux/arm64)
- Authenticates with GitHub Container Registry (ghcr.io)
- Installs CyanPrint and runs `scripts/publish.sh`

The publish script uses:

```bash
cyanprint push <type> --build "${IMAGE_VERSION}" --token "${CYAN_TOKEN}" --message "${COMMIT_MSG}"
```

Requires environment variables: `CYAN_TOKEN`, `IMAGE_VERSION`, `DOMAIN`, `GITHUB_REPO_REF`, `DOCKER_USER`, `DOCKER_PASSWORD`.

## Testing

Generated projects include `test.cyan.yaml` for snapshot-based testing:

```yaml
tests:
  - name: test_case_name
    expected:
      type: snapshot
      value:
        path: ./snapshots/test_case_name
    # Additional fields depend on artifact type
```

Run tests with:

```bash
cyanprint test <type> .
```

### Meta-Template Tests

This meta-template is itself tested with **32 test cases** covering all combinations:

- 4 artifact types (Template, Plugin, Processor, Resolver)
- 4 languages (TypeScript, JavaScript, Python, C#)
- 2 skills variants (yes, no)

Each test generates a project from the meta-template and validates the output against a snapshot in `snapshots/`.

## Supported Languages

| Language | SDK Package | Version |
|----------|-------------|---------|
| TypeScript | `@atomicloud/cyan-sdk` | 2.1.0 |
| JavaScript | `@atomicloud/cyan-sdk` | 2.1.0 |
| Python | `cyanprintsdk` | 2.1.0 |
| C# | `AtomiCloud.CyanPrint` | 2.1.0 |

## Development

### Prerequisites

- [CyanPrint CLI](https://cyanprint.dev)
- [Nix](https://nixos.org) (optional, for reproducible development environment)

### Development Shell

```bash
nix develop
```

Provides all required tools and dependencies.

### Formatting

```bash
nix fmt
```

### Pre-commit Checks

```bash
nix run .#pre-commit-check
```

### Modifying Templates

Templates, processors, plugins, and resolvers are organized by type and language:

```
template/{typescript,javascript,python,dotnet}/
processor/{typescript,javascript,python,dotnet}/
plugin/{typescript,javascript,python,dotnet}/
resolver/{typescript,javascript,python,dotnet}/
```

Shared files that apply regardless of language live in `{type}/common/`.

After making changes, update the corresponding snapshots:

```bash
cyanprint test template . --update-snapshots
```
