# Upgrade Skill Reference

Complete reference for all dependency files, Dockerfiles, and upgrade procedures.

---

## SDK-to-Runtime Compatibility

**Important:** Docker runtime versions are constrained by the SDK version. Always check SDK requirements before selecting runtime versions.

### How to Check SDK Runtime Requirements

```bash
# TypeScript/JavaScript - check engines field
npm view @atomicloud/cyan-sdk engines

# Python - check requires_python
curl -s https://pypi.org/pypi/cyanprintsdk/json | jq '.info.requires_python'

# .NET - check TargetFramework (from NuGet package or release notes)
# TargetFramework "net8.0" → use dotnet 8.0 images
# TargetFramework "net9.0" → use dotnet 9.0 images
```

### Compatibility Rules

| SDK                    | Runtime Constraint | How to Determine                                |
| ---------------------- | ------------------ | ----------------------------------------------- |
| `@atomicloud/cyan-sdk` | Bun version        | Check `engines.bun` in package.json or npm view |
| `cyanprintsdk`         | Python version     | Check `requires_python` (e.g., `>=3.10`)        |
| `AtomiCloud.CyanPrint` | .NET version       | Check `TargetFramework` (e.g., `net8.0` → 8.0)  |

### Version Selection Guidelines

1. **Bun**: Use the latest patch version within the major.minor that the SDK supports
2. **Python**: Use the latest patch version of a minor release that satisfies `requires_python`
3. **.NET**: Use the exact major.minor that matches the `TargetFramework`

---

## SDK Dependency Files

### TypeScript/JavaScript (Bun) - 7 files

| File Path                               | Type          | Lock File                            |
| --------------------------------------- | ------------- | ------------------------------------ |
| `cyan/package.json`                     | Meta-template | `cyan/bun.lockb`                     |
| `processor/typescript/package.json`     | Processor     | `processor/typescript/bun.lockb`     |
| `processor/javascript/package.json`     | Processor     | `processor/javascript/bun.lockb`     |
| `plugin/typescript/package.json`        | Plugin        | `plugin/typescript/bun.lockb`        |
| `plugin/javascript/package.json`        | Plugin        | `plugin/javascript/bun.lockb`        |
| `template/typescript/cyan/package.json` | Template      | `template/typescript/cyan/bun.lockb` |
| `template/javascript/cyan/package.json` | Template      | `template/javascript/cyan/bun.lockb` |

**Package name:** `@atomicloud/cyan-sdk`

**Update pattern in package.json:**

```json
"dependencies": {
  "@atomicloud/cyan-sdk": "2.0.0"
}
```

**Regenerate lock file:**

```bash
cd <directory>
bun install
```

### Python (pip) - 3 files

| File Path                               | Type      |
| --------------------------------------- | --------- |
| `processor/python/requirements.txt`     | Processor |
| `plugin/python/requirements.txt`        | Plugin    |
| `template/python/cyan/requirements.txt` | Template  |

**Package name:** `cyanprintsdk`

**Update pattern in requirements.txt:**

```
cyanprintsdk==2.0.0
```

**Note:** Python requirements.txt files also contain transitive dependencies (aiohttp, pydantic, etc.). Only update `cyanprintsdk` unless specifically requested.

### .NET (NuGet) - 3 files

| File Path                              | Type      |
| -------------------------------------- | --------- |
| `processor/dotnet/Processor.csproj`    | Processor |
| `plugin/dotnet/Processor.csproj`       | Plugin    |
| `template/dotnet/cyan/Template.csproj` | Template  |

**Package name:** `AtomiCloud.CyanPrint`

**Update pattern in .csproj:**

```xml
<PackageReference Include="AtomiCloud.CyanPrint" Version="2.0.0" />
```

---

## Dockerfile Base Images

### Bun Runtime - 7 files

| File Path                             | Type          |
| ------------------------------------- | ------------- |
| `cyan/Dockerfile`                     | Meta-template |
| `processor/typescript/Dockerfile`     | Processor     |
| `processor/javascript/Dockerfile`     | Processor     |
| `plugin/typescript/Dockerfile`        | Plugin        |
| `plugin/javascript/Dockerfile`        | Plugin        |
| `template/typescript/cyan/Dockerfile` | Template      |
| `template/javascript/cyan/Dockerfile` | Template      |

**Base image:** `oven/bun`

**Update pattern:**

```dockerfile
FROM oven/bun:1.2.13
```

**Find compatible versions:**

```bash
# First check SDK requirement
npm view @atomicloud/cyan-sdk engines

# Then find matching versions on Docker Hub
# Visit: https://hub.docker.com/r/oven/bun/tags
```

### Python Runtime - 3 files

| File Path                         | Type      |
| --------------------------------- | --------- |
| `processor/python/Dockerfile`     | Processor |
| `plugin/python/Dockerfile`        | Plugin    |
| `template/python/cyan/Dockerfile` | Template  |

**Base image:** `python`

**Update pattern:**

```dockerfile
FROM python:3.12.11
```

**Find compatible versions:**

```bash
# First check SDK requirement
curl -s https://pypi.org/pypi/cyanprintsdk/json | jq '.info.requires_python'

# Then find matching versions on Docker Hub
# Visit: https://hub.docker.com/_/python/tags
# Example: requires_python ">=3.10" → can use 3.10.x, 3.11.x, 3.12.x, etc.
```

