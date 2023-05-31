#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CodePipelineStackBackEnd } from '../lib/gitlambdas3-stack';
const app = new cdk.App();
new CodePipelineStackBackEnd(app, 'CodePipelineStackBackEnd');

