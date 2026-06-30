# @lgrammel/apple-container-sandbox

AI SDK sandbox provider backed by Apple Container Sandboxes.

## Status

This package implements the AI SDK sandbox session shape using the Apple
Container CLI. Each session creates a long-lived container from a
Docker-compatible image, runs commands with `container exec`, and removes the
container when the session is closed.

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

## Options

- `image`: Docker-compatible image for the sandbox. Defaults to
  `alpine:latest`.
- `cwd`: default working directory inside the sandbox. Defaults to
  `/workspace`.
- `env`: default environment variables for sandbox commands.
- `containerBinary`: Apple Container CLI binary. Defaults to `container`.
- `containerArgs`: extra arguments passed to `container create` before the
  image name.
- `name`: explicit container name. A random name is generated when omitted.
- `keepContainer`: keep the container after `close()`. Defaults to `false`.

## Session API

Sessions returned by `createSession()` implement the AI SDK
`Experimental_SandboxSession` contract:

- `description`
- `readFile`, `readBinaryFile`, `readTextFile`
- `writeFile`, `writeBinaryFile`, `writeTextFile`
- `spawn`
- `run`

It also exposes `containerId`, `image`, and `close()` for cleanup.