### .NET Runtime - 3 files

| File Path                         | Type      |
| --------------------------------- | --------- |
| `processor/dotnet/Dockerfile`     | Processor |
| `plugin/dotnet/Dockerfile`        | Plugin    |
| `template/dotnet/cyan/Dockerfile` | Template  |

**Base images:** `mcr.microsoft.com/dotnet/aspnet` and `mcr.microsoft.com/dotnet/sdk`

**Update pattern (multi-stage build):**

```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
```

**Find compatible versions:**

```bash
# Check SDK's TargetFramework from .csproj or NuGet package info
# TargetFramework "net8.0" → use 8.0 images
# TargetFramework "net9.0" → use 9.0 images

# Keep aspnet and sdk versions aligned (both 8.0, both 9.0, etc.)
```

---

## Version Check Commands

### Check Current SDK Versions

```bash
# TypeScript/JavaScript
grep -h '"@atomicloud/cyan-sdk"' \
  cyan/package.json \
  processor/typescript/package.json \
  processor/javascript/package.json \
  plugin/typescript/package.json \
  plugin/javascript/package.json \
  template/typescript/cyan/package.json \
  template/javascript/cyan/package.json

# Python
grep 'cyanprintsdk==' \
  processor/python/requirements.txt \
  plugin/python/requirements.txt \
  template/python/cyan/requirements.txt

# .NET
grep 'AtomiCloud.CyanPrint' \
  processor/dotnet/Processor.csproj \
  plugin/dotnet/Processor.csproj \
  template/dotnet/cyan/Template.csproj
```

### Check Current Docker Versions

```bash
# All base images
grep -rh "^FROM" --include="Dockerfile" . | sort -u

# Bun version
grep -rh "oven/bun" --include="Dockerfile" . | sort -u

# Python version
grep -rh "^FROM python" --include="Dockerfile" . | sort -u

# .NET versions
grep -rh "dotnet" --include="Dockerfile" . | grep "^FROM" | sort -u
```

### Check Latest SDK Versions

```bash
# npm (TypeScript/JavaScript)
npm view @atomicloud/cyan-sdk version

# PyPI (Python)
curl -s https://pypi.org/pypi/cyanprintsdk/json | jq -r '.info.version'

# NuGet (.NET)
curl -s "https://api.nuget.org/v3-flatcontainer/atomicloud.cyanprint/index.json" | jq -r '.versions[-1]'
```

### Check SDK Runtime Requirements

```bash
# TypeScript/JavaScript - engines field
npm view @atomicloud/cyan-sdk engines

# Python - requires_python
curl -s https://pypi.org/pypi/cyanprintsdk/json | jq '.info.requires_python'

# .NET - check TargetFramework in package or release notes
```

---

## Bulk Update Commands

### TypeScript/JavaScript

Update all bun projects:

```bash
for dir in cyan processor/typescript processor/javascript plugin/typescript plugin/javascript template/typescript/cyan template/javascript/cyan; do
  echo "Updating $dir..."
  (cd "$dir" && bun install)
done
```

### .NET

Restore all .NET projects:

```bash
for dir in processor/dotnet plugin/dotnet template/dotnet/cyan; do
  echo "Restoring $dir..."
  (cd "$dir" && dotnet restore)
done
```

---

## Test Containers

The test suite (`task test`) validates these 12 containers:

| Container        | Path                         | Expected Port |
| ---------------- | ---------------------------- | ------------- |
| template-ts      | `./template/typescript/cyan` | 5550          |
| template-js      | `./template/javascript/cyan` | 5550          |
| template-py      | `./template/python/cyan`     | 5550          |
| template-dotnet  | `./template/dotnet/cyan`     | 5550          |
| processor-ts     | `./processor/typescript`     | 5551          |
| processor-js     | `./processor/javascript`     | 5551          |
| processor-py     | `./processor/python`         | 5551          |
| processor-dotnet | `./processor/dotnet`         | 5551          |
| plugin-ts        | `./plugin/typescript`        | 5552          |
| plugin-js        | `./plugin/javascript`        | 5552          |
| plugin-py        | `./plugin/python`            | 5552          |
| plugin-dotnet    | `./plugin/dotnet`            | 5552          |

---

## Package Registry URLs

### SDK Packages

| Registry | Package Name           | URL                                                 |
| -------- | ---------------------- | --------------------------------------------------- |
| npm      | `@atomicloud/cyan-sdk` | https://www.npmjs.com/package/@atomicloud/cyan-sdk  |
| PyPI     | `cyanprintsdk`         | https://pypi.org/project/cyanprintsdk/              |
| NuGet    | `AtomiCloud.CyanPrint` | https://www.nuget.org/packages/AtomiCloud.CyanPrint |

### Docker Images

| Runtime      | Image                             | URL                                              |
| ------------ | --------------------------------- | ------------------------------------------------ |
| Bun          | `oven/bun`                        | https://hub.docker.com/r/oven/bun                |
| Python       | `python`                          | https://hub.docker.com/_/python                  |
| .NET SDK     | `mcr.microsoft.com/dotnet/sdk`    | https://hub.docker.com/_/microsoft-dotnet-sdk    |
| .NET ASP.NET | `mcr.microsoft.com/dotnet/aspnet` | https://hub.docker.com/_/microsoft-dotnet-aspnet |
