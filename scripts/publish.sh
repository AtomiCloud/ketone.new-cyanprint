#!/usr/bin/env bash

# check for necessary env vars
[ "${DOMAIN}" = '' ] && echo "❌ 'DOMAIN' env var not set" && exit 1
[ "${GITHUB_REPO_REF}" = '' ] && echo "❌ 'GITHUB_REPO_REF' env var not set" && exit 1

[ "${CYAN_TOKEN}" = '' ] && echo "❌ 'CYAN_TOKEN' env var not set" && exit 1

IMAGE_VERSION="$1"

[ "${IMAGE_VERSION}" = '' ] && echo "❌ 'IMAGE_VERSION' argument missing" && exit 1

set -eou pipefail

# Obtain image
BLOB_IMAGE_ID="${DOMAIN}/${GITHUB_REPO_REF}/template-blob"
BLOB_IMAGE_ID=$(echo "${BLOB_IMAGE_ID}" | tr '[:upper:]' '[:lower:]') # convert to lower case
# Generate image references
BLOB_COMMIT_IMAGE_REF="${BLOB_IMAGE_ID}:${IMAGE_VERSION}"

TEMPLATE_IMAGE_ID="${DOMAIN}/${GITHUB_REPO_REF}/template-template"
TEMPLATE_IMAGE_ID=$(echo "${TEMPLATE_IMAGE_ID}" | tr '[:upper:]' '[:lower:]') # convert to lower case
# Generate image references
TEMPLATE_COMMIT_IMAGE_REF="${TEMPLATE_IMAGE_ID}:${IMAGE_VERSION}"

# Generate cache references
echo "  ✅ Blob Commit Image Ref: ${BLOB_COMMIT_IMAGE_REF}"
echo "  ✅ Template Commit Image Ref: ${TEMPLATE_COMMIT_IMAGE_REF}"

echo "🔨 Pushing to Cyanprint..."
cyanprint push template "${BLOB_IMAGE_ID}" "${IMAGE_VERSION}" "${TEMPLATE_IMAGE_ID}" "${IMAGE_VERSION}"
echo "✅ Pushed to Cyanprint!"
