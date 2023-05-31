export const handler = async (event) => {
  var AWS = require('aws-sdk');
    var codepipeline = new AWS.CodePipeline();
    var jobId = event['CodePipeline.job'].id;
    codepipeline.putJobSuccessResult({ jobId });
    context.succeed('Hello world!');
  const response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!'),
    };
    return response;
};