#!/usr/bin/env bash

sudo apt update -y
sudo apt install software-properties-common -y
sudo apt-add-repository "deb https://apt.fury.io/atomicloud/ /" -y
sudo apt install cyanprint -y
