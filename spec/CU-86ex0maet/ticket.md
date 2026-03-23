# Ticket: CU-86ex0maet

- **Type**: Task
- **Status**: backlog
- **URL**: https://app.clickup.com/t/86ex0maet
- **Parent**: none

## Description

Bugs found in the CyanPrint resolver template (new-cyanprint repo)

scripts/publish.sh

Missing required env var checks — DOMAIN and GITHUB_REPO_REF need exit guards (like existing CYAN_TOKEN and IMAGE_VERSION checks). The template only validates CYAN_TOKEN and IMAGE_VERSION.
Missing lowercase normalization — DOMAIN and GITHUB_REPO_REF can arrive with uppercase (e.g. AtomiCloud/ketone.nix-resolver). Docker rejects uppercase tags, so both need to be piped through tr '[:upper:]' '[:lower:]' before export.
export DOMAIN="$(echo "${DOMAIN}" | tr '[:upper:]' '[:lower:]')"
export GITHUB_REPO_REF="$(echo "${GITHUB_REPO_REF}" | tr '[:upper:]' '[:lower:]')"
IMAGE_VERSION tag too long — Full 40-char commit SHA is used as the Docker tag. Should be truncated to 6 characters:
IMAGE_VERSION="${IMAGE_VERSION:0:6}"

scripts/setup-ubuntu.sh

Missing trusted=yes — The apt-add-repository line for the Fury apt repo fails without trusted=yes:
sudo apt-add-repository "deb [trusted=yes] https://apt.fury.io/atomicloud/ /" -y

Both scripts

Missing executable bit — Generated shell scripts (publish.sh, setup-ubuntu.sh) are not created with chmod +x. They need the executable bit set.

Source

Discovered while setting up the ketone.nix-resolver repo from the template.

## Comments

(none)
