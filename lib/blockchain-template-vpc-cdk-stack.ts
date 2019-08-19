import cdk = require('@aws-cdk/core');
import ec2 = require('@aws-cdk/aws-ec2');
import iam = require('@aws-cdk/aws-iam');
import { ServicePrincipal } from '@aws-cdk/aws-iam';
import { defaultCoreCipherList } from 'constants';

export class BlockchainTemplateVpcCdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'BlockchainTemplateVpc', {
      cidr: "10.0.0.0/16"
    });

    const albSg = new ec2.SecurityGroup(this, 'BlockchainTemplateAlbSg', {
      vpc: vpc,
      securityGroupName: 'BlockchainTemplateAlbSg'
    });
    albSg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80));
    albSg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(8080));
    albSg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(8545));

    const ec2Sg = new ec2.SecurityGroup(this, 'BlockchainTemplateEc2Sg', {
      vpc: vpc,
      securityGroupName: 'BlockchainTemplateEc2Sg'
    });
    ec2Sg.connections.allowFrom(albSg, ec2.Port.allTcp());

    const ecsRole = new iam.Role(this, 'BlockchainTemplateEcsRole', {
      assumedBy: new ServicePrincipal('ecs.amazonaws.com'),
      roleName: 'BlockchainTemplateEcsRole'
    });

    ecsRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonEC2ContainerServiceRole'));

    const ec2Role = new iam.Role(this, 'BlockchainTemplateEc2Role', {
      assumedBy: new ServicePrincipal('ec2.amazonaws.com'),
      roleName: 'BlockchainTemplateEc2Role'
    });

    const ec2PolicyStatement = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW
    });
    ec2PolicyStatement.addActions(
      'ecs:CreateCluster',
      'ecs:DeregisterContainerInstance',
      'ecs:DiscoverPollEndpoint',
      'ecs:Poll',
      'ecs:RegisterContainerInstance',
      'ecs:StartTelemetrySession',
      'ecs:Submit*',
      'ecr:GetAuthorizationToken',
      'ecr:BatchCheckLayerAvailability',
      'ecr:GetDownloadUrlForLayer',
      'ecr:BatchGetImage',
      'logs:CreateLogStream',
      'logs:PutLogEvents',
      'dynamodb:BatchGetItem',
      'dynamodb:BatchWriteItem',
      'dynamodb:PutItem',
      'dynamodb:DeleteItem',
      'dynamodb:GetItem',
      'dynamodb:Scan',
      'dynamodb:Query',
      'dynamodb:UpdateItem'
    );
    ec2PolicyStatement.addAllResources();

    const ec2Policy = new iam.Policy(this, 'BlockchainTemplateEc2Policy', {
      policyName: 'BlockchainTemplateEc2Policy',
      statements: [ec2PolicyStatement],
      roles: [ec2Role]
    });

    const ec2InstanceProfile = new iam.CfnInstanceProfile(this, 'BlockchainTemplateEc2InstanceProfile', {
      roles: [ec2Role.roleName]
    });

    new cdk.CfnOutput(this, 'BlockchainTemplateECSRoleOutput', {
      description: 'ECS IAM Role ARN',
      value: ecsRole.roleArn
    });
    new cdk.CfnOutput(this, 'BlockchainTemplateIPOutput', {
      description: 'Instance profile ARN',
      value: ec2InstanceProfile.attrArn
    });
  }
}
