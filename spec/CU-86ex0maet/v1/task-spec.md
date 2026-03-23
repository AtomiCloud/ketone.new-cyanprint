# Task Spec: Fix CyanPrint resolver template bugs [CU-86ex0maet]

## Problem

The template files in the new-cyanprint repo generate `scripts/publish.sh` and `scripts/setup-ubuntu.sh` with several bugs that cause failures when projects are created from these templates.

## Affected Files

The bugs exist identically across all four artifact types:

- `resolver/common/scripts/publish.sh`
- `resolver/common/scripts/setup-ubuntu.sh`
- `plugin/common/scripts/publish.sh`
- `plugin/common/scripts/setup-ubuntu.sh`
- `processor/common/scripts/publish.sh`
- `processor/common/scripts/setup-ubuntu.sh`
- `template/common/scripts/publish.sh`
- `template/common/scripts/setup-ubuntu.sh`

The root-level `scripts/publish.sh` and `scripts/setup-ubuntu.sh` (used by this meta-template itself) also have some of the same bugs but are a separate concern — this spec focuses on the **template files** that get copied to downstream repos.

## Bugs

### Bug 1: Missing env var checks in publish.sh

**Files:** All 4 `publish.sh` files

The CI workflows pass `DOMAIN` and `GITHUB_REPO_REF` as environment variables to `publish.sh`, but the scripts only validate `CYAN_TOKEN` and `IMAGE_VERSION`. If `DOMAIN` or `GITHUB_REPO_REF` are unset/empty, `cyanprint push` fails with an unclear error.

**Fix:** Add exit guards for `DOMAIN` and `GITHUB_REPO_REF` matching the existing pattern:

```bash
[ "${DOMAIN:-}" = '' ] && echo "DOMAIN not set" && exit 1
[ "${GITHUB_REPO_REF:-}" = '' ] && echo "GITHUB_REPO_REF not set" && exit 1
```

### Bug 2: Missing lowercase normalization in publish.sh

**Files:** All 4 `publish.sh` files

`DOMAIN` and `GITHUB_REPO_REF` can arrive with uppercase characters (e.g., `AtomiCloud/ketone.nix-resolver`). Docker rejects uppercase tags. Both need to be normalized to lowercase before use.

**Fix:** Add `tr '[:upper:]' '[:lower:]'` normalization:

```bash
export DOMAIN="$(echo "${DOMAIN}" | tr '[:upper:]' '[:lower:]')"
export GITHUB_REPO_REF="$(echo "${GITHUB_REPO_REF}" | tr '[:upper:]' '[:lower:]')"
```

### Bug 3: IMAGE_VERSION tag too long in publish.sh

**Files:** All 4 `publish.sh` files (via their CI workflows)

The CI workflows set `IMAGE_VERSION` to `${{ github.sha }}-${{ env.GITHUB_REF_SLUG }}`, which includes the full 40-character SHA. Docker tags have a practical length limit and the full SHA is unnecessarily long.

**Fix:** Truncate the SHA portion to 6 characters and the branch slug to 16 characters, then strip trailing special characters (`-`, `_`, `.`). The workflow format is `{40-char-sha}-{branch-slug}`. Do this in `publish.sh` after validation and before use:

```bash
COMMIT_SHA="${IMAGE_VERSION%%-*}"
BRANCH_SLUG="${IMAGE_VERSION#*-}"
BRANCH_SLUG="${BRANCH_SLUG:0:16}"
BRANCH_SLUG=$(echo "${BRANCH_SLUG}" | sed 's/[-_.]*$//')
IMAGE_VERSION="${COMMIT_SHA:0:6}-${BRANCH_SLUG}"
```

### Bug 4: Missing trusted=yes in setup-ubuntu.sh

**Files:** All 4 `setup-ubuntu.sh` files

The `apt-add-repository` line for the Fury apt repo fails without `trusted=yes`:

```
sudo apt-add-repository "deb https://apt.fury.io/atomicloud/ /" -y
```

**Fix:**

```
sudo apt-add-repository "deb [trusted=yes] https://apt.fury.io/atomicloud/ /" -y
```

### Bug 5: Wrong set flags order in publish.sh

**Files:** All 4 `publish.sh` files

All publish.sh files use `set -eou pipefail` which is incorrect. Bash parses this as:

- `-e` = errexit
- `-o u` = nounset (valid)
- `pipefail` = orphaned argument, becomes a **positional parameter** (`$1`) instead of enabling the shell option

So pipefail is **never actually enabled**.

**Fix:** Change to `set -euo pipefail`:

- `-e` = errexit
- `-u` = nounset
- `-o pipefail` = pipefail option

### Bug 6: Missing executable bit on generated scripts

**Files:** All generated `publish.sh` and `setup-ubuntu.sh` files

The scripts are created without the executable bit. This is because the Cyan SDK `GlobType.Copy` copies files as-is, and the template files in the repo may not have `+x`.

**Fix:** Ensure the template files themselves have the executable bit set (`chmod +x`). The Cyan SDK preserves file permissions when copying via `GlobType.Copy`, so setting `+x` on the template source files is sufficient.

## Out of Scope

- Root-level `scripts/publish.sh` and `scripts/setup-ubuntu.sh` (used by this meta-template)
- Changes to CI workflow YAML files
- Changes to `cyan/src/*.ts` source files
