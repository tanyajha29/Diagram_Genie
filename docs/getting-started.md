# Getting Started

This guide walks you through setting up Diagram Genie for local development, configuring environment variables, running the frontend and backend, and executing tests.

---

## Prerequisites

Ensure you have the following software installed:
- **Node.js**: `v18.0.0` or higher (LTS `v20.x` recommended).
- **npm**: `v9.0.0` or higher.
- **Git**: For cloning the repository.

---

## 1. Setup & Installation

Clone the repository and install dependencies for both the frontend and backend applications:

```bash
# Clone the repository
git clone <repository_url>
cd Diagram_Genie

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

## 2. Environment Configuration

### Backend Configuration
Create a `.env` file in the `backend/` directory.

```bash
# In backend/ directory
cp .env.example .env
```

Review and adjust the environment variables:

```env
PORT=3000
API_PREFIX=api

# AI Service Configuration
AI_ENABLED=true
AI_DEFAULT_PROVIDER=gemini # Options: gemini, openai, anthropic, groq, ollama

# AI API Credentials (Optional - system falls back to rule-based parser if empty)
AI_GEMINI_API_KEY=your_gemini_api_key_here
AI_OPENAI_API_KEY=your_openai_api_key_here
AI_ANTHROPIC_API_KEY=your_anthropic_api_key_here
AI_GROQ_API_KEY=your_groq_api_key_here

# Ollama Endpoint Configuration
AI_OLLAMA_ENDPOINT=http://localhost:11434
```

### Frontend Configuration
Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:3000/api/v1
```

---

## 3. Running the Applications

### Start the Backend
From the `backend/` folder, run the NestJS development server:

```bash
# Runs the NestJS server with hot-reload enabled
npm run start:dev
```
The backend API is now running on [http://localhost:3000/api/v1](http://localhost:3000/api/v1).  
Swagger API interactive documentation is available at [http://localhost:3000/api/docs](http://localhost:3000/api/docs).

### Start the Frontend
From the `frontend/` folder in a separate terminal, run the Vite development server:

```bash
# Starts the Vite frontend server
npm run dev
```
The React frontend is now accessible at [http://localhost:5173](http://localhost:5173).

---

## 4. Available Project Scripts

Here are the scripts defined in each `package.json` that you can run:

### Backend Scripts (`backend/package.json`)
- `npm run build`: Compiles the NestJS application to JavaScript in the `dist/` directory.
- `npm run start`: Starts the compiled application in production mode.
- `npm run start:dev`: Starts the NestJS application in watch mode (hot-reload).
- `npm run start:debug`: Starts NestJS with a Node inspector debug port.
- `npm test`: Runs the Jest unit and regression tests.
- `npm run test:watch`: Runs tests in watch mode.
- `npm run test:cov`: Generates a test code coverage report.
- `npm run test:e2e`: Runs Jest end-to-end integration tests (located in the `test/` directory).
- `npm run lint`: Scans code files with ESLint.
- `npm run format`: Standardizes code formatting with Prettier.

### Frontend Scripts (`frontend/package.json`)
- `npm run dev`: Boots the Vite dev server.
- `npm run build`: Compiles TypeScript files and builds the optimized frontend bundle in `dist/`.
- `npm run lint`: Performs rapid code checking using the Rust-powered Oxlint linter.
- `npm run preview`: Launches a local server to preview the built production bundle.

---

## 5. Troubleshooting & Basic Checks

- **Port Conflicts**: If port `3000` is already in use by another process, change `PORT` in the backend `.env` file and update `VITE_API_URL` in the frontend `.env`.
- **CORS Errors**: The backend application calls `app.enableCors()` globally in `main.ts`, allowing all cross-origin requests. Ensure your browser is not blocking local developer requests.
- **AI Fallback Warnings**: If `AI_ENABLED=true` but no API keys are provided in the backend, the `AIManager` will fail validation on startup, and `AiEnhancementService` will log warning messages and fall back silently to rule-based parsed diagrams. Diagrams will still generate successfully.

---

## Related Documentation
- [System Architecture](architecture.md) — Production flow and adapters overview.
- [REST API Reference](api.md) — Complete endpoint schemas.
- [Troubleshooting Manual](troubleshooting.md) — Comprehensive guide to resolving environment errors.
