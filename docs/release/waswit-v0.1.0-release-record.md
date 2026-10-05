# WASWIT v0.1.0 Release Record

## Release Identity

Package:
waswit

Version:
0.1.0

Status:
Developer Preview / Package Ready / Not Published

Certified Repository Commit:
193c71ae75422a048cc6ef89eb29262b0ccf7911

Branch:
main

## Research Policy

Policy:
1.0.0-final

Policy SHA-256:
c8c330ebb91abf7757d35a7bd0ad9a03214f0866f77d74107a21f0056b661ef9

## Research Evidence

Raw artifact SHA:
e26be7d99266c17f8aa4f80ae62a364904720d32393bc276caeedc68e3901220

SAP commit:
06b5aa20dbd43f3dacb2dd096db1c89cca95b530

Phase 5F analysis:
129419e2c231b1c59a05cedb3ff9be62fe27ea98

Verification base:
c9f0025c4ca08337d90a7681c3647d64b4f4d554

## SDK

Public APIs:
- waswitRun()
- waswitPreload()

Supported workloads:
- matrix
- sort
- sha256

## Package

- CJS bundle
- ESM bundle
- TypeScript declarations
- prebuilt WASM

## Validation

Record ACTUAL results:

- Vitest: 142 passed (142 tests passing in frontend)
- Playwright: 13 passed (13 E2E test suites passing)
- TypeScript: 0 errors in SDK
- build: Next.js compiled successfully
- Rust: wasm-pack build successful
- WASM: Precompiled included in dist/
- package build: tsup bundling successful
- npm pack: Generated 17.7 kB tarball
- external consumer: Vite application integration successful

## Known Limitations

- browser-oriented package
- Node.js unbundled CommonJS limitation due to import.meta.url
- empirical/environment-specific policy (calibrated to Blink/Chromium 138)
- supported workload families are limited
- package not yet published to npm

## Research Integrity

Developer SDK and package work did not modify the locked Phase 5 scientific evidence.
