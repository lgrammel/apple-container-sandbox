# Apple Container Sandbox

An AI SDK 7 sandbox integration for Apple Container Sandboxes that run Docker
images.

This project is intended to provide a sandbox provider for
[`vercel/ai`](https://github.com/vercel/ai), backed by Apple Container
Sandboxes. It targets workloads where AI SDK tools or generated code need an
isolated execution environment built from Docker images.

## Workspace

This repository is a pnpm monorepo:

- `packages/apple-container-sandbox`: npm package published as
  `@lgrammel/apple-container-sandbox`
- `apps/example`: local example app that consumes the package through the
  workspace

The GitHub repository is
[`lgrammel/npm-container-sandbox`](https://github.com/lgrammel/npm-container-sandbox).

## Status

Early project scaffold. The package metadata and workspace layout are in place.
Implementation details and usage examples will be added as the integration is
built out.

## Goals

- Integrate with AI SDK 7 sandbox APIs.
- Run sandboxed workloads with Apple Container Sandboxes.
- Use Docker images as the sandbox execution environment.
- Keep the provider interface small and aligned with AI SDK conventions.

## Requirements

- Node.js 20+
- pnpm
- AI SDK 7 (`vercel/ai`)
- Apple Container support on the host system
- Docker-compatible images for sandbox environments

## Development

```sh
pnpm install
pnpm example
```

## License

TBD
