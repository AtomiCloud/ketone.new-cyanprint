---
name: upgrade
description: Upgrade all CyanPrint SDK packages and Docker runtime versions across templates, plugins, and processors (TypeScript, JavaScript, Python, .NET), then run tests to validate. Use when upgrading dependencies, updating SDK versions, refreshing packages, updating Docker images, or running /upgrade.
---

# Upgrade CyanPrint Packages and Runtimes

Upgrades CyanPrint SDK dependencies across all 15 dependency files, updates Docker base images in all 13 Dockerfiles to versions compatible with the SDK, then validates by running Docker-based tests for all 12 container variants.

## When to Use

- User asks to upgrade packages or dependencies
- User wants to update to the latest CyanPrint SDK version
- User asks to update Docker images or runtime versions
- User asks to refresh or update package versions
- User runs `/upgrade`

## Prerequisites

- Docker running (for tests)
- Inside nix shell (`nix develop`) or use `direnv exec .`
- Network access to npm, PyPI, NuGet, and Docker Hub

## Instructions

### Step 1: Check Current Versions

**SDK Versions:**

```bash
# Current SDK versions
grep '"@atomicloud/cyan-sdk"' cyan/package.json
grep 'cyanprintsdk==' processor/python/requirements.txt
grep 'AtomiCloud.CyanPrint' processor/dotnet/Processor.csproj
```

**Docker Runtime Versions:**

```bash
# Current runtime versions
grep -h "^FROM" **/Dockerfile | sort -u
```

### Step 2: Determine Target SDK Version and Compatible Runtimes

1. **Check latest SDK version:**

```bash
npm view @atomicloud/cyan-sdk version
curl -s https://pypi.org/pypi/cyanprintsdk/json | jq -r '.info.version'
curl -s "https://api.nuget.org/v3-flatcontainer/atomicloud.cyanprint/index.json" | jq -r '.versions[-1]'
```

2. **Check SDK requirements for runtime compatibility:**
   - Review SDK release notes or package metadata for supported runtime versions
   - npm: `npm view @atomicloud/cyan-sdk engines`
   - PyPI: `curl -s https://pypi.org/pypi/cyanprintsdk/json | jq '.info.requires_python'`
   - NuGet: Check `TargetFramework` in the package

3. **Select Docker runtime versions that match SDK requirements:**
   - Bun version must be compatible with the TypeScript/JavaScript SDK
   - Python version must satisfy `requires_python` from the SDK
   - .NET version must match the SDK's `TargetFramework` (e.g., `net8.0` → use 8.0 images)

### Step 3: Update All Package Files

Update SDK version in all files. See [reference.md](reference.md) for complete file list.

**TypeScript/JavaScript (7 files):** Edit `@atomicloud/cyan-sdk` version in each `package.json`, then run `bun install` in each directory to regenerate lock files.

**Python (3 files):** Edit `cyanprintsdk==<VERSION>` in each `requirements.txt`.

**.NET (3 files):** Edit `<PackageReference Include="AtomiCloud.CyanPrint" Version="<VERSION>" />` in each `.csproj`.

### Step 4: Update Docker Base Images (Bound by SDK)

Update runtime versions in all 13 Dockerfiles to versions **compatible with the SDK**. See [reference.md](reference.md) for complete file list.

**Important:** Docker runtime versions must be compatible with the SDK version being installed. Do not blindly use the latest runtime - use versions that the SDK supports.

**Bun (7 Dockerfiles):** Update `FROM oven/bun:<VERSION>` to a version compatible with `@atomicloud/cyan-sdk`

**Python (3 Dockerfiles):** Update `FROM python:<VERSION>` to satisfy the SDK's `requires_python` constraint

**.NET (3 Dockerfiles):** Update `FROM mcr.microsoft.com/dotnet/sdk:<VERSION>` and `aspnet:<VERSION>` to match the SDK's `TargetFramework`

### Step 5: Run Tests

```bash
direnv exec . task test
```

This builds and tests all 12 Docker containers (4 templates + 4 processors + 4 plugins).

### Step 6: Report Results

Summarize:

- Previous SDK versions → new SDK versions
- Previous runtime versions → new runtime versions (with compatibility note)
- Test results (pass/fail)

## Reference

See [reference.md](reference.md) for:

- Complete list of all 15 dependency files with full paths
- Complete list of all 13 Dockerfiles with full paths
- SDK-to-runtime compatibility guidelines
- Package manager details for each language

## Troubleshooting

| Issue                    | Solution                                                       |
| ------------------------ | -------------------------------------------------------------- |
| Bun install fails        | Ensure nix shell is loaded: `nix develop` or `direnv exec .`   |
| Python version not found | Check PyPI; use format `2.0.0` not `v2.0.0`                    |
| .NET restore fails       | Run `dotnet restore` manually; check NuGet sources             |
| Docker tests fail        | Check if runtime version is compatible with SDK                |
| Lock file conflicts      | Delete `bun.lockb` and re-run `bun install`                    |
| Docker image not found   | Verify image tag exists on Docker Hub                          |
| .NET version mismatch    | Ensure sdk and aspnet versions match the SDK's TargetFramework |
| Runtime incompatibility  | Check SDK release notes for supported runtime versions         |
