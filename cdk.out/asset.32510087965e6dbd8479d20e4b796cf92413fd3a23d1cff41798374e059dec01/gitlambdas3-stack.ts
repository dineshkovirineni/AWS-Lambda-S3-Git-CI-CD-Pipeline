import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { BuildSpec, EventAction, FilterGroup, GitHubSourceCredentials, LinuxBuildImage, Project, Source } from 'aws-cdk-lib/aws-codebuild';
import { Artifact, Pipeline } from 'aws-cdk-lib/aws-codepipeline';
import { CodeBuildAction, GitHubSourceAction, GitHubTrigger, S3DeployAction, LambdaInvokeAction } from 'aws-cdk-lib/aws-codepipeline-actions';
import { SecretValue } from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';

export class Gitlambdas3Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);


    const myBucket = s3.Bucket.fromBucketName(this, "MyExistingBucket", 'lambda-git-react' );

   





    new GitHubSourceCredentials(this, 'code-build-credentials-github', {
      accessToken: cdk.SecretValue.secretsManager('gitlambda',{jsonField:'gitdinesh'})
  })
  
  const source = Source.gitHub({
    owner: 'dineshkovirineni1602',
    repo: 'gitlambdas3cloud',
    webhook: true,
    webhookFilters: [
        FilterGroup.inEventOf(EventAction.PUSH).andBranchIs('main')
    ]
})





const getBuildSpec=()=> {
  return BuildSpec.fromObject({
      version: '0.2',
      env: {
          shell: 'bash'
      },
      phases: {
          pre_build: {
              commands: [
                'cd BOALandingPage',
                  
                  'rm -rf node_modules',
                  'rm package-lock.json',

                  'npm install',
                  
              ],
          },
          build: {
              commands: [
                  
                  'npm run build',
                  'zip -r ./build.zip .'
              ],
          },
          post_build: {
              commands: [
                  'echo Build completed on `date`',
                  
              ]
          }
      },
      artifacts: {
          ['base-directory']: 'BOALandingPage',
          files: ['build.zip']
      },
      cache: {
          paths: ['node_modules/**/*']
      }
  })
}
const buildSpec = getBuildSpec();
const project = new Project(this, 'project-lambda', {
  projectName: 'pipeline-project-lambda',
  source,
  environment: {
      buildImage: LinuxBuildImage.STANDARD_5_0,
      privileged: true,
  },
  buildSpec,  
  
})



const lambdaFunction = new lambda.Function(this, 'MyLambdaFunction', {
  runtime: lambda.Runtime.NODEJS_14_X,
  handler: 'lambda-code.handler',
  code: lambda.Code.fromAsset('/Users/dineshkovirineni/Desktop/cdks3/git-s3-cloud-lambda/gitlambdas3/lib/'),
  role: new iam.Role(this, 'LambdaRole', {
    assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
  }),
});
      const artifacts = {
        source: new Artifact('Source'),
        build: new Artifact('BuildOutput'),
      };

      const pipelineActions = {
        source: new GitHubSourceAction({
          actionName: 'Github-token',
          owner: 'dineshkovirineni1602',
          repo: 'gitlambdas3cloud',
          branch: 'main',
          oauthToken: SecretValue.secretsManager('gitlambda',{jsonField:'gitdinesh'}),
          output: artifacts.source,
          trigger: GitHubTrigger.WEBHOOK,
        }),
        build: new CodeBuildAction({
          actionName: 'CodeBuild-lambda',
          project,
          input: artifacts.source,
          outputs: [artifacts.build],
          environmentVariables: {
            S3_BUCKET: {
              value:myBucket.bucketName,
            },
            S3_KEY: {
              value: 'build.zip',
            },
          },
        }),
        deploy: new S3DeployAction({
          actionName: 'S3Deploy',
          bucket: myBucket,
          input: artifacts.build,
        }),
        lambda:new LambdaInvokeAction({
          actionName: 'Lambda_Invoke',
          lambda: lambdaFunction,
        }),
        
        
      };
      
      const pipeline = new Pipeline(this, 'DeployPipeline-lambda', {
        pipelineName: `lambda-pipeline`,
        stages: [
          { stageName: 'Source', actions: [pipelineActions.source] },
          { stageName: 'Build', actions: [pipelineActions.build] },
          {stageName: 'deploy', actions:[pipelineActions.deploy]},
          {stageName: 'lambda', actions:[pipelineActions.lambda]},
          
        ],
      });

      
      

  }
}

