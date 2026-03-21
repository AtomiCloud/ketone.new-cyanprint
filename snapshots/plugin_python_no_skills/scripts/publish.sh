#!/usr/bin/env bash
set -eou pipefail
[ "${CYAN_TOKEN:-}" = '' ] && echo "CYAN_TOKEN not set" && exit 1
[ "${IMAGE_VERSION:-}" = '' ] && echo "IMAGE_VERSION not set" && exit 1
COMMIT_MSG="$(git log -1 --pretty=%B | head -c 256)"
cyanprint push --token "${CYAN_TOKEN}" --message "${COMMIT_MSG}" plugin --build "${IMAGE_VERSION}"
