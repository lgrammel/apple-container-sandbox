# Requirements

## Runtime

- Consumers must run Node.js 22 or newer.
- Consumers must use ESM imports for the published package entry point.
- Hosts must provide the Apple Container CLI as `container`, unless a custom
  `containerBinary` option is supplied.
- Sandbox images must be Docker-compatible and provide `/bin/sh`.

## Packaging

- Package source must be TypeScript in `src`.
- `tsc` must emit the package entry point and declarations to `dist`.
- Published package exports must point to `dist/index.js` and
  `dist/index.d.ts`.
- Published package dependencies must include `@ai-sdk/harness`.
- Published package metadata must declare the MIT license and point repository,
  homepage, and bug URLs at `https://github.com/lgrammel/apple-container-sandbox`.
- Package versioning and release notes must be managed with Changesets.

## Sandbox API

- `createAppleContainerSandbox(options?)` must return a sandbox named
  `apple-container-sandbox`.
- Returned sandboxes must implement the AI SDK `HarnessV1SandboxProvider`
  contract with specification version `harness-sandbox-v1`.
- The sandbox must preserve the supplied options object.
- Supported option fields are `image`, `cwd`, `env`, `containerBinary`,
  `containerArgs`, `memory`, `ports`, `name`, and `keepContainer`.
- `image` defaults to `alpine:latest`.
- `cwd` defaults to `/workspace`.
- `memory`, when supplied, must be passed to `container create` with
  `--memory`.
- `ports` defaults to an empty array.
- `ports` values must be unique in the normalized session surface and must be
  valid TCP port numbers.

## Sandbox Sessions

- `createSession()` must create and start a long-lived Apple container.
- `createSession({ sessionId })` must use `sessionId` as the container id when
  no explicit `name` option is configured.
- `createSession({ onFirstCreate })` must run the hook once after container
  startup with the restricted sandbox session surface.
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
- `stop()` must stop and delete the Apple container unless `keepContainer` is
  true.
- Harness session `destroy()` must be the same cleanup function as `stop()`.
- Configured ports must be passed to `container create` with `--publish` and
  published on `127.0.0.1` with the same host and container port.
- `getPortUrl()` must resolve configured ports to local URLs and must reject
  unconfigured ports with `HarnessCapabilityUnsupportedError`.
