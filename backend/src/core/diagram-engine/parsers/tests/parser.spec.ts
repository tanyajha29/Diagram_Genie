import { Test } from '@nestjs/testing';
import { NodeClassifier } from '../node-classifier.service';
import { ArchitectureParser } from '../architecture.parser';
import { MarkdownParser } from '../markdown.parser';
import { SqlParser } from '../sql.parser';
import { FlowParser } from '../flow.parser';
import { ParserRegistry } from '../../registry/parser.registry';
import { Lexer } from '../lexer';

describe('Deterministic Parser Layer Tests', () => {
  let classifier: NodeClassifier;
  let archParser: ArchitectureParser;
  let mdParser: MarkdownParser;
  let sqlParser: SqlParser;
  let flowParser: FlowParser;
  let registry: ParserRegistry;

  beforeAll(async () => {
    registry = new ParserRegistry();
    classifier = new NodeClassifier();
    
    archParser = new ArchitectureParser(registry, classifier);
    mdParser = new MarkdownParser(registry, classifier);
    sqlParser = new SqlParser(registry, classifier);
    flowParser = new FlowParser(registry, classifier);
  });

  describe('Lexer', () => {
    it('should tokenize inputs with indentation, arrows, and keywords', () => {
      const input = '  Client -> Database : query';
      const tokens = Lexer.tokenize(input);

      // Verify indent is captured
      expect(tokens[0].type).toBe('INDENT');
      expect(tokens[0].value).toBe('  ');

      // Verify arrow is captured
      const arrow = tokens.find(t => t.type === 'ARROW');
      expect(arrow).toBeDefined();
      expect(arrow?.value).toBe('->');

      // Verify punctuation is captured
      const colon = tokens.find(t => t.value === ':');
      expect(colon).toBeDefined();
    });
  });

  describe('NodeClassifier', () => {
    it('should classify labels based on keyword rules', () => {
      expect(classifier.classify('Postgres Database')).toBe('database');
      expect(classifier.classify('AWS S3 Bucket')).toBe('cloud');
      expect(classifier.classify('Kafka Event Queue')).toBe('queue');
      expect(classifier.classify('Nginx Gateway')).toBe('gateway');
      expect(classifier.classify('Client Browser')).toBe('actor');
      expect(classifier.classify('Random Microservice')).toBe('architecture');
    });
  });

  describe('ArchitectureParser', () => {
    it('should parse connection graphs and classify node styles', async () => {
      const input = `
        Client -> WebServer : HTTP GET
        WebServer --> [Postgres DB] : query sql
        [Postgres DB] => RedisCache : write cache
      `;

      const result = await archParser.parse(input);
      const { nodes, edges } = result.diagram;

      expect(nodes.length).toBe(4);
      expect(edges.length).toBe(3);

      const client = nodes.find(n => n.id === 'client');
      const db = nodes.find(n => n.id === 'postgres_db');
      const cache = nodes.find(n => n.id === 'rediscache');

      expect(client?.type).toBe('actor');
      expect(db?.type).toBe('database');
      expect(cache?.type).toBe('database');

      const edgeWebToDb = edges.find(e => e.source === 'webserver' && e.target === 'postgres_db');
      expect(edgeWebToDb?.label).toBe('query sql');
    });

    it('should deduplicate nodes and connections', async () => {
      const input = `
        A -> B
        A -> B
        B -> A
      `;
      const result = await archParser.parse(input);
      expect(result.diagram.nodes.length).toBe(2);
      // expect 2 edges: A->B and B->A (A->B duplicated edge is skipped)
      expect(result.diagram.edges.length).toBe(2);
    });
  });

  describe('MarkdownParser', () => {
    it('should parse nested heading hierarchies and list outlines', async () => {
      const input = `
# System Architecture Overview
## Web Tier
- Web Server Node
  - Ingress Controller
- API Endpoint Service
      `;

      const result = await mdParser.parse(input);
      const { nodes, edges } = result.diagram;

      // Verify nodes are generated
      expect(nodes.length).toBe(5);
      
      const mainHeading = nodes.find(n => n.label === 'System Architecture Overview');
      const subHeading = nodes.find(n => n.label === 'Web Tier');
      
      expect(mainHeading).toBeDefined();
      expect(subHeading).toBeDefined();

      // Verify hierarchy edges
      const edgeHeadings = edges.find(e => e.source === mainHeading?.id && e.target === subHeading?.id);
      expect(edgeHeadings).toBeDefined();
    });
  });

  describe('SqlParser', () => {
    it('should parse tables, columns, and foreign key relations', async () => {
      const input = `
        CREATE TABLE users (
          id INT PRIMARY KEY,
          email VARCHAR(255) UNIQUE
        );

        CREATE TABLE orders (
          id INT PRIMARY KEY,
          user_id INT REFERENCES users(id),
          amount DECIMAL(10, 2)
        );
      `;

      const result = await sqlParser.parse(input);
      const { nodes, edges } = result.diagram;

      expect(nodes.length).toBe(2);
      expect(edges.length).toBe(1);

      const usersNode = nodes.find(n => n.id === 'users');
      expect(usersNode?.data.columns?.id).toBe('INT');
      expect(usersNode?.data.columns?.email).toBe('VARCHAR(255)');

      const ordersNode = nodes.find(n => n.id === 'orders');
      expect(ordersNode?.data.columns?.user_id).toBe('INT');

      const fkEdge = edges[0];
      expect(fkEdge.source).toBe('orders');
      expect(fkEdge.target).toBe('users');
    });
  });

  describe('FlowParser', () => {
    it('should parse linear flowcharts and decision blocks', async () => {
      const input = `
        Start -> Process -> {Is valid?} -> Success -> End
      `;

      const result = await flowParser.parse(input);
      const { nodes, edges } = result.diagram;

      expect(nodes.length).toBe(5);
      expect(edges.length).toBe(4);

      const decisionNode = nodes.find(n => n.id === 'is_valid');
      expect(decisionNode).toBeDefined();
      expect(decisionNode?.type).toBe('decision');
    });

    it('should parse numbered process lists sequentially', async () => {
      const input = `
        1. Start trigger
        2. Execute step
        3. Finish process
      `;

      const result = await flowParser.parse(input);
      const { nodes, edges } = result.diagram;

      expect(nodes.length).toBe(3);
      expect(edges.length).toBe(2);
      expect(edges[0].source).toBe('flow_step_1');
      expect(edges[0].target).toBe('flow_step_2');
    });
  });
});
