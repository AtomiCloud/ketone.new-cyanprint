# Plan 1: Core Resolver Support + Infrastructure

**Spec sections**: Part A (all), Part D (resolver-related rows), Part F (SDK upgrade)

## Overview

Add Resolver as the 4th artifact type by creating the `resolver/` directory structure (4 languages), the meta-template routing logic, and updating infrastructure files. Also upgrade SDK to ^2.1.0 and regenerate lockfiles.

## Steps

### 1.1 Create `resolver/` directory scaffolds (4 languages)

Copy `plugin/` as the structural base and adapt for resolvers.

**Files to create** (mirroring `plugin/` structure exactly):

- `resolver/typescript/index.ts` — `StartResolverWithLambda` (spec A2 TypeScript example)
- `resolver/typescript/package.json` — copy from `plugin/typescript/package.json`, SDK `^2.1.0`
- `resolver/typescript/tsconfig.json` — copy from `plugin/typescript/tsconfig.json`
- `resolver/typescript/Dockerfile` — copy from `plugin/typescript/Dockerfile`, change EXPOSE to 5553
- `resolver/typescript/.dockerignore` — copy from `plugin/typescript/.dockerignore`
- `resolver/typescript/.gitignore` — copy from `plugin/typescript/.gitignore`
- `resolver/typescript/README.MD` — adapt from `plugin/typescript/README.MD`, mention resolver

- `resolver/javascript/index.js` — `StartResolverWithLambda` (spec A2 JavaScript example)
- `resolver/javascript/package.json` — copy from `plugin/javascript/package.json`, SDK `^2.1.0`
- `resolver/javascript/jsconfig.json` — copy from `plugin/javascript/jsconfig.json`
- `resolver/javascript/Dockerfile` — copy from `plugin/javascript/Dockerfile`, change EXPOSE to 5553
- `resolver/javascript/.dockerignore` — copy from `plugin/javascript/.dockerignore`
- `resolver/javascript/.gitignore` — copy from `plugin/javascript/.gitignore`
- `resolver/javascript/README.MD` — adapt from `plugin/javascript/README.MD`

- `resolver/python/main.py` — `start_resolver_with_fn` (spec A2 Python example)
- `resolver/python/requirements.txt` — copy from `plugin/python/requirements.txt`
- `resolver/python/Dockerfile` — copy from `plugin/python/Dockerfile`, change EXPOSE to 5553
- `resolver/python/.dockerignore` — copy from `plugin/python/.dockerignore`
- `resolver/python/.gitignore` — copy from `plugin/python/.gitignore`
- `resolver/python/README.MD` — adapt from `plugin/python/README.MD`

