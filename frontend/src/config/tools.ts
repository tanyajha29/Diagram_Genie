export interface ToolConfig {
  id: string;
  name: string;
  category: 'Architecture' | 'Database' | 'UML' | 'Flow' | 'Mind Maps' | 'Cloud';
  icon: string;
  description: string;
  supportedInputs: string[];
  supportedOutputs: string[];
  sampleData: string;
  parserType: 'architecture' | 'er' | 'uml' | 'flowchart' | 'mindmap' | 'cloud';
}

export const toolsConfig: ToolConfig[] = [
  {
    id: 'architecture-diagram',
    name: 'Architecture Diagram',
    category: 'Architecture',
    icon: 'Network',
    description: 'Design software system architecture, component dependencies, and microservice relationships visually.',
    supportedInputs: ['.md', '.json', '.txt', 'Docker Compose', 'Terraform'],
    supportedOutputs: ['PNG', 'SVG', 'PDF', 'JSON'],
    parserType: 'architecture',
    sampleData: `// System Architecture
[Client] -> [API Gateway] : HTTPS Request
[API Gateway] -> [Auth Service] : Validate Token
[API Gateway] -> [User Service] : Fetch Profile
[User Service] -> [Database] : Read User Table
[API Gateway] -> [Notification Broker] : Dispatch Events`
  },
  {
    id: 'er-diagram',
    name: 'ER Diagram',
    category: 'Database',
    icon: 'Database',
    description: 'Generate Entity Relationship diagrams from schema definitions, SQL scripts, or Prisma schemas.',
    supportedInputs: ['.sql', '.prisma', '.txt', '.json'],
    supportedOutputs: ['PNG', 'SVG', 'PDF', 'Mermaid', 'JSON'],
    parserType: 'er',
    sampleData: `Table Users {
  id int [pk]
  name varchar
  email varchar [unique]
  createdAt timestamp
}

Table Orders {
  id int [pk]
  userId int [ref: > Users.id]
  total decimal
  status varchar
}

Table OrderItems {
  id int [pk]
  orderId int [ref: > Orders.id]
  productId int
  quantity int
}`
  },
  {
    id: 'flowchart',
    name: 'Flowchart',
    category: 'Flow',
    icon: 'GitFork',
    description: 'Build process logic, decision matrices, algorithm steps, and conditional workflow charts.',
    supportedInputs: ['.md', '.txt', '.json'],
    supportedOutputs: ['PNG', 'SVG', 'PDF', 'Mermaid', 'JSON'],
    parserType: 'flowchart',
    sampleData: `Start -> Process: Receive Webhook Request
Process -> Choice: Is Signature Valid?
Choice -> [Yes] -> Step1: Extract Event Payload
Choice -> [No] -> Error: Respond 401 Unauthorized
Step1 -> Step2: Push to Task Queue
Step2 -> End: Respond 200 OK`
  },
  {
    id: 'uml-diagram',
    name: 'UML Class Diagram',
    category: 'UML',
    icon: 'FileCode2',
    description: 'Create object-oriented structures showing system classes, attributes, methods, and inheritances.',
    supportedInputs: ['.java', '.ts', '.py', '.txt'],
    supportedOutputs: ['PNG', 'SVG', 'PDF', 'PlantUML', 'JSON'],
    parserType: 'uml',
    sampleData: `class Animal {
  +name: string
  +age: int
  +makeSound(): void
}

class Dog extends Animal {
  +breed: string
  +bark(): void
}

class Cat extends Animal {
  +isLazy: boolean
  +meow(): void
}`
  },
  {
    id: 'mind-map',
    name: 'Mind Map',
    category: 'Mind Maps',
    icon: 'Brain',
    description: 'Brainstorm ideas, organize nested subtopics, outline projects, and map concepts hierarchically.',
    supportedInputs: ['.md', '.txt'],
    supportedOutputs: ['PNG', 'SVG', 'PDF', 'JSON'],
    parserType: 'mindmap',
    sampleData: `- Diagram Genie Product Launch
  - Core Features
    - Multi-format parsers
    - Interactive canvas
    - GPU background
  - Marketing Channels
    - Product Hunt
    - Twitter/X
    - Dev.to
  - Future Roadmap
    - Real-time Collaboration
    - AI-agent integration`
  },
  {
    id: 'cloud-architecture',
    name: 'Cloud Infrastructure',
    category: 'Cloud',
    icon: 'Cloud',
    description: 'Map AWS, GCP, or Azure environments, serverless endpoints, load balancers, and network layers.',
    supportedInputs: ['Terraform', 'Docker Compose', '.json', '.txt'],
    supportedOutputs: ['PNG', 'SVG', 'PDF', 'JSON'],
    parserType: 'cloud',
    sampleData: `// AWS Cloud Infrastructure
[Route 53] -> [Application Load Balancer]
[Application Load Balancer] -> [ECS Fargate Container]
[ECS Fargate Container] -> [Amazon RDS Database]
[ECS Fargate Container] -> [S3 Asset Storage]
[ECS Fargate Container] -> [ElastiCache Redis]`
  }
];
