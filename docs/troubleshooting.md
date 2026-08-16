# Troubleshooting Guide

This document lists common issues encountered during setup, backend startup, or diagram generation, along with their solutions.

---

## 1. Installation & Build Failures

### Issue: Missing Node Modules or Package Conflicts
- **Symptoms**: `npm run dev` or `npm run start:dev` fails with "module not found" or compile errors.
- **Solution**: Clear cache and reinstall modules.
  ```bash
  # In backend/ or frontend/ directory
  rm -rf node_modules package-lock.json
  npm cache clean --force
  npm install
  ```

### Issue: TypeScript Compilation Error
- **Symptoms**: `npm run build` fails with TypeScript warnings about missing types.
- **Solution**: Ensure your typescript version matches `package.json` requirements. Verify you have run dependencies installation in both roots.

---

## 2. Server Startup & Network Issues

### Issue: Port Conflicts
- **Symptoms**: Backend fails to boot with `EADDRINUSE: address already in use :::3000`.
- **Solution**: 
  1. Kill the process running on port `3000`.
  2. Alternatively, configure a different port in the backend `.env`:
     ```env
     PORT=3001
     ```
  3. If you change the port, update the frontend `.env` to point to the new URL:
     ```env
     VITE_API_URL=http://localhost:3001/api/v1
     ```

### Issue: Frontend Unable to Reach Backend
- **Symptoms**: Frontend console logs `ERR_CONNECTION_REFUSED`. The connection status displays "offline".
- **Solution**:
  - Verify that the backend NestJS server is running using `npm run start:dev`.
  - Check that the `VITE_API_URL` environment variable is configured correctly.
  - Check that browser extension blockers are not stopping requests to `localhost`.

---

## 3. Parsing & Generation Failures

### Issue: Received "Empty Workspace" Diagram
- **Symptoms**: Renders a single node named "Workspace Nodes List" or "Empty Sequence Workspace".
- **Solution**: 
  - The input text did not contain valid elements matching the selected parser.
  - Review syntax rules for the selected sourceType. For example, flowchart parsers require arrow operators `->` to register connections.

### Issue: Auto-Detection Resolves to Incorrect sourceType
- **Symptoms**: Input code is parsed incorrectly because the engine matched the wrong parser.
- **Solution**:
  - Explicitly select the target diagram type using the UI selector (rather than relying on auto-detection).
  - When calling the API directly, provide the correct `sourceType` string parameter in the POST request body.

---

## 4. AI Service Issues

### Issue: AI Enhancement Warnings
- **Symptoms**: Backend logs `AI operations are disabled` or `AI extraction failed`.
- **Solution**:
  - Check that `AI_ENABLED=true` is set in the backend `.env`.
  - Ensure that valid keys (e.g. `AI_GEMINI_API_KEY` or `AI_OPENAI_API_KEY`) are present in `.env`.
  - **Note**: The system is designed to fall back to the deterministic parser if the AI enhancement layer fails, so diagram generation will still succeed.

---

## Related Documentation
- [Getting Started Guide](getting-started.md) — Environmental setups.
- [REST API Endpoints Reference](api.md) — Endpoint list.
- [System Limitations](limitations.md) — Design constraints.