- `resolver/dotnet/Program.cs` — `CyanEngine.StartResolver` (spec A2 C# example)
- `resolver/dotnet/Resolver.csproj` — copy from `plugin/dotnet/Processor.csproj`, rename project
- `resolver/dotnet/Resolver.sln` — copy from `plugin/dotnet/Processor.sln`, rename project
- `resolver/dotnet/Dockerfile` — copy from `plugin/dotnet/Dockerfile`, change EXPOSE to 5553, update paths
- `resolver/dotnet/.dockerignore` — copy from `plugin/dotnet/.dockerignore`
- `resolver/dotnet/.gitignore` — copy from `plugin/dotnet/.gitignore`
- `resolver/dotnet/README.MD` — adapt from `plugin/dotnet/README.MD`

**Key difference from plugin**: Entry points use `StartResolverWithLambda` / `start_resolver_with_fn` / `CyanEngine.StartResolver` and return `ResolverOutput { path, content }` from `ResolverInput { config, files }`. Port is 5553 instead of 5552.

### 1.2 Create `resolver/cyan.yaml`

New file with metadata template vars AND `build:` section (from spec B1):

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

### 1.3 Create `resolver/common/` CI/CD files

Copy from `plugin/common/` and adapt:

- `resolver/common/.dockerignore` — copy from `plugin/common/.dockerignore`
- `resolver/common/.gitignore` — copy from `plugin/common/.gitignore`
- `resolver/common/.github/workflows/publish.yaml` — copy from `plugin/common/.github/workflows/publish.yaml`, simplify per spec B3
- `resolver/common/scripts/publish.sh` — new pattern: `cyanprint push resolver --build "${IMAGE_VERSION}" --token "${CYAN_TOKEN}"` (spec B2)
- `resolver/common/scripts/setup-ubuntu.sh` — copy from `plugin/common/scripts/setup-ubuntu.sh`

### 1.4 Create `cyan/src/resolver.ts`

Follow `cyan/src/plugin.ts` exactly:

- Export `PromptResolver(inquirer, langType, vars): Promise<Cyan>`
- Route to `resolver/{language}/` via `GlobType.Template`
- Copy `resolver/common/` via `GlobType.Copy`
- Template `resolver/cyan.yaml` via `GlobType.Template`
- Language value functions: `TypescriptValues()`, `JavascriptValues()`, `PythonValues()`, `CSharpValues()` returning `CyanGlob[]` with `root: "resolver/{language}"`

### 1.5 Update `cyan/index.ts`

- Import `PromptResolver` from `./src/resolver.ts`
- Add `'Resolver'` to select choices: `['Template', 'Plugin', 'Processor', 'Resolver']`
- Add else-if branch: `if (cyanType === 'Resolver') return PromptResolver(inquirer, langType, vars)`

### 1.6 Simplify `cyan/src/template.ts`

- Remove the processor prompting loop (lines 16-31: `processors` array, `processorCount`, `processorQ`, while loop)
- Remove the plugin prompting loop (lines 33-44: `plugins` array, `pluginCount`, `pluginQ`, while loop)
- Remove `processors` and `plugins` parameters from all 4 language value functions (`TypescriptValues`, `JavascriptValues`, `PythonValues`, `CSharpValues`)
- Change return type from `[string, string, CyanGlob[]]` to `CyanGlob[]` (drop processorsConfig and pluginsConfig)
- Remove the template vars `processors`, `plugins`, `processorsConfig`, `pluginsConfig` from the config object
- Remove the code generation logic (`.map()` calls that generate CyanProcessor/CyanPlugin code snippets)
- Remove imports: `QuestionType`, `indent`, `referenceValid`, `os`

### 1.7 Update `template/cyan.yaml`

Change from templated to static empty arrays:

```yaml
processors: { { processors } }
plugins: { { plugins } }
```

→

```yaml
templates: []
processors: []
plugins: []
resolvers: []
```

### 1.8 Update infrastructure files

- **Delete `scripts/test.sh`** — Docker container boot tests are replaced by `test.cyan.yaml`-based testing (see Plan 3)

- `nix/pre-commit.nix` — add `".*resolver.*"` to treefmt excludes list

- `cyan.yaml` (root) — update description: "CyanPrint Template to create CyanPrint Templates, Processors, Plugins or Resolvers"

### 1.9 SDK upgrade to ^2.1.0

- `cyan/package.json` — change `@atomicloud/cyan-sdk` from `^2.0.0` to `^2.1.0`
- All scaffold `package.json` files (plugin/processor/template TS & JS, and new resolver TS & JS) — SDK `^2.1.0`

### 1.10 Python dependency upgrade

All `requirements.txt` files (plugin/python, processor/python, template/python/cyan, resolver/python):

- `cyanprintsdk` `2.0.1` → `2.1.0`
- `pydantic` `2.9.2` → `2.11.4`
- `aiohttp` `3.9.5` → `3.11.18`
- Update `pydantic_core` and other transitive deps to match helium's versions

Keep Python 3.12.12 in Dockerfiles (already newer than helium's 3.11).
Keep Bun 1.3.8 in Dockerfiles (already newer than helium's 1.0.30).

### 1.11 .NET SDK upgrade

Update `AtomiCloud.CyanPrint` (sulfone-helium) NuGet package to 2.1.0 in all `.csproj` files (plugin/dotnet, processor/dotnet, template/dotnet/cyan, resolver/dotnet).

### 1.12 Regenerate lockfiles

Run `bun install` in:

- `cyan/`
- `plugin/typescript/`, `plugin/javascript/`
- `processor/typescript/`, `processor/javascript/`
- `template/typescript/cyan/`, `template/javascript/cyan/`
- `resolver/typescript/`, `resolver/javascript/`

## Acceptance criteria

- `resolver/` directory has all 4 language scaffolds matching plugin structure
- `cyan/src/resolver.ts` follows plugin.ts pattern exactly
- `cyan/index.ts` offers 4 choices including Resolver
- `cyan/src/template.ts` has NO processor/plugin/resolver prompting loops
- `template/cyan.yaml` uses static empty arrays
- `scripts/test.sh` deleted
- `nix/pre-commit.nix` excludes `.*resolver.*`
- `cyan.yaml` description mentions Resolvers
- All SDK versions are `^2.1.0`
- Python deps upgraded: `cyanprintsdk` 2.1.0, `pydantic` 2.11.4, `aiohttp` 3.11.18
- .NET `AtomiCloud.CyanPrint` upgraded to 2.1.0
- All `bun.lockb` files regenerated
