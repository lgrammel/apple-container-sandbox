# Requirements

## Current Package Scaffold

- Consumers must run Node.js 20 or newer.
- Consumers must use ESM imports for the published package entry point.
- `createAppleContainerSandbox(options?)` must return a provider named
  `apple-container-sandbox`.
- The provider must preserve the supplied options object.
- Supported option fields are `image`, `cwd`, and `env`.
- `createSandbox()` is not implemented yet and must reject with
  `AppleContainerSandboxNotImplementedError`.

## Intended Sandbox Execution

These requirements apply once sandbox execution is implemented:

- The host must support Apple Container Sandboxes.
- Sandbox images must be Docker-compatible.
- The provider is intended to integrate with AI SDK 7 sandbox workflows.
