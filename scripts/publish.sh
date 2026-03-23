#!/usr/bin/env bash
set -eou pipefail
[ "${DOMAIN:-}" = '' ] && echo "DOMAIN not set" && exit 1
[ "${GITHUB_REPO_REF:-}" = '' ] && echo "GITHUB_REPO_REF not set" && exit 1
[ "${DOCKER_PASSWORD:-}" = '' ] && echo "DOCKER_PASSWORD not set" && exit 1
[ "${DOCKER_USER:-}" = '' ] && echo "DOCKER_USER not set" && exit 1
[ "${CYAN_TOKEN:-}" = '' ] && echo "CYAN_TOKEN not set" && exit 1
[ "${IMAGE_VERSION:-}" = '' ] && echo "IMAGE_VERSION not set" && exit 1
GITHUB_REPO_REF="$(echo "${GITHUB_REPO_REF}" | tr '[:upper:]' '[:lower:]')"
export GITHUB_REPO_REF
cyanprint push --token "${CYAN_TOKEN}" template --build "${IMAGE_VERSION}"
