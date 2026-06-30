# Apple Container Sandbox

An AI SDK 7 sandbox integration for Apple Container Sandboxes that run Docker
images.

This project is intended to provide a sandbox provider for
[`vercel/ai`](https://github.com/vercel/ai), backed by Apple Container
Sandboxes. It targets workloads where AI SDK tools or generated code need an
isolated execution environment built from Docker images.

## Status

Early project scaffold. Implementation details and usage examples will be added
as the integration is built out.

## Goals

- Integrate with AI SDK 7 sandbox APIs.
- Run sandboxed workloads with Apple Container Sandboxes.
- Use Docker images as the sandbox execution environment.
- Keep the provider interface small and aligned with AI SDK conventions.

## Requirements

- AI SDK 7 (`vercel/ai`)
- Apple Container support on the host system
- Docker-compatible images for sandbox environments

## License

TBD
