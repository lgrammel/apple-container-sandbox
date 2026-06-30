# AGENTS.md

Guidance for coding agents working in this repository.

## Repository

This is a pnpm monorepo for `@lgrammel/apple-container-sandbox`, an AI SDK 7
sandbox provider backed by Apple Container Sandboxes.

- `packages/apple-container-sandbox`: npm package source and package README
- `apps/example`: local example app consuming the package through the workspace
- Root `README.md`: user-facing project overview only

The implementation is TypeScript source compiled to ESM JavaScript in `dist`.
`createAppleContainerSandbox` returns a provider object whose `createSandbox()`
creates an AI SDK-compatible Apple Container-backed sandbox session.

## Commands

- Install dependencies: `pnpm install`
- Run the example: `pnpm example`
- Build packages and apps: `pnpm build`
- Format files: `pnpm format`
- Check formatting: `pnpm format:check`
- Run lint: `pnpm lint`
- Run tests: `pnpm test`
- Pack the package: `pnpm pack:package`

## Coding Guidelines

- Keep root `README.md` user-facing. Put development notes, repo workflow, and
  agent instructions in this file instead.
- Keep public API changes reflected in
  `packages/apple-container-sandbox/src/index.ts`; generated declarations come
  from `tsc`.
- Keep `packages/apple-container-sandbox/REQUIREMENTS.md` accurate, concise,
  and non-contradictory. Update it whenever code changes affect runtime,
  public API, packaging, environment, or sandbox behavior requirements.
- Keep package usage examples aligned between the root README,
  `packages/apple-container-sandbox/README.md`, and `apps/example`.
- Prefer small, focused changes that preserve the existing ESM TypeScript style.
- Add or update Vitest tests with implementation changes.
- Name unit tests `filename.test.ts`.
- Name type tests `filename.test-d.ts`.

## Package Notes

- Root package manager is `pnpm@11.9.0`.
- Runtime target is Node.js 20 or newer.
- TypeScript is installed at the workspace root and package output is generated
  with `tsc`.
- Formatting uses `oxfmt`; linting uses `oxlint`.
- Unit and type tests use Vitest.
- Published package files are controlled by
  `packages/apple-container-sandbox/package.json`.
- The package repository metadata points to
  `https://github.com/lgrammel/npm-container-sandbox`.
