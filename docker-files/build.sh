#!/bin/bash
#NOTE: file has to be run from the root of the project
source ./docker-files/image-attributes.sh
docker build -t ${dockerImage}:${imageTag} -f ./Dockerfile .
