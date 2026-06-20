#!/usr/bin/env bash

sudo apt update -y
sudo apt install software-properties-common -y
sudo apt-add-repository "deb [trusted=yes] https://apt.fury.io/atomicloud/ /" -y
# The Gemfury flat repo ships no Release file, which apt on Ubuntu 24.04+
# rejects by default; allow the unsigned/Release-less repo explicitly.
sudo apt-get update --allow-insecure-repositories -y
sudo apt-get install -y --allow-unauthenticated cyanprint
