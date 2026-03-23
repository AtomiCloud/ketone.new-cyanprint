# Plan 1: Fix publish.sh across all artifact types

Fix bugs 1-3 and 5 in all four `publish.sh` template files: resolver, plugin, processor, template.

## Changes

For each file (`resolver/common/scripts/publish.sh`, `plugin/common/scripts/publish.sh`, `processor/common/scripts/publish.sh`, `template/common/scripts/publish.sh`):

1. Fix `set -eou pipefail` → `set -euo pipefail` (Bug 5)
2. Add `DOMAIN` and `GITHUB_REPO_REF` env var checks (with `:-` default for safety) (Bug 1)
3. Add lowercase normalization for `DOMAIN` and `GITHUB_REPO_REF` (Bug 2)
4. Truncate SHA portion of `IMAGE_VERSION` to 6 chars, branch slug to 16 chars, strip trailing special chars: `${COMMIT_SHA:0:6}-${BRANCH_SLUG}` (Bug 3)
5. Set executable bit (`chmod +x`) (Bug 6)

Each file has a different `cyanprint push` argument (`resolver`/`plugin`/`processor`/`template`) — keep those differences.

## File list

- `resolver/common/scripts/publish.sh`
- `plugin/common/scripts/publish.sh`
- `processor/common/scripts/publish.sh`
- `template/common/scripts/publish.sh`
