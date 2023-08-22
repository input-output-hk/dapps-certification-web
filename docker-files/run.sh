#!/bin/bash
#NOTE: file has to be run from the root of the project
source ./docker-files/image-attributes.sh
source ./docker-files/build.sh
docker_args="-t --name $dockerImage -p 80:3000"
docker run --rm $docker_args $dockerImage:$imageTag
