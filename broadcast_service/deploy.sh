#!/bin/bash

echo "script start"

echo "building:"
npm run build

echo "testing:"
npm run test

echo "linting:"
npm run lint

echo "beaming artifacts to the cloud:"
scp -r ./artifacts ec2-user@IP_ADDRESS/where/to/put/artifacts

echo "sshing into box:"
ssh ec2-user@IP_ADDRESS

echo "checking node:"
let node_version=$(node -v)

if node_version not right
    echo "installing node"
    install_node()
fi

echo "starting node"
npm run start

echo "script end"
