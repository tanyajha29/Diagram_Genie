# Production Deployment Guide

This guide details the production deployment architecture, setup, environment configurations, and verification checks for DiagramGenie.

## 1. Deployment Architecture

```text
       [ Users / Web Browsers ]
                  ↓
          HTTPS SPA Routing
                  ↓
       [ Vercel CDN (Frontend) ]
        React / Vite Single-Page App
                  ↓
       Cross-Origin API requests (CORS)
                  ↓
     [ Render Web Service (Backend) ]
       NestJS Node.js Application
                  ↓
       [ Diagram Compilation Engine ]
         Lexers, Parsers & Layout algorithms
```

---

## 2. Frontend Deployment (Vercel)

The frontend is a React application built with TypeScript and Vite. It is deployed as a static Single Page Application (SPA).

- **Hosting Platform**: Vercel
- **Repository Integration**: Connected to the `main` branch of the GitHub repository
- **Root Directory**: `frontend`
- **Build Command**: `npm run build` (resolves to `tsc -b && vite build`)
- **Output Directory**: `dist` (or `frontend/dist` depending on build location)
- **SPA Fallback Routing**: Managed by `vercel.json` rewrites to route requests back to `index.html`.

### Environment Variables

| Variable Name | Description | Example / Recommended Value |
| :--- | :--- | :--- |
| `VITE_API_URL` | The secure production URL of the Render backend service. | `https://diagram-genie-backend.onrender.com/api/v1` |

---

## 3. Backend Deployment (Render)

The backend is a NestJS application built with TypeScript, listening dynamically on the port specified by the environment and binding to all interface hosts for external service accessibility.

- **Hosting Platform**: Render (Web Service)
- **Repository Integration**: Connected to the `main` branch of the GitHub repository
- **Root Directory**: `backend`
- **Build Command**: `npm install && npm run build` (resolves to installing deps and executing `nest build`)
- **Start Command**: `npm run start:prod` (resolves to `node dist/main`)
- **Port Binding**: Automatically binds to `process.env.PORT` (defaults to port `3000`)
- **Host Binding**: Binds explicitly to host IP `0.0.0.0`

### Environment Variables

| Variable Name | Description | Example / Recommended Value |
| :--- | :--- | :--- |
| `PORT` | Render's web service port. Set automatically by Render. | `10000` (automatic) |
| `NODE_ENV` | Mode of execution context. | `production` |
| `CORS_ORIGIN` | Comma-separated list of allowed frontend origins for CORS. | `https://diagram-genie.vercel.app` or `*` |
| `API_PREFIX` | Base URI routing prefix path. | `api` |

---

## 4. Verification & Health Monitoring

### Health Endpoint
The backend includes a health monitor endpoint that returns a status payload to indicate active readiness:

- **Path**: `/api/v1/health`
- **Method**: `GET`
- **Expected Status**: `200 OK`
- **Expected Payload**: `{"status": "ok"}`

### Verification Checklist
1. Deploy the backend on Render and wait for the service to start.
2. Confirm API responsiveness by calling the health endpoint: `https://<backend-domain>/api/v1/health`.
3. Set `VITE_API_URL` on the Vercel project to point to the secure Render endpoint.
4. Deploy the frontend on Vercel.
5. Open the Vercel URL and check console logs to verify that no local CORS issues exist.

---

## 5. Rollback & Troubleshooting

### Troubleshooting
- **CORS blockages**: Verify that `CORS_ORIGIN` matches the exact deployed domain of your Vercel frontend.
- **Port issues on Render**: Ensure NestJS reads the dynamic `PORT` value and binds to `0.0.0.0`.
- **404 on routing refresh**: Ensure `vercel.json` rewrites are present and routing fallback is active.

### Rollback Strategy
If a deployment fails, use Vercel and Render dashboards to immediately redeploy the last stable Git commit.
