# Plan 2: Migrate CI Docker build to `cyanprint build`

## Files Modified

- `.github/workflows/ci.yaml` — replace matrix docker job with `cyanprint build`

## Changes

### `.github/workflows/ci.yaml`

Remove the matrix-based `docker` job (lines 34-55). Replace with a new job that:

1. Runs on `ubuntu-22.04` (or nscloud runner if Docker is available there)
2. Sets up Docker (buildx, qemu, login) via GitHub Actions
3. Installs cyanprint via nix develop
4. Runs `cyanprint build <version>` to validate all images build correctly without pushing

The `needs: test` dependency is preserved — Docker builds only run after tests pass.

## Notes

- `cyanprint build` reads the `build` section from `cyan.yaml`, so no image configuration is needed in the workflow
- The version for CI is a commit SHA + branch slug (same pattern as current `docker.sh`)
- Registry login is still needed because `cyanprint build` pushes to the registry as part of the build process (buildx multi-platform requires push)
