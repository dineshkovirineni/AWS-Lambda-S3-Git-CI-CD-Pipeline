import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { BuildSpec, EventAction, FilterGroup, GitHubSourceCredentials, LinuxBuildImage, Project, Source } from 'aws-cdk-lib/aws-codebuild';
import { Artifact, Pipeline } from 'aws-cdk-lib/aws-codepipeline';
import { CodeBuildAction, GitHubSourceAction, GitHubTrigger, S3DeployAction, LambdaInvokeAction, S3DeployActionProps, } from 'aws-cdk-lib/aws-codepipeline-actions';
import {SecretValue,  } from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { LambdaIntegration } from 'aws-cdk-lib/aws-apigateway';
import {S3Stack} from './s3stack';
import { LambdaStack } from './lambdastack';
import { ApiStack } from './apigateway';

export class CodePipelineStackBackEnd extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
  
    // Replace the placeholders with environment variables
    const gitHubOwner = process.env.GITHUB_OWNER; 
    const gitHubRepo = process.env.GITHUB_REPO;
    const gitHubTokenSecretName = process.env.GITHUB_TOKEN_SECRET_NAME;


// Create a reference to the S3 stack
const s3Stack = new S3Stack(this, 'S3Stack'); 
//Store the myBucket in a variable
const myBucket=s3Stack.myBucket;

// Define GitHub credentials to access the repository
new GitHubSourceCredentials(this, 'code-build-credentials-github-lambda-', {
  accessToken: cdk.SecretValue.secretsManager(gitHubTokenSecretName,{jsonField:'gitbackend'})
});

// Define the source code for the deployment pipeline using the 'gitHub' method, which connects to a GitHub repository
const source = Source.gitHub({
  owner: gitHubOwner,
  repo: gitHubRepo,
  webhook: true,  // Enable the creation of a webhook to trigger the pipeline on code changes
  webhookFilters: [
      FilterGroup.inEventOf(EventAction.PUSH).andBranchIs('main') // Set up the webhook to trigger only on 'push' events to the 'main' branch
  ]
});






// Define a function called getBuildSpec
const getBuildSpec = () => {

  // Create an object using the BuildSpec.fromObject method
  // The object defines the version, environment variables, phases, artifacts, and cache for the build
  return BuildSpec.fromObject({
    version: '0.2',
    env: {
      // Define environment variables for the build
      variables: {
        functionName: lambdafunction.functionName, // set functionName variable to the value of lambdafunction.functionName
        restApiId: null, // set restApiId variable to null
        parentResourceId: null, // set parentResourceId variable to null
        resourcePathPart: "myapi", // set resourcePathPart variable to "myapi"
        httpMethod: "GET" // set httpMethod variable to "GET"
      },
      shell: 'bash' // Use bash shell for the build
    },
    phases: {
      // Define pre_build, build, and post_build phases for the build
      pre_build: {
        commands: [
          'cd BOALandingPage', // Change directory to BOALandingPage
          'rm -rf node_modules', // Remove the node_modules folder
          'rm package-lock.json', // Remove the package-lock.json file
          'npm install', // Install npm packages
        ],
      },
      build: {
        commands: [
          'npm run build', // Run the npm build script
          'cp index.js build', // Copy index.js to the build folder
          'cd build', // Change directory to the build folder
          'zip -r ./build.zip .', // Create a zip file of the build folder
          'aws lambda update-function-code --function-name ${functionName} --zip-file fileb://build.zip', // Update the AWS Lambda function code using the build.zip file
        ],
      },
      post_build: {
        commands: [
          'echo Build completed on `date`', // Display a message that the build completed with the current date and time
        ]
      }
    },
    artifacts: {
      // Define artifacts to be created during the build
      'base-directory': 'BOALandingPage/build', // Set the base directory for artifacts to BOALandingPage/build
      files: ['build.zip'] // Create a zip file called build.zip
    },
    cache: {
      // Define the paths for caching dependencies during the build
      paths: ['node_modules/**/*'] // Cache all files under the node_modules directory
    },
  })
}

// Create a reference to the Lambda stack
const lambdaStack = new LambdaStack(this, 'lambdstack'); 


