import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import * as process from 'process';


export class S3Stack extends cdk.Stack {
  public myBucket;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

// Define a constant variable 'myBucket' that represents an existing Amazon S3 bucket named 'lambda-git-react'
this.myBucket = s3.Bucket.fromBucketName(this, "MyExistingBucket", process.env.S3BUCKETNAME);
  
}
}
