# Supported Diagram Types

Diagram Genie supports 11 diagram categories, converting specific text syntaxes into the Universal Diagram Model (UDM). This document lists each diagram type, its matching rules, layouts, rendering mappings, and code examples.

---

## Supported Types Reference Card

```carousel
### 1. System Architecture
- **sourceType**: `architecture` / `system` / `plain_text`
- **Parser**: `ArchitectureParser`
- **Layout**: Layered Grid / Tiers
- **Current Status**: Implemented

<!-- slide -->
### 2. Database & ER
- **sourceType**: `sql` / `database` / `er`
- **Parser**: `SqlParser`
- **Layout**: Relational Grid
- **Current Status**: Implemented (Canonical Columns)

<!-- slide -->
### 3. Mindmap
- **sourceType**: `mindmap`
- **Parser**: `MarkdownParser`
- **Layout**: Radial Tree
- **Current Status**: Implemented (Stabilized)
```

---

## 1. System Architecture

- **Purpose**: Map high-level service dependency graphs.
- **sourceType**: `architecture`, `system`, `plain_text`
- **Parser**: [`ArchitectureParser`](file:///C:/Users/jhata/.gemini/antigravity/scratch/Diagram_Genie/backend/src/core/diagram-engine/parsers/architecture.parser.ts)
- **Detection Logic**: Auto-detects as `architecture` from files ending in `.txt` or when containing plain text dependencies.
- **UDM Representation**: Standard nodes mapped to shapes like `actor`, `database`, `server` using the keyword-based `NodeClassifier`. Edges represent dependency flows.
- **Layout Strategy**: Layered grid layouts that separate services into distinct horizontal/vertical rows.
- **Rendering Strategy**: Custom node types (e.g. Server, Client, Database, Cloud) with directional arrows.
- **Export Behavior**: Standard SVG/PNG exports.
- **Current Status**: **Implemented**.
- **Known Limitations**: Manual connection naming can overlap on large systems.
- **Example Input**:
  ```text
  [Client] -> [API Gateway] : HTTP POST
  [API Gateway] -> [Auth Service] : Validate
  [Auth Service] -> [User Database] : SELECT
  ```
- **Example Conceptual Output**: 
  A three-node sequence mapping `client` (actor node) on the left connecting to `api_gateway` (gateway node) and `user_database` (database cylinder node) on the right.

---

## 2. Entity Relationship (ER) Diagram

- **Purpose**: Document database tables, columns, and foreign key relations.
- **sourceType**: `sql`, `database`, `er`
- **Parser**: [`SqlParser`](file:///C:/Users/jhata/.gemini/antigravity/scratch/Diagram_Genie/backend/src/core/diagram-engine/parsers/sql.parser.ts)
- **Detection Logic**: Files containing `.sql` extensions or matching `CREATE TABLE` / `ALTER TABLE`.
- **UDM Representation**: 
  Nodes represent entity tables. Column attributes are stored inside `data.columns` conforming to the **canonical `ColumnInfo` array structure**:
  ```typescript
  export interface ColumnInfo {
    name: string;
    type: string;
    primaryKey: boolean;
    foreignKey: boolean;
    nullable: boolean;
  }
  ```
- **Layout Strategy**: Grid layouter separating entity tables with custom spacing to prevent overlapping link lines.
- **Rendering Strategy**: Table elements where each table node contains list elements detailing primary keys (marked with a key icon) and foreign keys.
- **Export Behavior**: Plain grid layout serialized to SVG/PNG.
- **Current Status**: **Implemented**. Support is verified for:
  - Inline foreign keys (`REFERENCES table(col)`)
  - Standalone foreign key constraints (`FOREIGN KEY (col) REFERENCES table(col)`)
  - Out-of-line alter table statements (`ALTER TABLE table ADD FOREIGN KEY (col) REFERENCES table(col)`)
- **Known Limitations**: Does not support parsing complex composite primary keys or nested schema namespaces.
- **Example Input**:
  ```sql
  CREATE TABLE users (
    id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
  );

  CREATE TABLE orders (
    id INT PRIMARY KEY,
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
  ```
- **Example Conceptual Output**: 
  Two rectangular database nodes: `users` and `orders`. The `orders` node has a line connecting to `users` representing the `user_id -> id` relation.

---

## 3. UML Class Diagram

- **Purpose**: Outline object-oriented class diagrams.
- **sourceType**: `class`, `uml`
- **Parser**: [`ArchitectureParser`](file:///C:/Users/jhata/.gemini/antigravity/scratch/Diagram_Genie/backend/src/core/diagram-engine/parsers/architecture.parser.ts)
- **Detection Logic**: Explicit sourceType input or text matching `class ` declarations.
- **UDM Representation**: Standard nodes classified as classes, with edges mapped to relationship types like inheritance, composition, or aggregation.
- **Layout Strategy**: Layered vertical hierarchical or grid algorithms.
- **Rendering Strategy**: Mapped onto React Flow edges utilizing custom SVG markers (e.g. hollow diamond for aggregation, filled diamond for composition, hollow triangle for inheritance).
- **Export Behavior**: Adapted through SVG/PNG export serialization.
- **Current Status**: **Implemented** for basic relationships.
- **Known Limitations**: Attributes and methods are only parsed if defined in the UML Sequence parser files (where embedded class structures are allowed).
- **Example Input**:
  ```text
  [Admin] -> [User] : inherits
  [User] -> [Profile] : composition
  ```
- **Example Conceptual Output**: 
  Classes connected by lines with custom end arrows matching inheritance and composition semantics.

---

## 4. Flowchart

- **Purpose**: Outline processes, decision points, and branches.
- **sourceType**: `flow`, `flowchart`, `flow-dsl`
- **Parser**: [`FlowchartParser`](file:///C:/Users/jhata/.gemini/antigravity/scratch/Diagram_Genie/backend/src/core/diagram-engine/parsers/flowchart.parser.ts)
- **Detection Logic**: Matches explicit category `flowchart` or strings containing decision block brackets `{Decision}`.
- **UDM Representation**: Nodes categorized by function (e.g. `process`, `decision`, `start`). Edges contain branch label indicators.
- **Layout Strategy**: Directed Acyclic Graph (DAG) or tree layout.
- **Rendering Strategy**: Start/End nodes render as pill capsules, processes as rectangles, and decisions as rotated diamond blocks.
- **Export Behavior**: Serialized coordinates mapping nodes to standard layout positions.
- **Current Status**: **Implemented**.
- **Known Limitations**: Loop-back edge lines can overlap layout paths on complex flows.
- **Example Input**:
  ```text
  Start -> Process -> {Is Valid?}
  {Is Valid?} -> [Yes] -> Success
  {Is Valid?} -> [No] -> Failure
  ```
- **Example Conceptual Output**: 
  Flow from a capsule node to a rectangle, then splitting at a diamond-shaped decision node into two paths.

---

## 5. UML Sequence Diagram

- **Purpose**: Map chronologically ordered message exchanges.
- **sourceType**: `sequence`, `uml-sequence`
- **Parser**: [`UmlSequenceParser`](file:///C:/Users/jhata/.gemini/antigravity/scratch/Diagram_Genie/backend/src/core/diagram-engine/parsers/sequence.parser.ts)
- **Detection Logic**: Matches sequence files containing actor exchanges `A -> B : Message`.
- **UDM Representation**: Participant nodes and call message edges with sequential metadata indexes.
- **Layout Strategy**: Timeline layout where participants are distributed horizontally, and messaging calls are laid out vertically down the page.
- **Rendering Strategy**: Participants are rendered as top lifelines with vertical dashed drops. Calls are rendered as horizontal arrows (solid for requests, dashed for returns).
- **Export Behavior**: Sequenced SVG layout.
- **Current Status**: **Implemented**.
- **Known Limitations**: Does not support complex fragment boxes (`alt`, `loop`, `opt`).
- **Example Input**:
  ```text
  User -> WebApp : Login Request
  WebApp --> User : Authentication Success
  ```
- **Example Conceptual Output**: 
  Two lifelines side-by-side with two horizontal message lines representing request and return flows.

---

## 6. Cloud Architecture

- **Purpose**: Visualize cloud infrastructure, virtual networks, subnets, and host instances.
- **sourceType**: `cloud`, `infra`
- **Parser**: [`CloudDslParser`](file:///C:/Users/jhata/.gemini/antigravity/scratch/Diagram_Genie/backend/src/core/diagram-engine/parsers/cloud.parser.ts)
- **Detection Logic**: Keyword containment syntax `[Group] contains:`.
- **UDM Representation**: Nodes mapped inside structural parent containers by storing `parentId` fields on nested items.
- **Layout Strategy**: Horizontal/vertical grouping with recursive box containment offsets.
- **Rendering Strategy**: Parent container shapes render with semi-transparent background cards, containing children nested inside their border bounds.
- **Export Behavior**: Container tree nodes adjusted to SVG bounds.
- **Current Status**: **Implemented** (containment links).
- **Known Limitations**: Large nested groups require manual sizing logic on the canvas.
- **Example Input**:
  ```text
  [VPC aws_vpc] contains:
    [Subnet app_subnet]
  [Subnet app_subnet] contains:
    [Server web_instance]
  ```
- **Example Conceptual Output**: 
  A box labeled `aws_vpc` containing a nested box `app_subnet`, which in turn contains a database node `web_instance`.

---

## 7. Docker Compose Diagram

- **Purpose**: Outline multi-container network dependencies.
- **sourceType**: `docker-compose`
- **Parser**: [`DockerComposeParser`](file:///C:/Users/jhata/.gemini/antigravity/scratch/Diagram_Genie/backend/src/core/diagram-engine/parsers/docker-compose.parser.ts)
- **Detection Logic**: Matches `services:` and `depends_on:` declarations in `.yaml` / `.yml` configurations.
- **UDM Representation**: Container service nodes linked by depends-on networking edges.
- **Layout Strategy**: Grid or network hierarchical layouts.
- **Rendering Strategy**: Custom container nodes with registry icons.
- **Export Behavior**: Standard SVG/PNG exports.
- **Current Status**: **Implemented**.
- **Known Limitations**: Port mappings and environmental variables are parsed but not rendered inside the node shapes.
- **Example Input**:
  ```yaml
  version: '3.8'
  services:
    web:
      image: nginx
      depends_on:
        - app
    app:
      image: node:18
  ```
- **Example Conceptual Output**: 
  `web` container node connected to `app` container node.

---

## 8. API Visualizer

- **Purpose**: Document HTTP endpoints and request methods.
- **sourceType**: `openapi`
- **Parser**: [`OpenApiParser`](file:///C:/Users/jhata/.gemini/antigravity/scratch/Diagram_Genie/backend/src/core/diagram-engine/parsers/openapi.parser.ts)
- **Detection Logic**: Validates Swagger/OpenAPI version keys in JSON payloads.
- **UDM Representation**: Path nodes linked to method nodes (GET, POST, DELETE).
- **Layout Strategy**: Tree or hierarchical layouts.
- **Rendering Strategy**: Endpoint nodes color-coded by HTTP method (Green for GET, Orange for POST, Red for DELETE).
- **Export Behavior**: Normal exports.
- **Current Status**: **Implemented**.
- **Known Limitations**: Only supports JSON OpenAPI schemas (YAML must be pre-converted).
- **Example Input**:
  ```json
  {
    "openapi": "3.0.0",
    "paths": {
      "/users": {
        "get": { "responses": { "200": { "description": "Success" } } }
      }
    }
  }
  ```
- **Example Conceptual Output**: 
  A root endpoint node pointing to a GET method block.

---

## 9. AI/ML Pipeline

- **Purpose**: Represent sequential steps in machine learning data pipelines.
- **sourceType**: `pipeline`, `pipeline-dsl`
- **Parser**: [`PipelineDslParser`](file:///C:/Users/jhata/.gemini/antigravity/scratch/Diagram_Genie/backend/src/core/diagram-engine/parsers/pipeline.parser.ts)
- **Detection Logic**: Keywords like `[Dataset]` or `[Model]`.
- **UDM Representation**: Step nodes classified into pipeline types (e.g. `dataset`, `model`, `inference`).
- **Layout Strategy**: Left-to-right sequential layouts.
- **Rendering Strategy**: Custom status nodes.
- **Export Behavior**: Sequential SVG rendering.
- **Current Status**: **Implemented**.
- **Known Limitations**: Parallel execution loops can display as straight sequential chains.
- **Example Input**:
  ```text
  [S3 Dataset] -> [ML Model Training] -> [Triton Server]
  ```
- **Example Conceptual Output**: 
  A dataset cylinder shape linking to a gear/brain model node, then linking to a server node.

---

## 10. Prisma Relation Diagram

- **Purpose**: Map database schemas written in Prisma format.
- **sourceType**: `prisma`
- **Parser**: [`PrismaParser`](file:///C:/Users/jhata/.gemini/antigravity/scratch/Diagram_Genie/backend/src/core/diagram-engine/parsers/prisma.parser.ts)
- **Detection Logic**: Validates files containing `model ` declarations and `@relation` annotations.
- **UDM Representation**: Entities representing Prisma models, containing field details and relational links.
- **Layout Strategy**: Grid or hierarchical grid layout.
- **Rendering Strategy**: Entity lists with key tags.
- **Export Behavior**: Standard exports.
- **Current Status**: **Implemented**.
- **Known Limitations**: Complex Prisma attributes like `@map` or multi-field IDs are skipped.
- **Example Input**:
  ```prisma
  model User {
    id    Int    @id
    posts Post[]
  }
  model Post {
    id       Int  @id
    authorId Int
    author   User @relation(fields: [authorId], references: [id])
  }
  ```
- **Example Conceptual Output**: 
  Two tables, `User` and `Post`, connected by a post-to-user author dependency line.

---

## 11. Mindmap

- **Purpose**: Visualize hierarchical outlines, brainstorming maps, or notes.
- **sourceType**: `mindmap`
- **Parser**: [`MarkdownParser`](file:///C:/Users/jhata/.gemini/antigravity/scratch/Diagram_Genie/backend/src/core/diagram-engine/parsers/markdown.parser.ts)
- **Detection Logic**: Matches explicit `mindmap` sourceType or parses standard Markdown bullet outlines.
- **UDM Representation**: Hierarchical tree node graph with child links.
- **Layout Strategy**: **Radial layout** (nodes extend outwards in a circle from the central root).
- **Rendering Strategy**: Rounded text nodes connected by clean straight line nodes.
- **Export Behavior**: Circular radial SVG mapping.
- **Current Status**: **Implemented** (fixed and verified).
- **Known Limitations**: Highly dense outline files can cause overlapping nodes in close sectors.
- **Example Input**:
  ```text
  - Diagram Genie Engine
    - Deterministic Parsers
      - SQL Parser
      - Markdown Parser
    - Layout Strategies
      - Radial Layout
  ```
- **Example Conceptual Output**: 
  A central root `Diagram Genie Engine` node, with two branches (`Deterministic Parsers`, `Layout Strategies`) extending outwards in opposite directions.

---

## Related Documentation
- [Architecture Deep Dive](architecture.md) — System flow from input to output.
- [Parser System](parsers.md) — Tokenizer details.
- [Layout Engine Guide](layout-engine.md) — Grid, Hierarchical, and Radial details.