const lambdafunction=lambdaStack.lambdafunction;

// Here we are getting the build specification
const buildSpec = getBuildSpec();


// Here we are creating a new IAM (Identity and Access Management) policy statement that grants permission to perform certain actions on the Lambda function
const lambdaPermissionPolicy =lambdaStack.lambdaPermissionPolicy;

// Here we are creating a new IAM role for the CodeBuild project
const projectRole = new iam.Role(this, 'CodeBuildRole', {
assumedBy: new iam.ServicePrincipal('codebuild.amazonaws.com'),
});

// Here we are adding the Lambda permission policy to the CodeBuild role
projectRole.addToPolicy(lambdaPermissionPolicy);





// Creating a new AWS CDK project
const project = new Project(this, 'project-lambda', {

  // Setting the project name
  projectName: 'pipeline-project-lambda-s3',

  // Defining the source code for the project
  source,

  // Setting up the project's environment
  environment: {

      // Setting the build image for the project
      buildImage: LinuxBuildImage.STANDARD_5_0,

      // Setting the project to run in privileged mode
      privileged: true,
  },

  // Defining the build specifications for the project
  buildSpec,  

  // Setting the role for the project
  role:projectRole,
});




// Create a reference to the Lambda stack
const api_= new ApiStack(this, 'apigateway'); 


const presignedUrlResource=api_.PresignedUrlResource;


// Add a GET method to the "presigned-url" resource that integrates with a Lambda function
presignedUrlResource.addMethod('GET', new LambdaIntegration(lambdafunction));

// Add a POST method to the "presigned-url" resource that integrates with a Lambda function
presignedUrlResource.addMethod('POST', new LambdaIntegration(lambdafunction));

// artifacts for the Source and BuildOutput
const artifacts = {
        source: new Artifact('Source'),
        build: new Artifact('BuildOutput'),
      };
      
     // Define pipeline actions
const pipelineActions = {
  // Retrieve source code from GitHub
  source: new GitHubSourceAction({
    actionName: 'Github-token-lambda-',
    owner: gitHubOwner,
    repo: gitHubRepo,
    branch: 'main',
    oauthToken: SecretValue.secretsManager(gitHubTokenSecretName,{jsonField:'gitbackend'}), // Authenticate with GitHub using OAuth token stored in AWS Secrets Manager
    output: artifacts.source, // Store source code in pipeline artifact called 'source'
    trigger: GitHubTrigger.WEBHOOK, // Use GitHub webhook to automatically trigger pipeline on changes to source code
    runOrder:1,
  }),

  // Build source code using AWS CodeBuild
  build: new CodeBuildAction({
    actionName: 'CodeBuild-lambda',
    project, // AWS CodeBuild project to use
    input: artifacts.source, // Use source code stored in 'source' artifact
    outputs: [artifacts.build], // Store built code in pipeline artifact called 'build'
    runOrder:2,
  }),

  // Deploy built code to an S3 bucket
  deploy: new S3DeployAction({
    actionName: 'S3Deploy1',
    bucket: myBucket, // S3 bucket to deploy code to
    input: artifacts.build, // Use built code stored in 'build' artifact
    runOrder:3,
  } ),

  // Invoke AWS Lambda function with deployed code
  lambda: new LambdaInvokeAction({
    actionName: 'Lambda_Invoke',
    lambda: lambdafunction, // AWS Lambda function to invoke
    inputs: [artifacts.build], // Use built code stored in 'build' artifact
    runOrder:4,
  }),
};

// Create AWS CodePipeline
const pipeline = new Pipeline(this, 'DeployPipeline-lambda-pipeline', {
  pipelineName: 'lambda-pipeline-git',
  stages: [
    { stageName: 'Source', actions: [pipelineActions.source] }, // Retrieve source code from GitHub
    { stageName: 'Build', actions: [pipelineActions.build] }, // Build source code using AWS CodeBuild
    { stageName: 'deploy', actions:[pipelineActions.deploy] }, // Deploy built code to S3 bucket
    { stageName: 'lambda', actions:[pipelineActions.lambda] }, // Invoke AWS Lambda function with deployed code
  ],
});

      

      
      

  }
}

