#!/bin/bash
#NOTE: file has to be run from the root of the project
source ./docker-files/image-attributes.sh
source ./docker-files/build.sh
docker save $dockerImage:$imageTag | docker load
