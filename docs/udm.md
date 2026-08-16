# Universal Diagram Model (UDM)

The **Universal Diagram Model (UDM)** is the core graph representation shared across the Diagram Genie application. It decouples the language-specific parsers from the layout engines and frontend canvas renderers.

---

## 1. Schema Specifications

The UDM structure represents a graph containing vertices (nodes), edges (connections), and associated diagnostic metadata. Below is the TypeScript representation (from [`backend/src/core/diagram-engine/interfaces`](file:///C:/Users/jhata/.gemini/antigravity/scratch/Diagram_Genie/backend/src/core/diagram-engine/interfaces)):

```typescript
export interface Position {
  x: number;
  y: number;
}

export interface DiagramNode {
  id: string;                    // Unique identifier (normalized case-insensitively)
  label: string;                 // Display label text
  type: string;                  // Semantic category (e.g. database, server, gateway)
  position: Position;            // Position coordinates (populated by layouters)
  parentId?: string;             // Parent container ID for nested groups
  data: Record<string, any>;     // Type-specific details (e.g. columns array)
  style?: Record<string, any>;    // Visual overrides (color, borders)
}

export interface DiagramEdge {
  id: string;                    // Unique identifier
  source: string;                // Source node ID
  target: string;                // Target node ID
  label?: string;                // Display link label text
  type: string;                  // Edge line type (e.g. default, dashed, inheritance)
  animated: boolean;             // True if line contains flow dashes
  data?: Record<string, any>;    // Relational metadata (e.g. sequence indexes)
}

export interface DiagramMetadata {
  createdAt: string;             // ISO Timestamp
  updatedAt: string;             // ISO Timestamp
  engineVersion: string;         // E.g. '1.0'
  sourceType: string;            // The parser ID that produced this model
}

export interface Diagram {
  id: string;                    // Unique transaction identifier
  title: string;                 // Custom header title
  nodes: DiagramNode[];          // Vertex array
  edges: DiagramEdge[];          // Connector array
  metadata: DiagramMetadata;     // Audit trace keys
}
```

---

## 2. Representative JSON Example

Below is a complete, valid JSON payload output by the orchestrator mapping a basic client-database relationship with SQL table column metadata:

```json
{
  "id": "sql_er_1721950000000",
  "title": "Inventory Database Schema",
  "nodes": [
    {
      "id": "users",
      "label": "users",
      "type": "database-table",
      "position": { "x": 100, "y": 150 },
      "data": {
        "columns": [
          {
            "name": "id",
            "type": "INT",
            "primaryKey": true,
            "foreignKey": false,
            "nullable": false
          },
          {
            "name": "email",
            "type": "VARCHAR(255)",
            "primaryKey": false,
            "foreignKey": false,
            "nullable": true
          }
        ]
      },
      "style": {
        "backgroundColor": "#0f172a",
        "borderColor": "#f59e0b",
        "textColor": "#f8fafc",
        "borderWidth": 2
      }
    },
    {
      "id": "orders",
      "label": "orders",
      "type": "database-table",
      "position": { "x": 420, "y": 150 },
      "data": {
        "columns": [
          {
            "name": "id",
            "type": "INT",
            "primaryKey": true,
            "foreignKey": false,
            "nullable": false
          },
          {
            "name": "user_id",
            "type": "INT",
            "primaryKey": false,
            "foreignKey": true,
            "nullable": false
          }
        ]
      },
      "style": {
        "backgroundColor": "#0f172a",
        "borderColor": "#f59e0b",
        "textColor": "#f8fafc",
        "borderWidth": 2
      }
    }
  ],
  "edges": [
    {
      "id": "fk_orders_users_0",
      "source": "orders",
      "target": "users",
      "label": "user_id -> id",
      "type": "default",
      "animated": false
    }
  ],
  "metadata": {
    "createdAt": "2026-08-16T16:30:00.000Z",
    "updatedAt": "2026-08-16T16:30:00.000Z",
    "engineVersion": "1.0",
    "sourceType": "sql-parser"
  }
}
```

---

## 3. Parsing Mapping Strategy

Different parser engines map their distinct domain syntaxes into UDM nodes using standardized guidelines:

- **Software Architecture**: Maps connectors (`[NodeA] -> [NodeB]`) to separate nodes with IDs matching the clean, lower-cased node labels.
- **SQL / Prisma / Databases**: Converts tables/models to `database-table` node types, storing structured field attributes inside `data.columns`. Edges are generated only for verified foreign key dependencies.
- **UML Sequence**: Maps participants to `uml-class` nodes, and participant transitions to edges containing `sequenceIndex` numbers inside `data` to maintain chronological ordering.
- **Cloud Containers**: Evaluates `contains` structures. Inner nodes are assigned the parent node's ID in their `parentId` parameter to preserve hierarchical containment layouts.

---

## Related Documentation
- [Deterministic Parsers](parsers.md) — How code text is converted to UDM.
- [Layout Engine Guides](layout-engine.md) — Positional algorithms registration.
- [Renderer System](rendering.md) — React Flow mapping rules.
