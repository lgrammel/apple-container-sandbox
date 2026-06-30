# Apple Container Sandbox

An AI SDK 7 sandbox provider backed by Apple Container Sandboxes.

This package is intended for workloads where AI SDK tools or generated code need
an isolated execution environment built from Docker-compatible images on hosts
with Apple Container support.

## Status

Early scaffold. The package metadata and public API shape are in place, but
sandbox execution is not implemented yet.

## Install

```sh
pnpm add @lgrammel/apple-container-sandbox
```

## Usage

```js
import { createAppleContainerSandbox } from "@lgrammel/apple-container-sandbox";

const sandboxProvider = createAppleContainerSandbox({
  image: "node:22",
});
```

## Requirements

- Node.js 20+
- AI SDK 7 (`vercel/ai`)
- Apple Container support on the host system
- Docker-compatible images for sandbox environments

## License

TBD
