import { S3, Lambda } from 'aws-sdk';
import * as fs from 'fs';

const s3 = new S3();
const lambda = new Lambda();
const bucketName = 'lambda-git-react';
const keyName = 'build.zip';
const filePath = './build.zip';
const functionName = 'Gitlambdas3Stack-MyLambdaFunction67CCA873-cLPL3F4uNAKG';

// Download the file from S3
const downloadParams: S3.GetObjectRequest = {
  Bucket: bucketName,
  Key: keyName,
};

const readStream = s3.getObject(downloadParams).createReadStream();

// Write the file to disk
const writeStream = fs.createWriteStream(filePath);
readStream.pipe(writeStream);

writeStream.on('error', (err) => {
  console.log(`Error writing file to disk: ${err}`);
});

writeStream.on('close', async () => {
  console.log('File downloaded successfully.');

  // Update the Lambda function code with the downloaded file
  const updateParams: Lambda.Types.UpdateFunctionCodeRequest = {
    FunctionName: functionName,
    ZipFile: fs.readFileSync(filePath),
  };

  try {
    const result = await lambda.updateFunctionCode(updateParams).promise();
    console.log(`Lambda function updated successfully: ${result.FunctionArn}`);
  } catch (err) {
    console.log(`Error updating Lambda function: ${err}`);
  }
});
