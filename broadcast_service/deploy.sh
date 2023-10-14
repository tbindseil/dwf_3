#!/bin/bash

IP_ADDRESS="3.235.90.59"

set -e

echo "script start"

echo "building:"
# npm run tsc

echo "testing:"
# npm run test

echo "linting:"
# npm run lint

echo "packaging:"
# npm pack

echo "beaming artifacts to the cloud:"
scp -i "ec2-key-pair.pem" ./dwf_backend-1.0.0.tgz ec2-user@$IP_ADDRESS:/home/ec2-user

# echo "sshing into box:"
# ssh -i "ec2-key-pair.pem" ec2-user@$IP_ADDRESS 'pwd;ls;'

# so, this is kinda weird,
# once we ssh into the ec2 instance, the script ends

# so, I think I'd like to delegate
# installing node to the cdk via a user data script
# but, when i added a script that is going to fail for sure, the deployment succeeded,
# so, lets see if I destroy and recreate if that will run and blow up
#
# I think I am suspecting that the scripts are only run when the resource doesn't already exist
# but, I could've verified this by examinging the contents of the file where "it works" is echoed to

# so, the failure script doesn't cause failure, and rerunning deployment does not lead to the "it works" text being modified

# so, I'm just gonna install node once manually, then we will need to figure that out when containerizing this
# followed https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/setting-up-node-on-ec2-instance.html to do so

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

# echo "ending ssh session"
# exit

echo "script end"
