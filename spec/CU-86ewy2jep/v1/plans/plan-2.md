# Plan 2: Build/Push Modernization

**Spec sections**: Part B (all), Part D (publish-related rows)

## Overview

Modernize all generated CI/CD publish scripts to use `cyanprint push --build` instead of manual `docker buildx build` + `cyanprint push`. Add `build:` section to existing artifact `cyan.yaml` files (resolver already done in Plan 1). Update corresponding `publish.yaml` GitHub Actions workflows.

## Steps

### 2.1 Add `build:` section to `plugin/cyan.yaml`

Currently just metadata fields. Append:

```yaml
build:
  registry: ${DOMAIN}/${GITHUB_REPO_REF}
  platforms:
    - linux/amd64
    - linux/arm64
  images:
    plugin:
      image: plugin
      dockerfile: Dockerfile
      context: .
```

### 2.2 Add `build:` section to `processor/cyan.yaml`

Read `processor/cyan.yaml` first (should match plugin structure). Append:

```yaml
build:
  registry: ${DOMAIN}/${GITHUB_REPO_REF}
  platforms:
    - linux/amd64
    - linux/arm64
  images:
    processor:
      image: processor
      dockerfile: Dockerfile
      context: .
```

### 2.3 Add `build:` section to `template/cyan.yaml`

Template has two images (template-script + template-blob). Append:

```yaml
build:
  registry: ${DOMAIN}/${GITHUB_REPO_REF}
  platforms:
    - linux/amd64
    - linux/arm64
  images:
    template:
      image: template-script
      dockerfile: cyan/Dockerfile
      context: ./cyan
    blob:
      image: template-blob
      dockerfile: cyan/blob.Dockerfile
      context: .
```

### 2.4 Rewrite `plugin/common/scripts/publish.sh`

Replace entire file with the new pattern (includes `--message` with latest git commit):

```bash
#!/usr/bin/env bash
set -eou pipefail
[ "${CYAN_TOKEN}" = '' ] && echo "CYAN_TOKEN not set" && exit 1
[ "${IMAGE_VERSION}" = '' ] && echo "IMAGE_VERSION not set" && exit 1
COMMIT_MSG="$(git log -1 --pretty=%B | head -c 256)"
cyanprint push plugin --build "${IMAGE_VERSION}" --token "${CYAN_TOKEN}" --message "${COMMIT_MSG}"
```

### 2.5 Rewrite `processor/common/scripts/publish.sh`

Same pattern as plugin but `cyanprint push processor --build ... --message`.

### 2.6 Rewrite `template/common/scripts/publish.sh`

Same pattern: `cyanprint push template --build "${IMAGE_VERSION}" --token "${CYAN_TOKEN}" --message "${COMMIT_MSG}"`.

Note: The old template publish.sh was more complex (built 2 images separately). The new `cyanprint push --build` reads the `build:` section which defines both images, so the script is now equally simple.

### 2.6b Create `resolver/common/scripts/publish.sh`

Same pattern: `cyanprint push resolver --build "${IMAGE_VERSION}" --token "${CYAN_TOKEN}" --message "${COMMIT_MSG}"`.

### 2.7 Update `plugin/common/.github/workflows/publish.yaml`

The workflow still needs:

- Docker login (via `docker/login-action` or manual `docker login`)
- Docker buildx setup (`docker/setup-buildx-action` + `docker/setup-qemu-action`)
- CyanPrint installation (`./scripts/setup-ubuntu.sh`)

But the env vars change:

- **Keep**: `DOCKER_PASSWORD`, `DOCKER_USER`, `CYAN_TOKEN`, `DOMAIN`, `GITHUB_REPO_REF`
- **Add**: `IMAGE_VERSION` generation (SHA + branch slug)
- **Remove**: `GITHUB_SHA`, `GITHUB_BRANCH` are no longer needed directly in publish.sh (but `IMAGE_VERSION` needs computing in the workflow)

The `DOMAIN` and `GITHUB_REPO_REF` are still needed because `cyanprint push --build` reads them from `cyan.yaml`'s `build:` section which uses `${DOMAIN}/${GITHUB_REPO_REF}` env var syntax.

Update the workflow to:

1. Keep Docker login + buildx/qemu setup
2. Compute `IMAGE_VERSION` from sha + branch slug
3. Pass `DOMAIN`, `GITHUB_REPO_REF`, `DOCKER_PASSWORD`, `DOCKER_USER`, `CYAN_TOKEN`, `IMAGE_VERSION` to publish.sh

### 2.8 Update `processor/common/.github/workflows/publish.yaml`

Same changes as plugin publish.yaml.

### 2.9 Update `template/common/.github/workflows/publish.yaml`

Same changes. Note template also needs `DOMAIN` and `GITHUB_REPO_REF` for env var resolution.

### 2.10 Verify `resolver/common/` (from Plan 1)

Resolver's publish.sh and publish.yaml were already created in Plan 1 with the new pattern. Just verify consistency.

## Acceptance criteria

- All 4 artifact `cyan.yaml` files have `build:` section with correct image names
- All 4 `publish.sh` scripts use the `cyanprint push {artifact} --build ... --message` pattern with git commit message (truncated 256 chars)
- All 4 `publish.yaml` workflows pass required env vars
- `DOMAIN` and `GITHUB_REPO_REF` still available as env vars for `${VAR}` syntax in cyan.yaml
- `IMAGE_VERSION` computed from SHA + branch slug in each workflow
