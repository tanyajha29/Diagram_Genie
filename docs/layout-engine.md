# Layout Engine

The Diagram Genie layout system applies positioning coordinates to normalized, coordinate-free Universal Diagram Model (UDM) graphs. It supports multiple active layout positioning algorithms.

---

## 1. Core Layout Architecture

The system uses a pluggable layout registration model:
- **`LayoutRegistry`** ([`core/diagram-engine/layout/registry/layout.registry.ts`](file:///C:/Users/jhata/.gemini/antigravity/scratch/Diagram_Genie/backend/src/core/diagram-engine/layout/registry/layout.registry.ts)): Stores positioning engines implementing the `ILayout` interface.
- **`ILayout` Contract**:
  ```typescript
  export interface ILayout {
    readonly id: string;
    layout(diagram: Diagram, options?: Record<string, any>): Promise<Diagram>;
  }
  ```

---

## 2. Layout Status Log

Below is the implementation status of available layout engines:

| Algorithm ID | Layout Strategy | Status | Current Usage |
| :--- | :--- | :--- | :--- |
| `grid` | Distributes nodes in a uniform grid grid layout | **Active** | Default fallback for all backend diagram requests |
| `radial` | Arranges nodes in concentric circles around a central root | **Active** | Default layout for `mindmap` diagram types |
| `tree` | Top-down vertical tree layout | **Active** | Registered but bypassed; default fallback is grid |
| `hierarchical` | Top-down horizontal/vertical hierarchy flow | **Active** | Registered but bypassed; default fallback is grid |
| `dag` | Directed acyclic graph layout | **Active** | Registered but bypassed; default fallback is grid |
| `force-directed` | Physics-based spring layout simulation | **Active** | Registered but bypassed; default fallback is grid |
| `semantic` | Multi-tier horizontal/vertical layered swimlanes | **Inactive/Orphaned** | Implemented in code but not registered in NestJS providers |

---

## 3. Active Algorithms (Live Backend Path)

Currently, the backend orchestrator utilizes the following layouts registered via [`DiagramEngineModule`](file:///C:/Users/jhata/.gemini/antigravity/scratch/Diagram_Genie/backend/src/core/diagram-engine/diagram-engine.module.ts):

### Grid Layout ([`grid.layout.ts`](file:///C:/Users/jhata/.gemini/antigravity/scratch/Diagram_Genie/backend/src/core/diagram-engine/layout/algorithms/grid.layout.ts))
Arranges all nodes in an evenly spaced grid format. Excellent for flat lists, ER schemas, and simple services.
- **Spacing Options**: Custom horizontal and vertical padding offsets are supported.

### Radial Layout ([`radial.layout.ts`](file:///C:/Users/jhata/.gemini/antigravity/scratch/Diagram_Genie/backend/src/core/diagram-engine/layout/algorithms/radial.layout.ts))
Designed specifically for mindmaps. Starts from a single root node and positions child elements in concentric circles outwards.
- **Angle Calculation**: Divided evenly among branch siblings.

---

## 4. Inactive Layout: SemanticLayout

The system contains a comprehensive layered layout engine inside [`semantic.layout.ts`](file:///C:/Users/jhata/.gemini/antigravity/scratch/Diagram_Genie/backend/src/core/diagram-engine/layout/algorithms/semantic.layout.ts).

> [!WARNING]
> **SemanticLayout is currently inactive/orphaned on the backend.**

### How it Works
1. **Tier Identification**: Scans node labels and semantic types, assigning them to rows:
   - `external` (Stripe, SendGrid APIs)
   - `presentation` (Frontend clients, UI)
   - `application` (Gateways, Load Balancers)
   - `business` (Application logic, microservices)
   - `data` (Postgres, Redis caches)
2. **Layer Rendering**: Places rows sequentially from top to bottom (external at top, databases at bottom) with custom padding offsets.
3. **Container Nesting**: Groups nested nodes under parent boundary boundaries.

### Why is it Inactive on the Backend?
- `SemanticLayout` is marked `@Injectable()` in its source file, but it is **not listed** in the providers list of `DiagramEngineModule` or imported in `DiagramModule`.
- Because it is never declared in any NestJS module, NestJS does not instantiate it.
- Its constructor (which registers itself to the `LayoutRegistry`) never executes, meaning `this.layoutRegistry.getLayout('semantic')` returns `undefined` at runtime.
- The `EngineOrchestrator` falls back to `grid` when `semantic` (or categories mapping to it) is requested.

---

## 5. Frontend Local Offline Fallback Layouts

When the backend application is offline, the frontend utilizes its own local layout script inside [`frontend/src/utils/layouter.ts`](file:///C:/Users/jhata/.gemini/antigravity/scratch/Diagram_Genie/frontend/src/utils/layouter.ts). 

Unlike the backend, the frontend local script **fully implements** type-specific layouts:
- **Sequence timelines**: Places participant lifelines at the top and scales message lines downward step-by-step.
- **Cloud Containers**: Performs bounding box calculations, shifting child coordinates relative to their parent container nodes.
- **Semantic Layering**: Performs vertical row assignments (`external` down to `data`) for general architecture graphs directly on the client canvas.

---

## Related Documentation
- [Architecture Deep Dive](architecture.md) — How layout fits into orchestrations.
- [Deterministic Parsers](parsers.md) — Base UDM graph creation.
- [Renderer Adapters & Shapes](rendering.md) — Node shapes and canvas sizes.
