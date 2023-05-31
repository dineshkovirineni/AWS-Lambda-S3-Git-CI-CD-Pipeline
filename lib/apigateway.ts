import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { RestApi } from 'aws-cdk-lib/aws-apigateway';

export class ApiStack extends cdk.Stack {
    public PresignedUrlResource;
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);
    
/// Create a new REST API in API Gateway
const myapi = new RestApi(this, 'MyApitest');

// Create a new resource for the "presigned-url" endpoint
this.PresignedUrlResource = myapi.root.addResource('presignedurl');

    
    }    
}

  