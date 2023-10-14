#!/bin/bash

set -e

echo "script start"

echo "building:"
npm run tsc

echo "testing:"
npm run test

echo "linting:"
npm run lint

echo "packaging:"
npm pack

echo "beaming artifacts to the cloud:"
scp -i "ec2-key-pair.pem" ./dwf_backend-1.0.0.tgz ec2-user@44.215.67.60:/home/ec2-user

# echo "sshing into box:"
# ssh ec2-user@IP_ADDRESS
# 
# echo "checking node:"
# let node_version=$(node -v)
# 
# if node_version not right
#     echo "installing node"
#     install_node()
# fi
# 
# echo "starting node"
# npm run start

echo "script end"
