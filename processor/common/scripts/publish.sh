#!/usr/bin/env bash

# check for necessary env vars
[ "${DOMAIN}" = '' ] && echo "❌ 'DOMAIN' env var not set" && exit 1
[ "${GITHUB_REPO_REF}" = '' ] && echo "❌ 'GITHUB_REPO_REF' env var not set" && exit 1
[ "${GITHUB_SHA}" = '' ] && echo "❌ 'GITHUB_SHA' env var not set" && exit 1
[ "${GITHUB_BRANCH}" = '' ] && echo "❌ 'GITHUB_BRANCH' env var not set" && exit 1

[ "${DOCKER_PASSWORD}" = '' ] && echo "❌ 'DOCKER_PASSWORD' env var not set" && exit 1
[ "${DOCKER_USER}" = '' ] && echo "❌ 'DOCKER_USER' env var not set" && exit 1
[ "${CYAN_TOKEN}" = '' ] && echo "❌ 'CYAN_TOKEN' env var not set" && exit 1

set -eou pipefail

onExit() {
  rc="$?"
  if [ "$rc" = '0' ]; then
    echo "✅ Successfully built and run images"
  else
    echo "❌ Failed to run Docker image"
  fi
}

trap onExit EXIT

# Login to GitHub Registry
echo "🔐 Logging into docker registry..."
echo "${DOCKER_PASSWORD}" | docker login "${DOMAIN}" -u "${DOCKER_USER}" --password-stdin
echo "✅ Successfully logged into docker registry!"

echo "📝 Generating Image tags..."

# obtaining the version
SHA="$(echo "${GITHUB_SHA}" | head -c 6)"
BRANCH="${GITHUB_BRANCH//[._-]*$//}"
IMAGE_VERSION="${SHA}-${BRANCH}"

PROCESSOR_IMAGE_ID="${DOMAIN}/${GITHUB_REPO_REF}/processor"
PROCESSOR_IMAGE_ID=$(echo "${PROCESSOR_IMAGE_ID}" | tr '[:upper:]' '[:lower:]') # convert to lower case
# Generate image references
PROCESSOR_COMMIT_IMAGE_REF="${PROCESSOR_IMAGE_ID}:${IMAGE_VERSION}"

# Generate cache references
echo "  ✅ Processor Commit Image Ref: ${PROCESSOR_COMMIT_IMAGE_REF}"

echo "🔨 Building processor Dockerfile..."
# build blob image
docker buildx build \
  "." \
  -f "Dockerfile" \
  --platform="linux/arm64,linux/amd64" \
  --push \
  -t "${PROCESSOR_COMMIT_IMAGE_REF}"
echo "✅ Pushed processor image!"

echo "🔨 Pushing to Cyanprint..."
cyanprint push processor "${PROCESSOR_IMAGE_ID}" "${IMAGE_VERSION}"
echo "✅ Pushed to Cyanprint!"
