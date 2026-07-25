export interface ToolConfig {
  id: string;
  name: string;
  category: 'Architecture' | 'Database' | 'UML' | 'Flow' | 'Cloud' | 'API & Backend' | 'Project Documentation' | 'AI & ML';
  icon: string;
  description: string;
  supportedInputs: string[];
  supportedOutputs: string[];
  sampleData: string;
  parserType: 'architecture' | 'er' | 'uml' | 'flowchart' | 'mindmap' | 'cloud';
  isPopular?: boolean;
  isRecent?: boolean;
  level?: 'Beginner' | 'Advanced';
}

export interface CategoryConfig {
  id: string;
  name: string;
  icon: string;
  description: string;
  toolCount: number;
}

export const categoriesConfig: CategoryConfig[] = [
  {
    id: 'software-architecture',
    name: 'Software Architecture',
    icon: '🏗',
    description: 'Generate architecture, deployment, component, cloud and infrastructure diagrams.',
    toolCount: 9
  },
  {
    id: 'database-engineering',
    name: 'Database Engineering',
    icon: '🗄',
    description: 'Generate ER diagrams, schema visualizations and database relationship diagrams.',
    toolCount: 9
  },
  {
    id: 'uml',
    name: 'UML Diagrams',
    icon: '📦',
    description: 'Generate Class, Sequence, Activity, State and Use Case diagrams.',
    toolCount: 8
  },
  {
    id: 'flow-process',
    name: 'Flow & Process',
    icon: '🔄',
    description: 'Create Flowcharts, BPMN, DFD and workflow diagrams.',
    toolCount: 7
  },
  {
    id: 'cloud-devops',
    name: 'Cloud & DevOps',
    icon: '☁',
    description: 'Visualize AWS, Azure, Kubernetes, Docker and Terraform architectures.',
    toolCount: 8
  },
  {
    id: 'api-backend',
    name: 'API & Backend',
    icon: '🔌',
    description: 'Generate OpenAPI visualizations, API flows and backend communication diagrams.',
    toolCount: 8
  },
  {
    id: 'project-documentation',
    name: 'Project Documentation',
    icon: '📄',
    description: 'Convert README, Markdown and technical documentation into professional diagrams.',
    toolCount: 8
  },
  {
    id: 'ai-machine-learning',
    name: 'AI & Machine Learning',
    icon: '🤖',
    description: 'Visualize ML pipelines, RAG workflows, LLM systems and AI agents.',
    toolCount: 8
  }
];

