#!/usr/bin/env bash
set -euo pipefail
GITHUB_REPO_REF="$(echo "${GITHUB_REPO_REF}" | tr '[:upper:]' '[:lower:]')"
export GITHUB_REPO_REF
cyanprint --version
cyanprint test template . --parallel 4
