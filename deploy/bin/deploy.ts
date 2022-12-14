#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
import { LambdaToDynamoDBProps, LambdaToDynamoDB } from '@aws-solutions-constructs/aws-lambda-dynamodb';
import { StaticSite } from './static-site';
import { CfnInternetGateway, CfnRoute } from 'aws-cdk-lib/aws-ec2';
import { ServicePrincipal } from 'aws-cdk-lib/aws-iam';

class MyStaticSiteStack extends cdk.Stack {
  constructor(parent: cdk.App, name: string, props: cdk.StackProps) {
    super(parent, name, props);

    const site = new StaticSite(this, 'StaticPayperblockFront', {
      domainName: this.node.tryGetContext('domain'),
      siteSubDomain: this.node.tryGetContext('subdomain'),
    });

    const hostedZone = cdk.aws_route53.HostedZone.fromLookup(this, 'HostedZone', {
      domainName: this.node.tryGetContext('domain'),
    });
    const sslCertificate = new cdk.aws_certificatemanager.DnsValidatedCertificate(this, 'ApiPayperblockCertificate', {
      domainName: "api." + this.node.tryGetContext('domain'),
      subjectAlternativeNames: ["*.player." + this.node.tryGetContext('domain')],
      validation: cdk.aws_certificatemanager.CertificateValidation.fromDns(hostedZone),
      hostedZone,
    });

    const api = new apigateway.RestApi(this, 'PayperblockApiGateway', {
      description: 'Payperblock Api Gateway',
      deployOptions: {
        stageName: 'dev',
      },
      // 👇 enable CORS
      defaultCorsPreflightOptions: {
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
        ],
        allowMethods: ['OPTIONS', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        allowCredentials: true,
        allowOrigins: [
          'https://www.' + this.node.tryGetContext('domain'),
          'https://*.player.' + this.node.tryGetContext('domain'),
          'http://localhost:3000',
        ],
      },
      domainName: {
        //domainName: `*.player.${this.node.tryGetContext('domain')}`,
        domainName: `api.${this.node.tryGetContext('domain')}`,
        certificate: sslCertificate,
        endpointType: cdk.aws_apigateway.EndpointType.REGIONAL,
      },
    });
    const player = new apigateway.RestApi(this, 'PayperblockPlayerGateway', {
      description: 'Payperblock Player Gateway',
      deployOptions: {
        stageName: 'dev',
      },
      // 👇 enable CORS
      defaultCorsPreflightOptions: {
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
        ],
        allowMethods: ['OPTIONS', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        allowCredentials: true,
        allowOrigins: [
          'https://www.' + this.node.tryGetContext('domain'),
          'https://*.player.' + this.node.tryGetContext('domain'),
          'http://localhost:3000',
        ],
      },
      domainName: {
        domainName: `*.player.${this.node.tryGetContext('domain')}`,
        certificate: sslCertificate,
        endpointType: cdk.aws_apigateway.EndpointType.REGIONAL,
      },
    });

    // Record for API
    new cdk.aws_route53.ARecord(this, "PayperblockPlayerDns", {
      zone: hostedZone,
      recordName: "*.player",
      target: cdk.aws_route53.RecordTarget.fromAlias(
        new cdk.aws_route53_targets.ApiGateway(player)
      ),
    });
    new cdk.aws_route53.ARecord(this, "PayperblockPlayerApiDns", {
      zone: hostedZone,
      recordName: "api",
      target: cdk.aws_route53.RecordTarget.fromAlias(
        new cdk.aws_route53_targets.ApiGateway(api)
      ),
    });

    // 👇 create an Output for the API URL
    new cdk.CfnOutput(this, 'apiUrl', { value: api.url });
    new cdk.CfnOutput(this, 'playerUrl', { value: player.url });

    const vpc = new cdk.aws_ec2.Vpc(this, 'my-cdk-vpc', {
      cidr: '11.0.0.0/16',
      natGateways: 1,
      maxAzs: 1,
      subnetConfiguration: [
        {
          name: 'private-subnet-1',
          subnetType: cdk.aws_ec2.SubnetType.PRIVATE_WITH_EGRESS,
          cidrMask: 24,
        },
        {
          name: 'public-subnet-1',
          subnetType: cdk.aws_ec2.SubnetType.PUBLIC,
          cidrMask: 24,
        },
      ],
    });

    const lambdaFunction = new lambda.Function(this, 'lambda-function', {
      runtime: lambda.Runtime.NODEJS_16_X,
      // 👇 place lambda in the VPC
      vpc,
      // 👇 place lambda in Private Subnets
      vpcSubnets: {
        subnetType: cdk.aws_ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      memorySize: 1024,
      timeout: cdk.Duration.seconds(120),
      handler: 'lambda.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, './../../api')),
      environment: {
        "HARDHAT_NETWORK": "mumbai",
        "ALCHEMY_APP_API_KEY_GOERLI": "s_7N0dmQWg2x-ZZ3zZsQEzC0aM5F01mI",
        "ALCHEMY_APP_API_KEY_MUMBAI": "O5QqGlDXFYuko1squ-_1tsuxINrqtUa9",
        "PLAYER_API": "https://api.payperblock.xyz",
        "NETWORKS"  : "80001,1337",
      },
      retryAttempts: 0,
      logRetention: 1,
    });

    const constructProps: LambdaToDynamoDBProps = {
      existingLambdaObj: lambdaFunction,
      dynamoTableProps: {
        tableName: 'PayperblockSess',
        partitionKey: { name: 'sessionKey', type: cdk.aws_dynamodb.AttributeType.STRING },
        replicationRegions: ['us-west-1'],
        billingMode: cdk.aws_dynamodb.BillingMode.PAY_PER_REQUEST,
      },
      tableEnvironmentVariableName: 'DDB_TABLE_NAME',
      existingVpc: vpc,
      deployVpc: false
    };
    const deployLambda = new LambdaToDynamoDB(this, 'PayperblockLambdaToDynamo', constructProps);
    /*
    const igw = deployLambda.vpc?.node.findChild('IGW') as CfnInternetGateway;
    new CfnRoute(this, 'IGW', {
        routeTableId: deployLambda.vpc?.privateSubnets.length ? deployLambda.vpc?.privateSubnets[0].routeTable.routeTableId.toString() : '',
        destinationCidrBlock: '0.0.0.0/0',
        gatewayId: igw.ref,
    });*/

    deployLambda.dynamoTable.grantReadData(new cdk.aws_iam.AccountRootPrincipal());
    deployLambda.dynamoTable.grantReadData(deployLambda.lambdaFunction);
    deployLambda.dynamoTable.grant(deployLambda.lambdaFunction, 'dynamodb:Query');

    lambdaFunction.addPermission('PermitAPIGInvocation', {
      principal: new ServicePrincipal('apigateway.amazonaws.com'),
      sourceArn: api.arnForExecuteApi('*')
    });

    const proxyApi = api.root.addProxy({
      defaultIntegration: new cdk.aws_apigateway.LambdaIntegration(deployLambda.lambdaFunction),
      anyMethod: true // "true" is the default // "false" will require explicitly adding methods on the `proxy` resource
    });
    const proxyPlayer = player.root.addProxy({
      defaultIntegration: new cdk.aws_apigateway.LambdaIntegration(deployLambda.lambdaFunction),
      anyMethod: true // "true" is the default // "false" will require explicitly adding methods on the `proxy` resource
    });

    const scheduleFunction = new lambda.Function(this, 'schedule-function', {
      runtime: lambda.Runtime.NODEJS_16_X,
      // 👇 place lambda in the VPC
      vpc,
      // 👇 place lambda in Private Subnets
      vpcSubnets: {
        subnetType: cdk.aws_ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      environment: {
        "HARDHAT_NETWORK": "mumbai",
      },
      memorySize: 1024,
      timeout: cdk.Duration.seconds(30),
      handler: 'tasks.rebill',
      code: lambda.Code.fromAsset(path.join(__dirname, './../../api')),
      retryAttempts: 0,
      logRetention: 1,
    });
    const lambdaTarget = new cdk.aws_events_targets.LambdaFunction(scheduleFunction)
    const eventRule = new cdk.aws_events.Rule(this, 'scheduleRule', {
      schedule: cdk.aws_events.Schedule.cron({ minute: '*', hour: '*' }),
      targets: [lambdaTarget]
    });
  }
}

const app = new cdk.App();

new MyStaticSiteStack(app, 'PayperblockFront', {
  env: {
    account: app.node.tryGetContext('accountId'),
    region: 'us-east-1',
  }
});

app.synth();