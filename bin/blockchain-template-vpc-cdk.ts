#!/usr/bin/env node
import 'source-map-support/register';
import cdk = require('@aws-cdk/core');
import { BlockchainTemplateVpcCdkStack } from '../lib/blockchain-template-vpc-cdk-stack';

const app = new cdk.App();
new BlockchainTemplateVpcCdkStack(app, 'BlockchainTemplateVpcCdkStack');
