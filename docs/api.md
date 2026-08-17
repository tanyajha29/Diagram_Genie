# REST API Endpoints Reference

Diagram Genie features a comprehensive REST API to generate diagrams, apply layout positioning, inspect system metadata, and test AI models. 

---

## 1. Global Prefix & Versioning

By default:
- Global Routing Prefix: `/api` (configurable via `API_PREFIX`)
- URI-based versioning is active, pointing to `/v1` by default.
- Base URL format: `http://localhost:3000/api/v1`

---

## 2. API Endpoints Table

| Method | Endpoint | Controller | Purpose |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/v1/diagrams/generate` | `DiagramController` | Parse code and return positioned UDM & adapted React Flow diagram. |
| **POST** | `/api/v1/diagrams/layout` | `DiagramController` | Apply layout algorithm updates to an existing UDM structure. |
| **GET** | `/api/v1/diagrams/tools` | `DiagramController` | Retrieve the catalog checklist of all active diagram tools. |
| **GET** | `/api/v1/diagrams/categories` | `DiagramController` | Retrieve list of all diagram categories. |
| **GET** | `/api/v1/diagrams/ai-metrics` | `DiagramController` | Retrieve real-time performance indicators of the AI layer. |
| **GET** | `/api/v1/ai/health` | `AiTestingController` | Retrieve checklist of healthy, configured AI providers. |
| **POST** | `/api/v1/ai/test` | `AiTestingController` | Request raw model text responses from a specific provider. |
| **POST** | `/api/v1/ai/test/json` | `AiTestingController` | Request validated & repaired JSON content from a specific provider. |
| **POST** | `/api/v1/ai/test/architecture` | `AiTestingController` | Send markdown README text and retrieve structured architecture nodes JSON. |
| **POST** | `/api/v1/ai/test/database` | `AiTestingController` | Send SQL DDL and retrieve structured database model JSON. |
| **POST** | `/api/v1/ai/test/flow` | `AiTestingController` | Send flow script and retrieve flowchart step node JSON. |

---

## 3. Endpoints Details

### POST /api/v1/diagrams/generate
Parses code text into normalized, laid-out node maps.

#### Request Body Schema (Zod Validation: `generateDiagramSchema`)
```json
{
  "source": "[Client] -> [Server]",  // REQUIRED: Raw source code text
  "sourceType": "architecture",      // OPTIONAL: Parser type (SQL, architecture, mindmap, etc.)
  "filename": "infra.txt",          // OPTIONAL: Filename for auto-detection
  "mimeType": "text/plain",          // OPTIONAL: MIME type for auto-detection
  "layoutEngineId": "grid",          // OPTIONAL: Layout engine (grid, radial)
  "options": {}                      // OPTIONAL: Configuration parameters
}
```

#### Response Payload (Status: 201 Created)
```json
{
  "diagram": {
    "id": "architecture-parser_172195000",
    "title": "System Diagram",
    "nodes": [
      {
        "id": "client",
        "label": "Client",
        "type": "actor",
        "position": { "x": 0, "y": 0 },
        "data": {}
      },
      {
        "id": "server",
        "label": "Server",
        "type": "architecture",
        "position": { "x": 200, "y": 0 },
        "data": {}
      }
    ],
    "edges": [
      {
        "id": "edge_1",
        "source": "client",
        "target": "server",
        "type": "default",
        "animated": true
      }
    ],
    "metadata": {
      "createdAt": "2026-08-16T16:30:00Z",
      "updatedAt": "2026-08-16T16:30:00Z",
      "engineVersion": "1.0",
      "sourceType": "architecture-parser"
    }
  },
  "reactFlow": {
    "nodes": [
      { "id": "client", "type": "actor", "position": { "x": 0, "y": 0 }, "data": { "label": "Client" } },
      { "id": "server", "type": "architecture", "position": { "x": 200, "y": 0 }, "data": { "label": "Server" } }
    ],
    "edges": [
      { "id": "edge_1", "source": "client", "target": "server", "animated": true }
    ]
  },
  "detectedType": "PLAIN_TEXT",
  "exportedFormats": {
    "mermaid": "graph TD\n  client[Client]\n  server[Server]\n  client --> server",
    "cytoscape": []
  },
  "warnings": []
}
```

---

### POST /api/v1/diagrams/layout
Applies a new positioning layout algorithm to an already generated UDM diagram.

#### Request Body Schema (Zod Validation: `layoutRequestSchema`)
```json
{
  "diagram": {
    "id": "custom_diagram_id",
    "title": "System Diagram",
    "nodes": [
      { "id": "n1", "label": "A", "type": "default", "position": { "x": 0, "y": 0 }, "data": {} },
      { "id": "n2", "label": "B", "type": "default", "position": { "x": 0, "y": 0 }, "data": {} }
    ],
    "edges": [
      { "id": "e1", "source": "n1", "target": "n2", "type": "default", "animated": true }
    ],
    "metadata": { "sourceType": "architecture-parser" }
  },
  "layoutEngineId": "radial", // REQUIRED: grid, radial
  "options": {
    "padding": 50
  }
}
```

#### Response Payload (Status: 201 Created)
Returns updated JSON containing re-positioned `diagram` node coordinates and the adapted `reactFlow` node positions.

---

### GET /api/v1/diagrams/tools
Retrieves details of supported source configurations.

#### Response Payload (Status: 200 OK)
```json
[
  {
    "id": "flowchart",
    "name": "Flowchart Generator",
    "description": "Create processes and decisions using standard flowchart syntax.",
    "category": "flowchart",
    "supportedExtensions": [".flow", ".txt"]
  }
]
```

---

### GET /api/v1/diagrams/ai-metrics
Retrieves AI latency histograms and validation error frequencies.

#### Response Payload (Status: 200 OK)
```json
{
  "totalTransactions": 10,
  "successfulTransactions": 8,
  "failedTransactions": 2,
  "averageLatencyMs": 425.5,
  "providerDistribution": {
    "gemini": 6,
    "openai": 4
  },
  "errorBreakdown": {
    "Schema validation failed": 2
  }
}
```

---

## Related Documentation
- [Architecture Deep Dive](architecture.md) — Production orchestration tracing.
- [Deterministic Parsers](parsers.md) — Base syntax validators.
- [Frontend Guide](frontend.md) — Client connection controls.
