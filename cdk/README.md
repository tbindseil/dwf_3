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
