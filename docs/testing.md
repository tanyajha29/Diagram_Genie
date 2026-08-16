# Testing Suite

This document covers the testing infrastructure for the Diagram Genie backend, including running test suites, test categories, regression verifications, and documented testing gaps.

---

## 1. Test Framework & Setup

Diagram Genie uses **Jest** as its primary test runner in the backend. 

### Running Tests
Execute these commands inside the `backend/` directory:

```bash
# Run all unit and regression test suites
npm test

# Run tests in watch mode
npm run test:watch

# Run end-to-end integration tests
npm run test:e2e

# Generate test coverage reports
npm run test:cov
```

---

## 2. Test Suites Overview

The backend has three registered test suites:

### Unit Tests ([`core/diagram-engine/parsers/tests/parser.spec.ts`](file:///C:/Users/jhata/.gemini/antigravity/scratch/Diagram_Genie/backend/src/core/diagram-engine/parsers/tests/parser.spec.ts))
Verifies the tokenization logic (Lexer), classification rules (NodeClassifier), and basic diagram assembly across the default parsers (Architecture, SQL, Flow, Markdown).

### Regression & Parser Tests ([`core/diagram-engine/tests/parsers.spec.ts`](file:///C:/Users/jhata/.gemini/antigravity/scratch/Diagram_Genie/backend/src/core/diagram-engine/tests/parsers.spec.ts))
Ensures stability across the parser catalog. It contains regression tests verifying:
- **Mindmap Support**: Verifies that the `MarkdownParser` supports the `mindmap` sourceType alias.
- **Mindmap Tree Generation**: Ensures that bulleted markdown outlines are parsed into a tree structure.
- **SQL Standalone FK Handling**: Verifies that `SqlParser` sets `foreignKey=true` for fields defined in standalone `FOREIGN KEY` constraints, in addition to inline `REFERENCES` constraints.
- **Prisma Schema Relations**: Verifies that `PrismaParser` parses models, fields, and `@relation` links.
- **Cloud DSL Containment**: Verifies that parent container links (`parentId`) are mapped correctly.
- **UML Sequence Timeline Constraints**: Verifies actor sequence timelines and line types (dashed vs solid).

### End-to-End Integration Tests ([`test/app.e2e-spec.ts`](file:///C:/Users/jhata/.gemini/antigravity/scratch/Diagram_Genie/backend/test/app.e2e-spec.ts))
Spins up a local NestJS application instance using `supertest` to verify base HTTP controller endpoints and ensure routes return correct response headers.

---

## 3. Verified Test Results

Running the full suite locally prints the following output, confirming that all 32 tests across 3 suites execute successfully:

```text
PASS  src/core/ai/tests/ai-module.spec.ts
PASS  test/app.e2e-spec.ts
PASS  src/core/diagram-engine/tests/parsers.spec.ts
PASS  src/core/diagram-engine/parsers/tests/parser.spec.ts

Test Suites: 3 passed, 3 total
Tests:       32 passed, 32 total
Snapshots:   0 total
Time:        5.245 s
Ran all test suites.
```

---

## 4. Current Testing Gaps

While core parser logic is tested, the following verification gaps exist:

- **Visual Regression Testing**: There are no automated visual regression tests (e.g. using Playwright or Puppeteer screenshots) to confirm that custom React Flow nodes render correctly.
- **Export Fidelity Verification**: No tests exist to programmatically validate exported SVG or PNG buffers against their canvas preview benchmarks.
- **Full Diagram Fixture Suites**: Comprehensive integration suites verifying edge-case inputs for complex cloud topologies or large swagger files have not been implemented.

---

## Related Documentation
- [Deterministic Parsers](parsers.md) — Parser definitions.
- [Layout Engine Guides](layout-engine.md) — Spatial algos.
- [Troubleshooting Manual](troubleshooting.md) — Build compilation diagnostics.
