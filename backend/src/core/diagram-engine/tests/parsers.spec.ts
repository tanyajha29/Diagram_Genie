import { ParserRegistry } from '../registry/parser.registry';
import { ArchitectureParser } from '../parsers/architecture.parser';
import { SqlParser } from '../parsers/sql.parser';
import { MarkdownOutlineParser } from '../parsers/markdown-outline.parser';
import { UmlSequenceParser } from '../parsers/sequence.parser';
import { PrismaParser } from '../parsers/prisma.parser';
import { TerraformParser } from '../parsers/terraform.parser';
import { DockerComposeParser } from '../parsers/docker-compose.parser';
import { OpenApiParser } from '../parsers/openapi.parser';
import { PipelineDslParser } from '../parsers/pipeline.parser';
import { FlowchartParser } from '../parsers/flowchart.parser';
import { CloudDslParser } from '../parsers/cloud.parser';
import { NodeClassifier } from '../parsers/node-classifier.service';

describe('Diagram Genie Consolidated Parsers Test Suite', () => {
  let registry: ParserRegistry;
  let classifier: NodeClassifier;
  let archParser: ArchitectureParser;
  let sqlParser: SqlParser;
  let outlineParser: MarkdownOutlineParser;
  let sequenceParser: UmlSequenceParser;
  let prismaParser: PrismaParser;
  let tfParser: TerraformParser;
  let composeParser: DockerComposeParser;
  let openapiParser: OpenApiParser;
  let pipelineParser: PipelineDslParser;
  let flowParser: FlowchartParser;
  let cloudParser: CloudDslParser;

  beforeAll(() => {
    registry = new ParserRegistry();
    classifier = new NodeClassifier();
    
    archParser = new ArchitectureParser(registry, classifier);
    sqlParser = new SqlParser(registry, classifier);
    outlineParser = new MarkdownOutlineParser(registry);
    sequenceParser = new UmlSequenceParser(registry);
    prismaParser = new PrismaParser(registry);
    tfParser = new TerraformParser(registry);
    composeParser = new DockerComposeParser(registry);
    openapiParser = new OpenApiParser(registry);
    pipelineParser = new PipelineDslParser(registry);
    flowParser = new FlowchartParser(registry);
    cloudParser = new CloudDslParser(registry);
  });

  describe('1. Software Architecture (Architecture DSL)', () => {
    it('should parse minimal architecture connectors', async () => {
      const result = await archParser.parse('[Client] -> [API]');
      expect(result.diagram.nodes.map(n => n.id)).toContain('client');
      expect(result.diagram.nodes.map(n => n.id)).toContain('api');
      expect(result.diagram.edges).toHaveLength(1);
    });

    it('should parse realistic multi-node dependency lines', async () => {
      const src = `
        [Client] -> [API]
        [API] -> [Database]
      `;
      const result = await archParser.parse(src);
      expect(result.diagram.nodes).toHaveLength(3);
      expect(result.diagram.edges).toHaveLength(2);
    });
  });

  describe('2. Database & ER (SQL / Prisma)', () => {
    it('should parse SQL CREATE TABLE fields and FK references', async () => {
      const src = `
        CREATE TABLE users (
          id INT PRIMARY KEY,
          name VARCHAR(50)
        );
        CREATE TABLE orders (
          id INT PRIMARY KEY,
          user_id INT REFERENCES users(id)
        );
      `;
      const result = await sqlParser.parse(src);
      expect(result.diagram.nodes).toHaveLength(2);
      expect(result.diagram.nodes[0].data?.columns).toHaveLength(2);
      expect(result.diagram.edges).toHaveLength(1);
    });

    it('should parse Prisma model schema properties and relations', async () => {
      const src = `
        model User {
          id    Int    @id
          posts Post[]
        }
        model Post {
          id       Int  @id
          authorId Int
          author   User @relation(fields: [authorId], references: [id])
        }
      `;
      const result = await prismaParser.parse(src);
      expect(result.diagram.nodes).toHaveLength(2);
      expect(result.diagram.edges).toHaveLength(1);
      expect(result.diagram.edges[0].source).toBe('post');
      expect(result.diagram.edges[0].target).toBe('user');
    });
  });

  describe('3. UML Diagrams (UML Sequence DSL)', () => {
    it('should parse UML Sequence timelines', async () => {
      const src = `
        Alice -> Bob : Hello
        Bob --> Alice : Welcome
      `;
      const result = await sequenceParser.parse(src);
      expect(result.diagram.nodes.map(n => n.id)).toContain('alice');
      expect(result.diagram.nodes.map(n => n.id)).toContain('bob');
      expect(result.diagram.edges).toHaveLength(2);
      expect(result.diagram.edges[1].type).toBe('dashed');
    });
  });

  describe('4. Flow & Process (Flowchart DSL)', () => {
    it('should parse Flowchart decisions and process flows', async () => {
      const src = `
        Start -> Process -> Decision{Is Valid?}
        Decision -> [Yes] -> Success
        Decision -> [No] -> Error
      `;
      const result = await flowParser.parse(src);
      expect(result.diagram.nodes.map(n => n.id)).toContain('decision');
      expect(result.diagram.nodes.find(n => n.id === 'decision')?.type).toBe('decision');
      expect(result.diagram.edges.find(e => e.label === 'Yes')).toBeDefined();
    });
  });

  describe('5. Cloud & DevOps (Terraform / Docker Compose / Cloud DSL)', () => {
    it('should parse Terraform resource allocations and dependency variables', async () => {
      const src = `
        resource "aws_vpc" "main" {
          cidr_block = "10.0.0.0/16"
        }
        resource "aws_subnet" "sub" {
          vpc_id = aws_vpc.main.id
        }
      `;
      const result = await tfParser.parse(src);
      expect(result.diagram.nodes.map(n => n.id)).toContain('aws_subnet_sub');
      expect(result.diagram.edges).toHaveLength(1);
    });

    it('should parse Docker Compose containers and depends_on blocks', async () => {
      const src = `
        services:
          web:
            image: nginx
            depends_on:
              - api
          api:
            image: node
      `;
      const result = await composeParser.parse(src);
      expect(result.diagram.nodes.map(n => n.id)).toContain('web');
      expect(result.diagram.nodes.map(n => n.id)).toContain('api');
      expect(result.diagram.edges).toHaveLength(1);
    });

    it('should parse Cloud DSL containment groups', async () => {
      const src = `
        [VPC vpc_main] contains:
          [Subnet private_a]
      `;
      const result = await cloudParser.parse(src);
      expect(result.diagram.nodes.find(n => n.id === 'subnet_private_a')?.parentId).toBe('vpc_vpc_main');
    });
  });

  describe('6. API Routing (OpenAPI / Swagger)', () => {
    it('should parse OpenAPI JSON specs', async () => {
      const src = JSON.stringify({
        openapi: '3.0.0',
        paths: {
          '/users': {
            get: {
              responses: { '200': { description: 'OK' } }
            }
          }
        }
      });
      const result = await openapiParser.parse(src);
      expect(result.diagram.nodes.map(n => n.id)).toContain('ep_get__users');
    });
  });

  describe('7. Documentation (Markdown Outline list)', () => {
    it('should parse Markdown outlines into a hierarchical tree structure', async () => {
      const src = `
        - Root
          - Sub A
          - Sub B
      `;
      const result = await outlineParser.parse(src);
      expect(result.diagram.nodes).toHaveLength(3);
      expect(result.diagram.edges).toHaveLength(2);
    });
  });

  describe('8. AI / ML Pipeline (Pipeline DSL)', () => {
    it('should parse ML pipeline processing sequential stages', async () => {
      const src = '[Raw Dataset] -> [Model Training] -> [Inference API]';
      const result = await pipelineParser.parse(src);
      expect(result.diagram.nodes).toHaveLength(3);
      expect(result.diagram.nodes.find(n => n.id === 'raw_dataset')?.type).toBe('dataset');
      expect(result.diagram.nodes.find(n => n.id === 'model_training')?.type).toBe('model');
      expect(result.diagram.edges).toHaveLength(2);
    });
  });

  describe('9. Correctness and Quality Enhancements', () => {
    it('should parse UML Sequence messages and assign type constraints', async () => {
      const src = `
        User -> Database : Read
        Database --> User : OK
      `;
      const result = await sequenceParser.parse(src);
      expect(result.diagram.nodes).toHaveLength(2);
      expect(result.diagram.edges).toHaveLength(2);
      expect(result.diagram.edges[1].type).toBe('dashed');
    });

    it('should parse Cloud DSL container hierarchy links', async () => {
      const src = `
        [VPC vpc_main] contains:
          [Subnet private_a]
      `;
      const result = await cloudParser.parse(src);
      expect(result.diagram.nodes.find(n => n.id === 'subnet_private_a')?.parentId).toBe('vpc_vpc_main');
    });
  });
});
