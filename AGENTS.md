# AGENTS.md

Guidance for coding agents working in this repository.

## Repository

This is a pnpm monorepo for `@lgrammel/apple-container-sandbox`, an AI SDK 7
sandbox provider backed by Apple Container Sandboxes.

- `packages/apple-container-sandbox`: npm package source and package README
- `apps/example`: local example app consuming the package through the workspace
- Root `README.md`: user-facing project overview only

The implementation is currently an early scaffold. `createAppleContainerSandbox`
returns a provider object, and `createSandbox()` intentionally throws
`AppleContainerSandboxNotImplementedError`.

## Commands

- Install dependencies: `pnpm install`
- Run the example: `pnpm example`
- Run tests: `pnpm test`
- Pack the package: `pnpm pack:package`

## Coding Guidelines

- Keep root `README.md` user-facing. Put development notes, repo workflow, and
  agent instructions in this file instead.
- Keep public API changes reflected in both
  `packages/apple-container-sandbox/src/index.js` and
  `packages/apple-container-sandbox/src/index.d.ts`.
- Keep `packages/apple-container-sandbox/REQUIREMENTS.md` accurate, concise,
  and non-contradictory. Update it whenever code changes affect runtime,
  public API, packaging, environment, or sandbox behavior requirements.
- Keep package usage examples aligned between the root README,
  `packages/apple-container-sandbox/README.md`, and `apps/example`.
- Prefer small, focused changes that preserve the existing ESM JavaScript style.
- Add or update tests with implementation changes once behavior extends beyond
  the current scaffold.

## Package Notes

- Root package manager is `pnpm@11.9.0`.
- Runtime target is Node.js 20 or newer.
- Published package files are controlled by
  `packages/apple-container-sandbox/package.json`.
- The package repository metadata points to
  `https://github.com/lgrammel/npm-container-sandbox`.
