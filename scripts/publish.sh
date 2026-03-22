#!/usr/bin/env bash
set -eou pipefail
[ "${CYAN_TOKEN:-}" = '' ] && echo "CYAN_TOKEN not set" && exit 1
[ "${IMAGE_VERSION:-}" = '' ] && echo "IMAGE_VERSION not set" && exit 1
cyanprint push --token "${CYAN_TOKEN}" template --build "${IMAGE_VERSION}"
