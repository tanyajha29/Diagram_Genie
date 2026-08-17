# Project Roadmap

This roadmap outlines the milestones completed, current focus areas, and future plans for the Diagram Genie project.

---

## 1. Completed Milestones

The following features have been implemented and verified:

- **Build Stabilization**: Fixed TypeScript and NestJS compilation errors in both the frontend and backend.
- **Relational Column Schemas**: Standardized database diagram nodes to use the canonical `ColumnInfo` array structure inside `data.columns`.
- **Foreign Key Parser Enhancements**: Added support for inline column reference parser rules, standalone constraints, and alter table constraints in the SQL parser.
- **Mindmap Integration**: Verified the `mindmap` sourceType alias, integrated it into `MarkdownParser`, and configured it to use radial layouts by default.
- **Regression Testing**: Added automated unit and integration tests for mindmaps, database foreign keys, and cloud nesting logic.

---

## 2. In Progress / Needs Improvement

The following items are active focus areas:

- **Stage Pipeline decision**: Decide whether to migrate the backend to the stage-based `GenerationPipeline` architecture or remove the orphaned code files from the repository to reduce technical debt.
- **Export & Canvas Parity**: Run a comprehensive audit across all 11 diagram types to ensure that SVG and PNG exports match their interactive editor representations exactly.
- **Visual Design System**: Standardize the CSS styling classes across all node types on the canvas to ensure unified background overlays, borders, and margins.
- **Improved Sequence Diagrams**: Add support for fragment blocks (e.g. conditional branches, loops, optionals) in the sequence diagram renderer.
- **Cloud Containment Calculations**: Improve layout offsets for nested cloud groups when nodes are dynamically dragged on the canvas.
- **Docker Compose Node Styling**: Expand the docker parser to render exposed ports and environment variables inside container shapes.

---

## 3. Future Goals

The following items are planned for future releases:

- **Visual Regression Suite**: Set up Playwright or Puppeteer snapshot tests to automatically detect visual canvas bugs.
- **Interactive Schema Editor**: Allow users to click and drag new database columns directly on the diagram canvas, generating the corresponding SQL DDL statements in the editor panel.
- **Real-time Collaboration**: Support multi-user collaborative editing on diagram workspaces using WebSockets.

---

## Related Documentation
- [Contribution Guidelines](contributing.md) — How to add new features.
- [System Limitations](limitations.md) — Detailed technical debt.
- [Architecture Deep Dive](architecture.md) — System flow.
