import { CodePipelineClient, PutJobSuccessResultCommand } from "@aws-sdk/client-codepipeline";

const codepipeline = new CodePipelineClient();

exports.handler = async (event, context) => {
  console.log('Success');
  const response = {
    statusCode: 200,
    body: JSON.stringify('Hello from Node.js 14.x!'),
  };
  // Move the putJobSuccessResult call to the end of the function
  await codepipeline.send(new PutJobSuccessResultCommand({
    jobId: event['CodePipeline.job'].id
  }));
  return response;
};