export const toolsConfig: ToolConfig[] = [
  // 1. SOFTWARE ARCHITECTURE (9 tools)
  {
    id: 'architecture-diagram',
    name: 'Architecture Diagram',
    category: 'Architecture',
    icon: 'Network',
    description: 'Design software system architecture, component dependencies, and microservice relationships visually.',
    supportedInputs: ['README', 'Markdown', 'Docker', 'Terraform', 'YAML'],
    supportedOutputs: ['PNG', 'SVG', 'PDF', 'JSON'],
    parserType: 'architecture',
    isPopular: true,
    level: 'Beginner',
    sampleData: `[Client] -> [API Gateway]\n[API Gateway] -> [Auth Service]\n[API Gateway] -> [User Service]\n[User Service] -> [Database]\n[API Gateway] -> [Queue Broker]`
  },
  {
    id: 'component-diagram',
    name: 'Component Diagram',
    category: 'Architecture',
    icon: 'Cpu',
    description: 'Deconstruct structural components of your application and their interface mappings.',
    supportedInputs: ['README', 'Markdown', 'JSON'],
    supportedOutputs: ['PNG', 'SVG', 'PDF'],
    parserType: 'architecture',
    level: 'Advanced',
    sampleData: `[Frontend App] -> [REST API Interface]\n[REST API Interface] -> [Core Logic component]\n[Core Logic component] -> [Data Repository]`
  },
  {
    id: 'deployment-diagram',
    name: 'Deployment Diagram',
    category: 'Architecture',
    icon: 'Server',
    description: 'Map physical software deployments, node clusters, and network configurations.',
    supportedInputs: ['YAML', 'Terraform', 'README'],
    supportedOutputs: ['PNG', 'SVG', 'PDF'],
    parserType: 'architecture',
    level: 'Advanced',
    sampleData: `[Edge Gateway] -> [EKS cluster Node A]\n[Edge Gateway] -> [EKS cluster Node B]\n[EKS cluster Node A] -> [Database RDS Replica]`
  },
  {
    id: 'microservices-architecture',
    name: 'Microservices Architecture',
    category: 'Architecture',
    icon: 'Layers',
    description: 'Map out distributed microservices, tracing requests, event brokers, and communication lines.',
    supportedInputs: ['Docker', 'YAML', 'Markdown'],
    supportedOutputs: ['PNG', 'SVG', 'PDF', 'JSON'],
    parserType: 'architecture',
    isPopular: true,
    level: 'Advanced',
    sampleData: `[API Gateway] -> [Auth service]\n[API Gateway] -> [Billing service]\n[API Gateway] -> [Shipping service]\n[Billing service] -> [Kafka Message Broker]\n[Shipping service] -> [Kafka Message Broker]`
  },
  {
    id: 'system-design-diagram',
    name: 'System Design Diagram',
    category: 'Architecture',
    icon: 'Network',
    description: 'Draft high-level system components, cache nodes, CDNs, and database layers.',
    supportedInputs: ['README', 'Markdown', 'TXT'],
    supportedOutputs: ['PNG', 'SVG', 'PDF', 'JSON'],
    parserType: 'architecture',
    isRecent: true,
    level: 'Beginner',
    sampleData: `[User Client] -> [Cloudflare CDN]\n[User Client] -> [Application Server]\n[Application Server] -> [Redis Cache]\n[Application Server] -> [Postgres Cluster]`
  },
  {
    id: 'infrastructure-diagram',
    name: 'Infrastructure Diagram',
    category: 'Architecture',
    icon: 'Database',
    description: 'Map on-premise hardware, routers, firewalls, and subnetwork segments.',
    supportedInputs: ['Terraform', 'YAML', 'JSON'],
    supportedOutputs: ['PNG', 'SVG', 'PDF'],
    parserType: 'architecture',
    level: 'Advanced',
    sampleData: `[External Network] -> [Palo Alto Firewall]\n[Palo Alto Firewall] -> [DMZ Segment subnet]\n[DMZ Segment subnet] -> [Internal DB server]`
  },
  {
    id: 'network-architecture',
    name: 'Network Architecture',
    category: 'Architecture',
    icon: 'Network',
    description: 'Detail topologies, server racks, active switches, and IP boundary routing.',
    supportedInputs: ['Terraform', 'YAML', 'TXT'],
    supportedOutputs: ['PNG', 'SVG', 'PDF'],
    parserType: 'architecture',
    level: 'Advanced',
    sampleData: `[VPC public subnet] -> [NAT Gateway]\n[NAT Gateway] -> [VPC private subnet]\n[VPC private subnet] -> [Private DB Instance]`
  },
  {
    id: 'event-driven-architecture',
    name: 'Event Driven Architecture',
    category: 'Architecture',
    icon: 'Share2',
    description: 'Map publishers, subscribers, event stream logs, and serverless brokers.',
    supportedInputs: ['README', 'Markdown', 'YAML'],
    supportedOutputs: ['PNG', 'SVG', 'PDF', 'JSON'],
    parserType: 'architecture',
    isRecent: true,
    level: 'Advanced',
    sampleData: `[Order Service] -> [SNS Publisher Topic]\n[SNS Publisher Topic] -> [SQS Dispatcher Queue]\n[SQS Dispatcher Queue] -> [Inventory Worker service]\n[SNS Publisher Topic] -> [SQS Invoice Queue]`
  },
  {
    id: 'monolithic-deconstruction',
    name: 'Monolith Deconstruction Map',
    category: 'Architecture',
    icon: 'Layers',
    description: 'Identify decoupling paths in monolithic layers to aid system migrations.',
    supportedInputs: ['README', 'Markdown'],
    supportedOutputs: ['PNG', 'SVG', 'PDF'],
    parserType: 'architecture',
    level: 'Advanced',
    sampleData: `[Shared DB Domain] -> [Core Billing module]\n[Shared DB Domain] -> [User Profile module]\n[Core Billing module] -> [Payment Processor]\n[User Profile module] -> [Mailer utility]`
  },

  // 2. DATABASE ENGINEERING (9 tools)
  {
    id: 'er-diagram',
    name: 'ER Diagram',
    category: 'Database',
    icon: 'Database',
    description: 'Generate Entity Relationship diagrams from schema definitions, SQL scripts, or Prisma schemas.',
    supportedInputs: ['SQL', 'Prisma', 'TXT', 'JSON'],
    supportedOutputs: ['PNG', 'SVG', 'PDF', 'Mermaid', 'JSON'],
    parserType: 'er',
    isPopular: true,
    level: 'Beginner',
    sampleData: `Table Users {\n  id int [pk]\n  name varchar\n  email varchar [unique]\n}\n\nTable Orders {\n  id int [pk]\n  userId int [ref: > Users.id]\n  total decimal\n}`
  },
  {
    id: 'schema-visualization',
    name: 'Schema Visualization',
    category: 'Database',
    icon: 'Eye',
    description: 'Convert plain SQL tables definitions into interactive structural node maps.',
    supportedInputs: ['SQL', 'TXT'],
    supportedOutputs: ['PNG', 'SVG', 'PDF', 'JSON'],
    parserType: 'er',
    level: 'Beginner',
    sampleData: `Table Accounts {\n  id int [pk]\n  balance decimal\n  owner varchar\n}\n\nTable Transactions {\n  id int [pk]\n  accountId int [ref: > Accounts.id]\n  amount decimal\n}`
  },
  {
    id: 'db-relationship',
    name: 'Database Relationship Map',
    category: 'Database',
    icon: 'Share2',
    description: 'Detail primary keys, foreign keys, and structural table constraint mappings.',
    supportedInputs: ['SQL', 'Prisma', 'YAML'],
    supportedOutputs: ['PNG', 'SVG', 'PDF', 'JSON'],
    parserType: 'er',
    level: 'Advanced',
    sampleData: `Table Roles {\n  id int [pk]\n  name varchar\n}\n\nTable AdminUsers {\n  id int [pk]\n  roleId int [ref: > Roles.id]\n  username varchar\n}`
  },
  {
    id: 'sql-ddl-parser',
    name: 'SQL DDL Analyzer',
    category: 'Database',
    icon: 'FileCode2',
    description: 'Parse raw DDL commands to chart database keys and table indexes.',
    supportedInputs: ['SQL'],
    supportedOutputs: ['PNG', 'SVG', 'PDF'],
    parserType: 'er',
    isRecent: true,
    level: 'Advanced',
    sampleData: `Table Products {\n  sku varchar [pk]\n  price decimal\n  stock int\n}\n\nTable Reviews {\n  id int [pk]\n  productSku varchar [ref: > Products.sku]\n  rating int\n}`
  },
  {
    id: 'prisma-schema-visualizer',
    name: 'Prisma Relation Viewer',
    category: 'Database',
    icon: 'Database',
    description: 'Transform Prisma relational models into interactive database maps.',
    supportedInputs: ['Prisma', 'TXT'],
    supportedOutputs: ['PNG', 'SVG', 'PDF', 'JSON'],
    parserType: 'er',
    isPopular: true,
    level: 'Beginner',
    sampleData: `Table Profile {\n  id int [pk]\n  bio varchar\n  userId int [ref: > User.id]\n}\n\nTable User {\n  id int [pk]\n  email varchar\n}`
  },
  {
    id: 'nosql-document-mapper',
    name: 'NoSQL Schema Mapper',
    category: 'Database',
    icon: 'Database',
    description: 'Visualize MongoDB document collections, nested schemas, and indexes.',
    supportedInputs: ['JSON', 'TXT'],
    supportedOutputs: ['PNG', 'SVG', 'PDF'],
    parserType: 'er',
    level: 'Advanced',
    sampleData: `Table Customers {\n  id int [pk]\n  name varchar\n  metadata_json varchar\n}\n\nTable Logs {\n  id int [pk]\n  customerId int [ref: > Customers.id]\n  action varchar\n}`
  },
  {
    id: 'postgres-schema-visualizer',
    name: 'Postgres Schema Visualizer',
    category: 'Database',
    icon: 'Database',
    description: 'Generate Entity layouts targeted at PostgreSQL table properties.',
    supportedInputs: ['SQL', 'TXT'],
    supportedOutputs: ['PNG', 'SVG', 'PDF', 'JSON'],
    parserType: 'er',
    level: 'Beginner',
    sampleData: `Table pg_users {\n  usr_id int [pk]\n  usr_name varchar\n}\n\nTable pg_sessions {\n  sid int [pk]\n  usr_id int [ref: > pg_users.usr_id]\n  expires_at timestamp\n}`
  },
  {
    id: 'mysql-schema-visualizer',
    name: 'MySQL Schema Visualizer',
    category: 'Database',
    icon: 'Database',
    description: 'Inspect MySQL schemas, tracing references, indexing, and storage engines.',
    supportedInputs: ['SQL', 'TXT'],
    supportedOutputs: ['PNG', 'SVG', 'PDF'],
    parserType: 'er',
    level: 'Beginner',
    sampleData: `Table my_categories {\n  cat_id int [pk]\n  cat_title varchar\n}\n\nTable my_items {\n  item_id int [pk]\n  cat_id int [ref: > my_categories.cat_id]\n  item_name varchar\n}`
  },
  {
    id: 'supabase-db-schema',
    name: 'Supabase DB Schema',
    category: 'Database',
    icon: 'Layers',
    description: 'Map Supabase Postgres public schemas, auth metadata, and profiles.',
    supportedInputs: ['SQL', 'Prisma', 'TXT'],
    supportedOutputs: ['PNG', 'SVG', 'PDF', 'JSON'],
    parserType: 'er',
    isRecent: true,
    level: 'Beginner',
    sampleData: `Table auth_users {\n  id int [pk]\n  email varchar\n}\n\nTable public_profiles {\n  id int [pk]\n  authId int [ref: > auth_users.id]\n  display_name varchar\n}`
  },

  // 3. UML DIAGRAMS (8 tools)
  {
    id: 'uml-class',
    name: 'UML Class Diagram',
    category: 'UML',
    icon: 'FileCode2',
    description: 'Create object-oriented structures showing system classes, attributes, methods, and inheritances.',
    supportedInputs: ['Java', 'Python', 'Markdown', 'TXT'],
    supportedOutputs: ['PNG', 'SVG', 'PDF', 'PlantUML', 'JSON'],
    parserType: 'uml',
    isPopular: true,
    level: 'Advanced',
    sampleData: `class Animal {\n  +name: string\n  +makeSound(): void\n}\n\nclass Dog extends Animal {\n  +bark(): void\n}`
  },
  {
    id: 'uml-sequence',
    name: 'UML Sequence Diagram',
    category: 'UML',
    icon: 'ArrowRight',
    description: 'Model message sequences, client-server timings, and system request-response lifelines.',
    supportedInputs: ['README', 'Markdown', 'TXT'],
    supportedOutputs: ['PNG', 'SVG', 'PDF', 'Mermaid'],
    parserType: 'uml',
    isPopular: true,
    level: 'Beginner',
    sampleData: `class Client {\n  +sendRequest(): void\n}\n\nclass Server {\n  +processRequest(): void\n}\n\nClient -> Server : HTTP Request\nServer -> Client : HTTP Response`
  },
  {
    id: 'uml-usecase',
    name: 'UML Use Case Diagram',
    category: 'UML',
    icon: 'User',
    description: 'Chart system boundaries, external actors, and transactional use cases.',
    supportedInputs: ['README', 'Markdown', 'TXT'],
    supportedOutputs: ['PNG', 'SVG', 'PDF'],
    parserType: 'uml',
    level: 'Beginner',
    sampleData: `class UserActor {\n  +triggerPayment(): void\n}\n\nclass StripeGateway {\n  +processCharge(): void\n}\n\nUserActor -> StripeGateway : charge_customer()`
  },
  {
    id: 'uml-activity',
    name: 'UML Activity Diagram',
    category: 'UML',
    icon: 'Cpu',
    description: 'Represent dynamic workflows, decision logic branches, and system operations sequence.',
    supportedInputs: ['README', 'Markdown', 'TXT'],
    supportedOutputs: ['PNG', 'SVG', 'PDF'],
    parserType: 'uml',
    level: 'Beginner',
    sampleData: `class StepInitialize {\n  +execute(): void\n}\n\nclass StepProcess {\n  +execute(): void\n}\n\nStepInitialize -> StepProcess : run_data_mapping()`
  },
  {
    id: 'uml-state',
    name: 'UML State Machine',
    category: 'UML',
    icon: 'RefreshCcw',
    description: 'Visualize state transitions, actions, events, and lifecycle stages.',
    supportedInputs: ['README', 'Markdown', 'TXT'],
    supportedOutputs: ['PNG', 'SVG', 'PDF'],
    parserType: 'uml',
    isRecent: true,
    level: 'Advanced',
    sampleData: `class StateIdle {\n  +onActive(): void\n}\n\nclass StateActive {\n  +onFinish(): void\n}\n\nStateIdle -> StateActive : transition_event()`
  },
  {
    id: 'uml-component',
    name: 'UML Component Diagram',
    category: 'UML',
    icon: 'Layers',
    description: 'Map logical components, files, and physical modular libraries.',
    supportedInputs: ['README', 'JSON', 'TXT'],
    supportedOutputs: ['PNG', 'SVG', 'PDF'],
    parserType: 'uml',
    level: 'Advanced',
    sampleData: `class CoreEngine {\n  +runParser(): void\n}\n\nclass RenderCanvas {\n  +mountNodes(): void\n}\n\nCoreEngine -> RenderCanvas : draw_flow()`
  },
  {
    id: 'uml-deployment',
    name: 'UML Deployment Diagram',
    category: 'UML',
    icon: 'Server',
    description: 'Detail hardware nodes, system middleware execution runtimes, and artifacts.',
    supportedInputs: ['YAML', 'TXT'],
    supportedOutputs: ['PNG', 'SVG', 'PDF'],
    parserType: 'uml',
    level: 'Advanced',
    sampleData: `class DockerHost {\n  +launchContainer(): void\n}\n\nclass DbCluster {\n  +writeReplica(): void\n}\n\nDockerHost -> DbCluster : persist_records()`
  },
  {
    id: 'uml-object',
    name: 'UML Object Diagram',
    category: 'UML',
    icon: 'Layers',
    description: 'Show static snapshots of system object instances and values at a given time.',
    supportedInputs: ['JSON', 'TXT'],
    supportedOutputs: ['PNG', 'SVG', 'PDF'],
    parserType: 'uml',
    isRecent: true,
    level: 'Advanced',
    sampleData: `class InstanceUser {\n  +id: 101\n  +email: "admin@corp.internal"\n}\n\nclass InstanceProfile {\n  +userId: 101\n  +theme: "dark"\n}\n\nInstanceUser -> InstanceProfile : owns`
  },

  // 4. FLOW & PROCESS (7 tools)
  {
    id: 'flowchart',
    name: 'Flowchart',
    category: 'Flow',
    icon: 'GitFork',
    description: 'Build process logic, decision matrices, algorithm steps, and conditional workflow charts.',
    supportedInputs: ['README', 'Markdown', 'TXT', 'JSON'],
    supportedOutputs: ['PNG', 'SVG', 'PDF', 'Mermaid', 'JSON'],
    parserType: 'flowchart',
    isPopular: true,
    level: 'Beginner',
    sampleData: `Start -> Process: Receive Webhook Request\nProcess -> Choice: Is Signature Valid?\nChoice -> [Yes] -> Step1: Extract Event Payload\nChoice -> [No] -> Error: Respond 401 Unauthorized\nStep1 -> End: Respond 200 OK`
  },
  {
    id: 'bpmn-workflow',
    name: 'BPMN Workflow',
    category: 'Flow',
    icon: 'RefreshCcw',
    description: 'Create business processes modeling notations, tasks, gateways, and sub-process loops.',
    supportedInputs: ['README', 'Markdown', 'TXT'],
    supportedOutputs: ['PNG', 'SVG', 'PDF'],
    parserType: 'flowchart',
    level: 'Advanced',
    sampleData: `InitiateOrder -> ApproveGateway: Review order value\nApproveGateway -> [Approve] -> ExecuteBilling: Process Payment\nApproveGateway -> [Reject] -> NotifyRejection: Mail Reject Notice\nExecuteBilling -> OrderDispatch: Ship Goods`
  },
  {
    id: 'dfd-diagram',
    name: 'Data Flow Diagram - DFD',
    category: 'Flow',
    icon: 'Share2',
    description: 'Map how data flows through a software system, external entities, processes, and database stores.',
    supportedInputs: ['README', 'Markdown', 'TXT'],
    supportedOutputs: ['PNG', 'SVG', 'PDF'],
    parserType: 'flowchart',
    isRecent: true,
    level: 'Advanced',
    sampleData: `ClientInput -> ValidatorProcess: Raw User Data\nValidatorProcess -> DBStore: Encrypted Data\nDBStore -> AnalyticsEngine: Read Table records`
  },
  {
    id: 'process-map',
    name: 'Process Map',
    category: 'Flow',
    icon: 'GitBranch',
    description: 'Create sequential maps detailing timeline steps and operational pathways.',
    supportedInputs: ['README', 'Markdown', 'TXT'],
    supportedOutputs: ['PNG', 'SVG', 'PDF'],
    parserType: 'flowchart',
    level: 'Beginner',
    sampleData: `StepA: Project Kickoff -> StepB: Gather Requirements\nStepB -> StepC: Interface Design\nStepC -> StepD: Code Implementation`
  },
  {
    id: 'decision-tree',
    name: 'Decision Tree',
    category: 'Flow',
    icon: 'GitFork',
    description: 'Graph conditional decisions, split branches, leaf values, and node classifications.',
    supportedInputs: ['README', 'Markdown', 'TXT'],
    supportedOutputs: ['PNG', 'SVG', 'PDF', 'JSON'],
    parserType: 'flowchart',
    isPopular: true,
    level: 'Beginner',
    sampleData: `RootQuestion: Is user logged in? -> [No] -> RedirectToLogin: Show Page\nRootQuestion -> [Yes] -> CheckRole: Is Admin?\nCheckRole -> [Yes] -> ShowDashboard: Render Admin controls\nCheckRole -> [No] -> ShowUserHome: Render regular dashboard`
  },
  {
    id: 'swimlane-flow',
    name: 'Swimlane Flowchart',
    category: 'Flow',
    icon: 'Layers',
    description: 'Align flowchart processes horizontally or vertically based on departments/actors.',
    supportedInputs: ['README', 'Markdown', 'TXT'],
    supportedOutputs: ['PNG', 'SVG', 'PDF'],
    parserType: 'flowchart',
    level: 'Advanced',
    sampleData: `SalesDept: Draft Contract -> LegalDept: Review Clauses\nLegalDept -> ExecutiveDept: Approve Signature\nExecutiveDept -> SalesDept: Archive Signed Contract`
  },
  {
    id: 'state-transition-flow',
    name: 'State Transition Flow',
    category: 'Flow',
    icon: 'RefreshCcw',
    description: 'Trace transitions, triggers, and state changes for stateful integrations.',
    supportedInputs: ['README', 'Markdown', 'TXT'],
    supportedOutputs: ['PNG', 'SVG', 'PDF', 'JSON'],
    parserType: 'flowchart',
    isRecent: true,
    level: 'Advanced',
    sampleData: `StatePending -> StateProcessing: Trigger run_pipeline\nStateProcessing -> StateSuccess: On process complete\nStateProcessing -> StateFailed: On runtime exception`
  },

  // 5. CLOUD & DEVOPS (8 tools)
  {
    id: 'aws-architecture',
    name: 'AWS Cloud Architecture',
    category: 'Cloud',
    icon: 'Cloud',
    description: 'Map AWS infrastructures, VPCs, EC2 instances, ECS node tasks, S3, RDS, and API gateways.',
    supportedInputs: ['Terraform', 'Docker', 'YAML', 'Markdown'],
    supportedOutputs: ['PNG', 'SVG', 'PDF', 'JSON'],
    parserType: 'cloud',
    isPopular: true,
    level: 'Advanced',
    sampleData: `[Route53 Gateway] -> [ALB LoadBalancer]\n[ALB LoadBalancer] -> [EKS ECS Container]\n[EKS ECS Container] -> [Aurora RDS database]\n[EKS ECS Container] -> [S3 File Bucket]`
  },
  {
    id: 'azure-architecture',
    name: 'Azure Cloud Architecture',
    category: 'Cloud',
    icon: 'Cloud',
    description: 'Visualize Microsoft Azure resources, VM scales, function apps, and Azure SQL databases.',
    supportedInputs: ['Terraform', 'YAML', 'TXT'],
    supportedOutputs: ['PNG', 'SVG', 'PDF'],
    parserType: 'cloud',
    level: 'Advanced',
    sampleData: `[Azure FrontDoor] -> [App Service Plans]\n[App Service Plans] -> [Cosmos DB Account]\n[App Service Plans] -> [Blob Storage container]`
  },
  {
    id: 'kubernetes-topology',
    name: 'Kubernetes Pod Topology',
    category: 'Cloud',
    icon: 'Layers',
    description: 'Layout pods, replica sets, node services, ingress routing, and config maps.',
    supportedInputs: ['YAML', 'README'],
    supportedOutputs: ['PNG', 'SVG', 'PDF', 'JSON'],
    parserType: 'cloud',
    isPopular: true,
    level: 'Advanced',
    sampleData: `[Nginx Ingress] -> [Frontend Service cluster]\n[Frontend Service cluster] -> [Backend Pod container]\n[Backend Pod container] -> [PostgreSQL StatefulSet]`
  },
  {
    id: 'docker-compose-visualizer',
    name: 'Docker Compose Mapper',
    category: 'Cloud',
    icon: 'Cpu',
    description: 'Deconstruct yml compose files into connected containers, networks, and storage volume mounts.',
    supportedInputs: ['Docker', 'YAML', 'TXT'],
    supportedOutputs: ['PNG', 'SVG', 'PDF'],
    parserType: 'cloud',
    level: 'Beginner',
    sampleData: `[ReverseProxy proxy] -> [App NodeJS Server]\n[App NodeJS Server] -> [Redis Cache memory]\n[App NodeJS Server] -> [Postgres DB volume]`
  },
  {
    id: 'terraform-infra',
    name: 'Terraform Infrastructure Map',
    category: 'Cloud',
    icon: 'FileCode2',
    description: 'Graph resources, providers, output dependencies, and VPC variables.',
    supportedInputs: ['Terraform', 'TXT'],
    supportedOutputs: ['PNG', 'SVG', 'PDF', 'JSON'],
    parserType: 'cloud',
    isRecent: true,
    level: 'Advanced',
    sampleData: `[aws_vpc default] -> [aws_subnet private_a]\n[aws_vpc default] -> [aws_subnet public_b]\n[aws_subnet public_b] -> [aws_internet_gateway router]`
  },
  {
    id: 'gcp-architecture',
    name: 'GCP Cloud Architecture',
    category: 'Cloud',
    icon: 'Cloud',
    description: 'Visualize Google Cloud resources, Cloud Run clusters, BigQuery, and PubSub flows.',
    supportedInputs: ['Terraform', 'YAML', 'TXT'],
    supportedOutputs: ['PNG', 'SVG', 'PDF'],
    parserType: 'cloud',
    level: 'Advanced',
    sampleData: `[GCP Load Balancer] -> [Cloud Run Service]\n[Cloud Run Service] -> [Cloud SQL Database]\n[Cloud Run Service] -> [Cloud PubSub Topic]`
  },
  {
    id: 'helm-chart-dependency',
    name: 'Helm Chart Dependency Flow',
    category: 'Cloud',
    icon: 'Layers',
    description: 'Map out Helm chart releases, subcharts, templates, and value mappings.',
    supportedInputs: ['YAML', 'TXT'],
    supportedOutputs: ['PNG', 'SVG', 'PDF'],
    parserType: 'cloud',
    isRecent: true,
    level: 'Advanced',
    sampleData: `[Umbrella Main Chart] -> [App Subchart]\n[Umbrella Main Chart] -> [Database Dependency chart]\n[App Subchart] -> [Config Map template]`
  },
  {
    id: 'ci-cd-pipeline',
    name: 'CI/CD Pipeline Flow',
    category: 'Cloud',
    icon: 'GitBranch',
    description: 'Visualize testing suites, compilation steps, containerizing, and staging deployment pipelines.',
    supportedInputs: ['YAML', 'README', 'TXT'],
    supportedOutputs: ['PNG', 'SVG', 'PDF', 'JSON'],
    parserType: 'cloud',
    level: 'Beginner',
    sampleData: `[Git Commit Trigger] -> [Linter Test Stage]\n[Linter Test Stage] -> [Vite Compile Stage]\n[Vite Compile Stage] -> [Docker Build Tag Stage]\n[Docker Build Tag Stage] -> [Kubernetes Rollout Stage]`
  },

  // 6. API & BACKEND (8 tools)
  {
    id: 'openapi-visualizer',
    name: 'OpenAPI Visualizer',
    category: 'API & Backend',
    icon: 'Network',
    description: 'Inspect OpenAPI/Swagger JSON specifications, routes, request models, and endpoints.',
    supportedInputs: ['OpenAPI', 'YAML', 'JSON'],
    supportedOutputs: ['PNG', 'SVG', 'PDF', 'JSON'],
    parserType: 'architecture',
    isPopular: true,
    level: 'Beginner',
    sampleData: `[/api/v1/auth/login POST] -> [Validation Schema]\n[/api/v1/auth/login POST] -> [User Auth Service]\n[User Auth Service] -> [Redis Token storage]`
  },
  {
    id: 'graphql-schema',
    name: 'GraphQL Schema Mapper',
    category: 'API & Backend',
    icon: 'Share2',
    description: 'Map GraphQL query pathways, mutations, resolvers, types, and database mappings.',
    supportedInputs: ['TXT', 'JSON', 'Markdown'],
    supportedOutputs: ['PNG', 'SVG', 'PDF'],
    parserType: 'architecture',
    level: 'Advanced',
    sampleData: `[Query: getUser] -> [User Resolver]\n[User Resolver] -> [UserProfile Type]\n[UserProfile Type] -> [UserDatabase Store]\n[Mutation: updateEmail] -> [Email Resolver]`
  },
  {
    id: 'grpc-service-map',
    name: 'gRPC Service Topology',
    category: 'API & Backend',
    icon: 'Layers',
    description: 'Detail Protobuf service interfaces, RPC endpoints, and messaging packages.',
    supportedInputs: ['TXT', 'YAML'],
    supportedOutputs: ['PNG', 'SVG', 'PDF'],
    parserType: 'architecture',
    level: 'Advanced',
    sampleData: `[UserService Proto] -> [rpc GetUserByEmail]\n[rpc GetUserByEmail] -> [UserRequest message]\n[rpc GetUserByEmail] -> [UserResponse message]`
  },
  {
    id: 'api-gateway-flow',
    name: 'API Gateway Routing',
    category: 'API & Backend',
    icon: 'Network',
    description: 'Chart load balancers, path routings, rate-limiting handlers, and downstream microservices.',
    supportedInputs: ['README', 'YAML', 'JSON'],
    supportedOutputs: ['PNG', 'SVG', 'PDF', 'JSON'],
    parserType: 'architecture',
    isPopular: true,
    level: 'Beginner',
    sampleData: `[Public Request] -> [API Gateway Router]\n[API Gateway Router] -> [Rate Limiter filter]\n[Rate Limiter filter] -> [/orders Path Routing]\n[/orders Path Routing] -> [Order Process service]`
  },
  {
    id: 'webhook-integration',
    name: 'Webhook Sequence Flow',
    category: 'API & Backend',
    icon: 'Share2',
    description: 'Map external publisher webhooks, endpoint callbacks, and listener microservices.',
    supportedInputs: ['README', 'Markdown', 'TXT'],
    supportedOutputs: ['PNG', 'SVG', 'PDF'],
    parserType: 'architecture',
    isRecent: true,
    level: 'Beginner',
    sampleData: `[Stripe Event Publisher] -> [StripeWebhook endpoint]\n[StripeWebhook endpoint] -> [Signature Validator]\n[Signature Validator] -> [Job Queue dispatcher]\n[Job Queue dispatcher] -> [Database Ledger update]`
  },
  {
    id: 'rest-api-endpoints',
    name: 'REST Endpoints Mapping',
    category: 'API & Backend',
    icon: 'FileCode2',
    description: 'Detail HTTP route controllers, payload models, responses, and middleware pipelines.',
    supportedInputs: ['OpenAPI', 'YAML', 'JSON'],
    supportedOutputs: ['PNG', 'SVG', 'PDF', 'JSON'],
    level: 'Beginner',
    parserType: 'architecture',
    sampleData: `[/users/me GET] -> [JWT Auth middleware]\n[JWT Auth middleware] -> [GetProfile controller]\n[GetProfile controller] -> [Database User table]`
  },
  {
    id: 'oauth-auth-flow',
    name: 'OAuth2 / OIDC Auth Flow',
    category: 'API & Backend',
    icon: 'Shield',
    description: 'Chart redirects, token trades, authorization codes, and authentication exchanges.',
    supportedInputs: ['README', 'Markdown', 'TXT'],
    supportedOutputs: ['PNG', 'SVG', 'PDF', 'JSON'],
    isRecent: true,
    level: 'Advanced',
    parserType: 'architecture',
    sampleData: `[Client Application] -> [Authorization Code redirect]\n[Authorization Code redirect] -> [Auth Server login screen]\n[Auth Server login screen] -> [Client Token Exchange]\n[Client Token Exchange] -> [Auth Token callback]`
  },
  {
    id: 'message-queue-flow',
    name: 'RabbitMQ/Kafka PubSub Flow',
    category: 'API & Backend',
    icon: 'Share2',
    description: 'Visualize topics, exchanges, partitions, consumers, and data persistence streams.',
    supportedInputs: ['Docker', 'YAML', 'TXT'],
    supportedOutputs: ['PNG', 'SVG', 'PDF'],
    level: 'Advanced',
    parserType: 'architecture',
    sampleData: `[Event Dispatcher Server] -> [Kafka Orders Topic]\n[Kafka Orders Topic] -> [Consumer Service A partition]\n[Kafka Orders Topic] -> [Consumer Service B partition]\n[Consumer Service A partition] -> [Warehouse Inventory update]`
  },

  // 7. PROJECT DOCUMENTATION (8 tools)
  {
    id: 'readme-visualizer',
    name: 'README to System Map',
    category: 'Project Documentation',
    icon: 'FileText',
    description: 'Extract system modules, features lists, and structural logic from README markdown files.',
    supportedInputs: ['README', 'Markdown', 'TXT'],
    supportedOutputs: ['PNG', 'SVG', 'PDF', 'JSON'],
    parserType: 'mindmap',
    isPopular: true,
    level: 'Beginner',
    sampleData: `# App Repository Outline\n- Web Client Frontend\n  - Landing components\n  - Monaco editor workspace\n- Server Backend API\n  - Token parser compiler\n  - Layout calculator engine`
  },
  {
    id: 'markdown-outline',
    name: 'Markdown Outline Mindmap',
    category: 'Project Documentation',
    icon: 'Brain',
    description: 'Generate tree-style branching diagrams from bulleted headers and indent lists.',
    supportedInputs: ['README', 'Markdown', 'TXT'],
    supportedOutputs: ['PNG', 'SVG', 'PDF', 'JSON'],
    parserType: 'mindmap',
    level: 'Beginner',
    sampleData: `- Diagram Genie Documentation\n  - Core Modules\n    - Tokenizers\n    - Auto-layouters\n  - Supporting Views\n    - Showcase Examples\n    - Settings pages`
  },
  {
    id: 'tech-doc-flow',
    name: 'Technical Docs Flowchart',
    category: 'Project Documentation',
    icon: 'FileText',
    description: 'Trace logical instructions and setup manuals as connected flowchart stages.',
    supportedInputs: ['README', 'Markdown', 'TXT'],
    supportedOutputs: ['PNG', 'SVG', 'PDF'],
    parserType: 'flowchart',
    level: 'Beginner',
    sampleData: `Start -> Step1: Run npm install\nStep1 -> Step2: Configure .env variables\nStep2 -> Step3: Run npm run dev\nStep3 -> End: Open localhost:5173`
  },
  {
    id: 'wiki-page-tree',
    name: 'Wiki Page Tree Structure',
    category: 'Project Documentation',
    icon: 'Layers',
    description: 'Model nested namespaces, pages indexes, and technical documentation maps.',
    supportedInputs: ['Markdown', 'TXT'],
    supportedOutputs: ['PNG', 'SVG', 'PDF'],
    parserType: 'mindmap',
    isRecent: true,
    level: 'Beginner',
    sampleData: `- Wiki Main Category\n  - Deployment instructions\n    - Production docker-compose\n    - Staging setup config\n  - Code conventions\n    - Formatting rules`
  },
  {
    id: 'changelog-timeline',
    name: 'Changelog Timeline',
    category: 'Project Documentation',
    icon: 'FileText',
    description: 'Trace project releases, versions updates, and features timelines.',
    supportedInputs: ['README', 'Markdown', 'TXT'],
    supportedOutputs: ['PNG', 'SVG', 'PDF'],
    parserType: 'mindmap',
    level: 'Beginner',
    sampleData: `- Release History v1.0.0\n  - Beta pre-release v0.9.0\n    - Sandbox canvas integration\n  - Release launch v1.0.0\n    - Collapsible sidebars\n    - Watch AI build animations`
  },
  {
    id: 'feature-hierarchy',
    name: 'Feature Hierarchy Map',
    category: 'Project Documentation',
    icon: 'Layers',
    description: 'Model application capabilities, tracing components and structural layers.',
    supportedInputs: ['README', 'Markdown', 'TXT'],
    supportedOutputs: ['PNG', 'SVG', 'PDF', 'JSON'],
    isPopular: true,
    level: 'Beginner',
    parserType: 'mindmap',
    sampleData: `- Product Capabilities\n  - Diagram engines\n    - Sequence timeline\n    - Entity ER diagram\n  - Customizations\n    - Double-click inline edits\n    - Column additions`
  },
  {
    id: 'onboarding-flow',
    name: 'Developer Onboarding Steps',
    category: 'Project Documentation',
    icon: 'FileText',
    description: 'Trace local repository configurations and pipeline runs for new developers.',
    supportedInputs: ['README', 'Markdown', 'TXT'],
    supportedOutputs: ['PNG', 'SVG', 'PDF'],
    isRecent: true,
    level: 'Beginner',
    parserType: 'flowchart',
    sampleData: `JoinTeam -> Step1: Clone Repo\nStep1 -> Step2: Install node dependencies\nStep2 -> Step3: Run test suite suite\nStep3 -> End: Push branch for code review`
  },
  {
    id: 'user-story-map',
    name: 'User Story Mapping',
    category: 'Project Documentation',
    icon: 'Layers',
    description: 'Deconstruct epics, user activities, tasks, and releases priorities.',
    supportedInputs: ['README', 'Markdown', 'TXT'],
    supportedOutputs: ['PNG', 'SVG', 'PDF', 'JSON'],
    level: 'Advanced',
    parserType: 'mindmap',
    sampleData: `- Epic: User Registration\n  - Story A: Setup email inputs\n    - Validation checks\n  - Story B: Secure password crypts\n    - Salt hashes`
  },

  // 8. AI & MACHINE LEARNING (8 tools)
  {
    id: 'ml-training-pipeline',
    name: 'ML Model Training Pipeline',
    category: 'AI & ML',
    icon: 'Cpu',
    description: 'Visualize data collections, preprocessing, modeling trains, evaluations, and registrations.',
    supportedInputs: ['README', 'Markdown', 'YAML', 'JSON'],
    supportedOutputs: ['PNG', 'SVG', 'PDF', 'JSON'],
    parserType: 'architecture',
    isPopular: true,
    level: 'Advanced',
    sampleData: `[Raw Data S3] -> [Spark Cleaner]\n[Spark Cleaner] -> [Feature Stores]\n[Feature Stores] -> [PyTorch Model Train]\n[PyTorch Model Train] -> [MLFlow Registry]`
  },
  {
    id: 'rag-workflow',
    name: 'RAG Workflow',
    category: 'AI & ML',
    icon: 'Brain',
    description: 'Graph retrieval workflows, tracing queries embedding, vector databases retrieval, and LLM prompts context.',
    supportedInputs: ['README', 'Markdown', 'YAML', 'JSON'],
    supportedOutputs: ['PNG', 'SVG', 'PDF', 'JSON'],
    parserType: 'architecture',
    isPopular: true,
    level: 'Advanced',
    sampleData: `[User Query] -> [Cohere Embedding]\n[Cohere Embedding] -> [Pinecone Vector DB]\n[Pinecone Vector DB] -> [Retrieved Context chunks]\n[Retrieved Context chunks] -> [OpenAI GPT-4 LLM]\n[OpenAI GPT-4 LLM] -> [User Response]`
  },
  {
    id: 'llm-agent-system',
    name: 'LLM Multi-Agent System',
    category: 'AI & ML',
    icon: 'Cpu',
    description: 'Model agent routing, tool allocations, memory databases, and conversational back-and-forth loops.',
    supportedInputs: ['README', 'Markdown', 'YAML'],
    supportedOutputs: ['PNG', 'SVG', 'PDF', 'JSON'],
    parserType: 'architecture',
    isRecent: true,
    level: 'Advanced',
    sampleData: `[User Input] -> [Supervisor Agent]\n[Supervisor Agent] -> [Research Agent tool]\n[Research Agent tool] -> [Web Search API]\n[Supervisor Agent] -> [Coder Agent tool]\n[Coder Agent tool] -> [Sandbox Execution]`
  },
  {
    id: 'vector-search-flow',
    name: 'Vector Search Embeddings Flow',
    category: 'AI & ML',
    icon: 'Share2',
    description: 'Trace documents ingestion, chunking, indexing, and vector database nearest-neighbor checks.',
    supportedInputs: ['README', 'Markdown', 'TXT'],
    supportedOutputs: ['PNG', 'SVG', 'PDF'],
    parserType: 'architecture',
    level: 'Advanced',
    sampleData: `[New Wiki Document] -> [Recursive Character Chunker]\n[Recursive Character Chunker] -> [Vector Embedding service]\n[Vector Embedding service] -> [Milvus Vector Index]`
  },
  {
    id: 'data-ingestion-pipeline',
    name: 'ML Data Ingestion Pipeline',
    category: 'AI & ML',
    icon: 'Network',
    description: 'Map real-time ETL runs, raw data validations, and data stores syncing.',
    supportedInputs: ['YAML', 'JSON', 'TXT'],
    supportedOutputs: ['PNG', 'SVG', 'PDF'],
    parserType: 'architecture',
    level: 'Advanced',
    sampleData: `[Kafka User Stream] -> [Flink Event Processor]\n[Flink Event Processor] -> [Iceberg Warehouse tables]\n[Iceberg Warehouse tables] -> [Offline Feature Training]`
  },
  {
    id: 'neural-net-architecture',
    name: 'Neural Network Architecture',
    category: 'AI & ML',
    icon: 'Layers',
    description: 'Detail convolutional layers, weights pools, activation functions, and output nodes.',
    supportedInputs: ['Python', 'TXT'],
    supportedOutputs: ['PNG', 'SVG', 'PDF', 'JSON'],
    level: 'Advanced',
    parserType: 'architecture',
    sampleData: `[Input Layer Node] -> [Conv2d weight matrix]\n[Conv2d weight matrix] -> [ReLU Activation]\n[ReLU Activation] -> [Max Pooling layer]\n[Max Pooling layer] -> [Dense Softmax outputs]`
  },
  {
    id: 'prompt-chain-flow',
    name: 'Prompt Chain / LangChain Flow',
    category: 'AI & ML',
    icon: 'Share2',
    description: 'Map sequential prompts, system parameters, variables injections, and validations.',
    supportedInputs: ['README', 'Markdown', 'TXT'],
    supportedOutputs: ['PNG', 'SVG', 'PDF'],
    isRecent: true,
    level: 'Beginner',
    parserType: 'architecture',
    sampleData: `[Template Variables] -> [Format Prompt Template]\n[Format Prompt Template] -> [LLM Call Stage 1]\n[LLM Call Stage 1] -> [Output Parser check]\n[Output Parser check] -> [Staging Output]`
  },
  {
    id: 'model-inference-sequence',
    name: 'Model Serving & Inference Sequence',
    category: 'AI & ML',
    icon: 'Server',
    description: 'Map client API gateways, Triton model servers, GPU allocations, and caching layers.',
    supportedInputs: ['YAML', 'README', 'TXT'],
    supportedOutputs: ['PNG', 'SVG', 'PDF', 'JSON'],
    level: 'Advanced',
    parserType: 'architecture',
    sampleData: `[Gateway Ingress] -> [FastAPI Server]\n[FastAPI Server] -> [Redis Inference cache]\n[FastAPI Server] -> [Triton Model Server GPU]\n[Triton Model Server GPU] -> [TensorRT Optimizer]`
  }
];
