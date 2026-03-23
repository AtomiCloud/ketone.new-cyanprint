# Task Spec: Migrate CD/CI Docker builds to `cyanprint push --build` / `cyanprint build`

## Ticket

CU-86ex0j5k7 — Fix blob image build context in ketone/new-cyanprint CD pipeline

## Problem

The CD pipeline (`cd.yaml`) and CI pipeline (`ci.yaml`) use a matrix-based approach to build Docker images via `scripts/ci/docker.sh`. The matrix hardcodes `context`, `dockerfile`, and `image_name` for each image, duplicating what `cyan.yaml` already declares. This caused a drift: `cyan.yaml` correctly specifies `context: .` for the blob image, but the matrix had `context: ./cyan`, producing broken blob images.

## Solution

Replace the matrix-based Docker build approach with `cyanprint`'s native `--build` flag, which reads the `build` section from `cyan.yaml` directly. This makes `cyan.yaml` the single source of truth for image build configuration.

- **CD**: Use `cyanprint push --build <version>` — builds all images and pushes to registry + CyanPrint in one command
- **CI**: Use `cyanprint build <version>` — builds all images using Docker buildx (multi-platform builds push to registry, so GHCR login is required)

## Acceptance Criteria

### CD Pipeline (`cd.yaml`)

1. Remove the matrix-based `docker` job entirely
2. Replace with a single job that uses `nix develop .#ci -c cyanprint push --build <version>`
3. The `⚡reusable-cyanprint.yaml` workflow handles the cyanprint push step
4. `scripts/publish.sh` (root) is updated to use `cyanprint push --build` instead of the old manual `cyanprint push template <blob> <ver> <template> <ver>` syntax
5. `scripts/ci/docker.sh` is no longer called from CD
6. Docker setup (buildx, qemu, login) is handled as workflow steps before the cyanprint command

### CI Pipeline (`ci.yaml`)

1. Remove the matrix-based `docker` job
2. Replace with a job that runs `cyanprint build <version>` to validate all Docker images build correctly
3. Docker setup (buildx, qemu, login) is handled as workflow steps before the cyanprint command

### Cleanup

1. `scripts/ci/docker.sh` can remain (it may be used by the template pattern for other repos), but is no longer used by this repo's CI/CD
2. `scripts/publish.sh` (root) is simplified to use the new `cyanprint push --build` command

### Constraints

- `cyan.yaml` already has the correct build configuration — no changes needed to `cyan.yaml`
- The template's cyan.yaml (`template/cyan.yaml`) already generates correct build configs for new projects — no changes needed there
- Must work within the existing Nix shell environment (`nix develop .#ci` provides cyanprint)
- Must maintain the existing tagging strategy: semver tags on CD, commit+branch on CI
- Must maintain registry login via `ghcr.io` with `${{ secrets.GITHUB_TOKEN }}`

### Out of Scope

- Updating snapshot test expected outputs (if cyan.yaml output changes)
- Modifying the `⚡reusable-docker.yaml` workflow (it remains for use by other repos following the old pattern)
- Updating the `template/common/.github/workflows/publish.yaml` or `template/common/scripts/publish.sh` (those already use the new method)

## Context

- The meta-template's own `cyan.yaml` already declares the correct build config: `blob.context: .`, `template.context: ./cyan`
- Templates generated from this meta-template already use `cyanprint push --build` in their publish.sh
- `cyanprint build` reads `cyan.yaml` build section and uses Docker buildx for multi-platform builds
- `cyanprint push --build` combines building + pushing images + registering with CyanPrint
