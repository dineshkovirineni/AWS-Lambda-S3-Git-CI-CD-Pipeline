import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import {S3Stack} from './s3stack';


export class LambdaStack extends cdk.Stack {
  public lambdafunction;

public lambdaPermissionPolicy;
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id);

// Create a reference to the S3 stack
const s3Stack = new S3Stack(this, 'S3Stack'); 


const myBucket=s3Stack.myBucket;


// Create a new AWS Lambda function using the AWS CDK.
this.lambdafunction = new lambda.Function(this, 'lambdafunctiongitfinal', {
    // Set the Node.js 14.x runtime environment.
    runtime: lambda.Runtime.NODEJS_14_X,
    // Specify the entry point for the Lambda function code.
    handler: 'index.handler',
    // Set the location of the Lambda function code bundle in an S3 bucket.
    code: lambda.Code.fromBucket(myBucket,'build.zip'),
    // Create a new IAM role for the Lambda function to assume.
    role: new iam.Role(this, 'LambdaRole', {
      // Specify that the Lambda function can assume this role.
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      // Define an inline IAM policy for the role granting S3 access.
      inlinePolicies: {
        s3AccessPolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              // Allow all S3 actions.
              actions: ['s3:*'],
              // Specify the ARN of the S3 bucket and all objects within it.
              resources: ['arn:aws:s3:::${s3BucketName}/*'],
            }),
          ],
        }),
      },
    }),
    timeout: cdk.Duration.minutes(3),
  });
  
// Here we are getting the ARN (Amazon Resource Name) of a Lambda function
const lambdaFunctionArn = this.lambdafunction.functionArn;

// Here we are creating a new IAM (Identity and Access Management) policy statement that grants permission to perform certain actions on the Lambda function
this.lambdaPermissionPolicy = new iam.PolicyStatement({
    effect: iam.Effect.ALLOW,
    actions: [
    "lambda:AddPermission",
    "lambda:RemovePermission",
    "lambda:CreateAlias",
    "lambda:UpdateAlias",
    "lambda:DeleteAlias",
    "lambda:UpdateFunctionCode",
    "lambda:UpdateFunctionConfiguration",
    "lambda:PutFunctionConcurrency",
    "lambda:DeleteFunctionConcurrency",
    "lambda:PublishVersion"
    ],
    resources: [lambdaFunctionArn],
    });

    
  }
}
