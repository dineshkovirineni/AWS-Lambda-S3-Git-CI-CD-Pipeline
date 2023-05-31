import { expect as expectCDK, haveResource } from '@aws-cdk/assert';
import { App } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';
import { CodePipelineStackBackEnd } from '../lib/gitlambdas3-stack';
import { Template } from "@aws-cdk/assertions-alpha";

describe("CodePipelineStackBackEnd", () => {

  // Test to ensure the snapshot is created correctly
  test("snapshot after refactor new", () => {
    const stack = new cdk.Stack();

    // Define environment variables for the stack
    

    // Create an instance of the stack with the specified environment variables
    const gitlambdas3Stack = new CodePipelineStackBackEnd(stack, "usernew",)

    // Create a snapshot of the stack and compare to a previous snapshot to ensure no changes have been made
    const templatenew = Template.fromStack(gitlambdas3Stack);
    expect(templatenew).toMatchSnapshot();
});

  }); 
