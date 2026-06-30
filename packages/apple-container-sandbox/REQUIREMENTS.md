# Requirements

## Runtime

- Consumers must run Node.js 20 or newer.
- Consumers must use ESM imports for the published package entry point.
- Hosts must provide the Apple Container CLI as `container`, unless a custom
  `containerBinary` option is supplied.
- Sandbox images must be Docker-compatible and provide `/bin/sh`.

## Packaging

- Package source must be TypeScript in `src/index.ts`.
- `tsc` must emit the package entry point and declarations to `dist`.
- Published package exports must point to `dist/index.js` and
  `dist/index.d.ts`.

## Provider API

- `createAppleContainerSandbox(options?)` must return a provider named
  `apple-container-sandbox`.
- The provider must preserve the supplied options object.
- Supported option fields are `image`, `cwd`, `env`, `containerBinary`,
  `containerArgs`, `name`, and `keepContainer`.
- `image` defaults to `alpine:latest`.
- `cwd` defaults to `/workspace`.

## Sandbox Sessions

- `createSandbox()` must create and start a long-lived Apple container.
- Sandbox commands must execute through `container exec` and `/bin/sh -lc`.
- Session-level `env` values must apply to commands, and per-command `env`
  values must take precedence.
- `readFile`, `readBinaryFile`, `readTextFile`, `writeFile`,
  `writeBinaryFile`, `writeTextFile`, `spawn`, and `run` must match the AI SDK
  `Experimental_SandboxSession` method shapes.
- File reads must return `null` when the path does not exist.
- File writes must create parent directories and overwrite existing files.
- `run()` must return `exitCode`, `stdout`, and `stderr` without throwing for
  non-zero command exits.
- `close()` must stop and delete the Apple container unless `keepContainer` is
  true.
