import { Injectable } from '@nestjs/common';

export interface ClassificationRule {
  type: string;
  keywords: string[];
}

@Injectable()
export class NodeClassifier {
  private readonly rules: ClassificationRule[] = [];

  constructor() {
    this.bootstrapRules();
  }

  /**
   * Classifies a node shape style category based on keywords inside its label text.
   */
  classify(label: string): string {
    const lower = label.toLowerCase();
    for (const rule of this.rules) {
      if (rule.keywords.some(keyword => lower.includes(keyword.toLowerCase()))) {
        return rule.type;
      }
    }
    return 'architecture'; // default fallback node style
  }

  private bootstrapRules(): void {
    this.rules.push(
      { 
        type: 'database', 
        keywords: ['database', 'db', 'postgres', 'postgresql', 'mysql', 'sql', 'oracle', 'sqlite', 'mongodb', 'mongo', 'dynamodb', 'redis', 'memcached', 'cache'] 
      },
      { 
        type: 'queue', 
        keywords: ['queue', 'kafka', 'rabbitmq', 'activemq', 'sqs', 'pubsub', 'eventbus', 'broker', 'stream'] 
      },
      { 
        type: 'cloud', 
        keywords: ['cloud', 'aws', 'azure', 'gcp', 's3', 'lambda', 'ec2', 'ecs', 'eks', 'blob', 'serverless', 'container', 'docker', 'kubernetes', 'k8s'] 
      },
      { 
        type: 'gateway', 
        keywords: ['gateway', 'proxy', 'nginx', 'ingress', 'loadbalancer', 'alb', 'elb', 'router', 'dns', 'route53', 'api gateway'] 
      },
      { 
        type: 'api', 
        keywords: ['api', 'endpoint', 'rest', 'graphql', 'grpc', 'controller', 'http', 'https', 'router'] 
      },
      { 
        type: 'storage', 
        keywords: ['storage', 'bucket', 'minio', 'nfs', 'volume', 'drive', 'disk', 's3 bucket'] 
      },
      { 
        type: 'actor', 
        keywords: ['user', 'actor', 'client', 'customer', 'admin', 'operator', 'human', 'visitor', 'subscriber'] 
      }
    );
  }
}
