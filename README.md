# Apple Container Sandbox

An AI SDK 7 sandbox provider backed by Apple Container Sandboxes.

This package is intended for workloads where AI SDK tools or generated code need
an isolated execution environment built from Docker-compatible images on hosts
with Apple Container support.

## Status

Early implementation. The package can create Apple Container-backed AI SDK
sandbox sessions, run commands, and read or write files inside the container.

## Install

```sh
pnpm add @lgrammel/apple-container-sandbox
```

## Usage

```ts
import { createAppleContainerSandbox } from "@lgrammel/apple-container-sandbox";

const appleContainerSandbox = createAppleContainerSandbox({
  image: "node:22",
  cwd: "/workspace",
});

const sandboxSession = await appleContainerSandbox.createSession();

try {
  await sandboxSession.writeTextFile({
    path: "/workspace/example.js",
    content: "console.log('Hello from the sandbox');",
  });

  const result = await sandboxSession.run({
    command: "node /workspace/example.js",
  });

  console.log(result.stdout.trim());
} finally {
  await sandboxSession.close();
}
```

## Requirements

- Node.js 20+
- AI SDK 7 (`vercel/ai`)
- Apple Container support on the host system
- Docker-compatible images for sandbox environments

## License

TBD
