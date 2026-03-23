# Plan 2: Fix setup-ubuntu.sh across all artifact types

Fix bug 4 (trusted=yes) in all four `setup-ubuntu.sh` template files and set executable bit (bug 5).

## Changes

For each file (`resolver/common/scripts/setup-ubuntu.sh`, `plugin/common/scripts/setup-ubuntu.sh`, `processor/common/scripts/setup-ubuntu.sh`, `template/common/scripts/setup-ubuntu.sh`):

1. Add `[trusted=yes]` to the `apt-add-repository` deb source line
2. Set executable bit (`chmod +x`)

## File list

- `resolver/common/scripts/setup-ubuntu.sh`
- `plugin/common/scripts/setup-ubuntu.sh`
- `processor/common/scripts/setup-ubuntu.sh`
- `template/common/scripts/setup-ubuntu.sh`
