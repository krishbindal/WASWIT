# WASWIT Local MTE Run Guide

## Environment
- Node.js: v24.11.1
- npm: 11.6.2
- Rust: 1.98.1
- wasm-pack: 0.15.0
- OS: Windows NT 10.0.26300.0 (64-bit)

## First-Time Setup
```bash
cd frontend
npm install
```

## WASM Build
```bash
cd frontend
npm run build:wasm
```

## Start Application
```bash
cd frontend
npm run dev
```

## Local URL
http://localhost:3000

## Developer Playground
http://localhost:3000/developer

## Demo Procedure
1. Open terminal.
2. Navigate to `C:\Users\krish\Desktop\WASWIT\frontend`
3. Run `npm run dev`
4. Open browser to `http://localhost:3000/developer`
5. Select `Merge Sort` with input `5000`
6. Click "Run Workload"
7. Observe the Execution Time, Selection Overhead, and Selected Runtime.

## Troubleshooting
- If `npm run build` fails with a TypeScript error on `page.tsx`, this is a known issue from a previous lint-fix phase. It does not block `npm run dev`.
- Ensure `wasm-pack` is globally installed if building WASM fails.

## Shutdown
Press `Ctrl+C` in the terminal running the dev server.
