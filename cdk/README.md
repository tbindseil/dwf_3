# Welcome to your CDK TypeScript project!

This is a blank project for TypeScript development with CDK.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template

## Initial Jump from Local to Cloud

Since the service has some exisitng functionality, I will focus on
maintaining that functionality as I transition to the cloud. We will need:

### EC2 instance
This will house the backend service.

### S3 Bucket
This will serve the react app.

### Multiple Envs
We need a test and production. Ideally, we can put both of these on the same EC2 instance and avoid fees.
But, is that even necessary? What are EC2 prices?

### Pipeline
Once we have this setup, I would like a pipeline that:
* runs the unit tests
* deploys to test
* runs the integ tests
* deploys to production

#### Thoughts
Ok, so I need to find a way to get get my backend code running on the cloud.
That way, I can point my local web page to it, and test that way. Then, I
can do some work to get the web page code to deploy to the cloud and test that
part. But, if I deploy the webpage first, I don't know that the live internet
can find my laptop on the internet.

So, what all needs to happen for deployment of the backend?

* run build, test, lint on code at a commit
* take artifacts, copy to ec2 on the cloud
* invoke commands to run new artifacts

So, what are some questions?

1. what are standard formats for node artifacts?
2. running build and test and lint in a script with failure stopping things sounds good
3. scp for copying
4. just invoke npm run when doing (or after) the scp

So maybe, its not quite CI/CD, but just an automated script, and I can run it when I please from anywhere in the code
