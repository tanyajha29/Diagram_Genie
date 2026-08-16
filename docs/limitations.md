# Known Limitations & Technical Debt

This document details the known design constraints, redundancies, and verification gaps in the Diagram Genie codebase.

---

## 1. Architectural Redundancies

### Inactive Stage-Based Pipeline
- **Description**: The codebase contains two pipeline configurations. [`diagram-engine.module.ts`](file:///C:/Users/jhata/.gemini/antigravity/scratch/Diagram_Genie/backend/src/core/diagram-engine/diagram-engine.module.ts) registers an extensible stage-based workflow containing validation, file detection, parsing, layout, and rendering stages.
- **Limitation**: This stage-based pipeline is **inactive**. The controller logic instead calls the `EngineOrchestrator` directly, which runs hardcoded procedural steps. This results in unused code files remaining in the repository.

### SemanticLayout Registration Gap
- **Description**: [`SemanticLayout`](file:///C:/Users/jhata/.gemini/antigravity/scratch/Diagram_Genie/backend/src/core/diagram-engine/layout/algorithms/semantic.layout.ts) implements semantic swimlanes (external services, database layers) in the backend.
- **Limitation**: The class is marked `@Injectable()` but is **never registered** in the providers list of any NestJS module. Consequently, it is never instantiated or registered in the `LayoutRegistry`, and requests fallback to the grid layout.

### Parser & Layout Code Duplication
- **Description**: The application runs two separate parser/layouter engines: one in the backend (NestJS) and one in the frontend (TypeScript fallback).
- **Limitation**: Having two independent parsers and layouters results in duplicate code. Features added to a backend parser (e.g. new SQL constraints) must be manually ported to the frontend fallback scripts to guarantee consistent rendering.

---

## 2. Verification & Testing Gaps

### Export Parity Gap
- **Description**: The frontend provides SVG and PNG export actions using the `html-to-image` package.
- **Limitation**: No automated tests verify that exported images match the canvas preview exactly. Differences in styles, fonts, and container hierarchies can occur in exported files.

### Visual Regression Gap
- **Description**: The testing suite validates AST schemas and UDM JSON models.
- **Limitation**: There is no visual regression test suite. Layout positioning bugs (such as overlapping elements or hidden arrows) are not caught by automated tests.

---

## 3. Diagram-Specific Limitations

- **UML Class Diagrams**: Class properties and operations are parsed only if class blocks are defined inside UML Sequence scripts. Basic architecture classes render only clean name blocks.
- **UML Sequence Diagrams**: The sequence parser does not support fragment blocks (e.g. conditional `alt`/`else` boxes, `loop` iterations, or optionals).
- **Cloud Bounding Boxes**: Automated sizing offsets for nested subnet container borders are computed using hardcoded spacing. Highly dense nested containment blocks can result in overlapping boundaries.

---

## Related Documentation
- [Architecture Deep Dive](architecture.md) — Live trace detail lists.
- [Testing Suite](testing.md) — Automated coverage details.
- [Project Roadmap](roadmap.md) — Future improvement plans.
