#!/usr/bin/env bash
set -euo pipefail
GITHUB_REPO_REF="$(echo "${GITHUB_REPO_REF}" | tr '[:upper:]' '[:lower:]')"
export GITHUB_REPO_REF
PARALLELISM=$(($(nproc --all) * 4 > 16 ? 16 : $(nproc --all) * 4))
cyanprint --version
cyanprint test template . --parallel "$PARALLELISM"
