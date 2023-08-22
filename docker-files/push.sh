#!/bin/bash
#NOTE: file has to be run from the root of the project
source ./docker-files/image-attributes.sh
source ./docker-files/load.sh

echo "Pushing docker image $dockerImage:$imageTag" >&2
imageName="$dockerImage:$imageTag"
script="docker image tag $imageName $1/$imageName"
echo $script >&2
eval "$script"
script="docker push $1/$imageName"
echo $script >&2
eval "$script"
