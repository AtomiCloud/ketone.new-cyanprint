# Plan 1: Migrate CD pipeline to `cyanprint push --build`

## Files Modified

- `.github/workflows/cd.yaml` — rewrite: remove matrix docker job, replace cyanprint job with unified build+push
- `.github/workflows/⚡reusable-cyanprint.yaml` — update: add Docker setup steps, change publish script to use `--build`
- `scripts/publish.sh` — simplify: use `cyanprint push --build` instead of manual image refs

## Changes

### `.github/workflows/cd.yaml`

Remove the `docker` matrix job entirely. The `cyanprint` job now handles everything: Docker setup (buildx, qemu, registry login) + building images + pushing to registry + registering with CyanPrint.

The workflow triggers on tag push (`v*.*.*`) and passes the version to `cyanprint push --build`.

### `.github/workflows/⚡reusable-cyanprint.yaml`

Add Docker setup steps before the cyanprint push step:

- `docker/setup-buildx-action@v3`
- `docker/setup-qemu-action@v3`
- `docker/login-action@v3` with `ghcr.io`

Pass `DOCKER_PASSWORD` and `DOCKER_USER` as env vars so `cyanprint push --build` can authenticate with the registry.

### `scripts/publish.sh`

Replace the manual image ref construction and old `cyanprint push template <blob> <ver> <template> <ver>` syntax with:

```bash
#!/usr/bin/env bash
set -eou pipefail
[ "${CYAN_TOKEN:-}" = '' ] && echo "CYAN_TOKEN not set" && exit 1
[ "${IMAGE_VERSION:-}" = '' ] && echo "IMAGE_VERSION not set" && exit 1
cyanprint push --token "${CYAN_TOKEN}" template --build "${IMAGE_VERSION}"
```

This matches the pattern already used by templates generated from this meta-template.
