# @lgrammel/apple-container-sandbox

AI SDK sandbox provider backed by Apple Container Sandboxes.

## Status

This package implements the AI SDK Harness V1 sandbox provider shape using the
Apple Container CLI. Each session creates a long-lived container from a
Docker-compatible image, runs commands with `container exec`, and removes the
container when the session is closed.

## Apple Container setup

`@lgrammel/apple-container-sandbox` shells out to the Apple Container CLI. By
default, the executable must be available as `container` on `PATH`.

Apple Container requires an Apple silicon Mac running macOS 26 or newer.

Install Apple Container with Homebrew:

```sh
brew install container
```

Or download the latest signed installer package from the
[Apple Container releases page](https://github.com/apple/container/releases).

Start the Apple Container system service:

```sh
container system start
```

Verify the CLI is available:

```sh
container --version
container list --all
```

If `container` is installed but not on `PATH`, either add its directory to
`PATH` or pass an explicit binary path:

```ts
const appleContainerSandbox = createAppleContainerSandbox({
  containerBinary: "/opt/homebrew/bin/container",
});
```

## Install

```sh
pnpm add @lgrammel/apple-container-sandbox
```

Requires Node.js 22 or newer.

## Usage

```ts
import { createAppleContainerSandbox } from "@lgrammel/apple-container-sandbox";

const appleContainerSandbox = createAppleContainerSandbox({
  image: "node:22",
  cwd: "/workspace",
  ports: [4100],
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
  console.log(await sandboxSession.getPortUrl({ port: 4100 }));
} finally {
  await sandboxSession.stop();
}
```

## Codex harness example

The `apps/codex-example` package runs
[`@ai-sdk/harness-codex`](https://github.com/vercel/ai/tree/main/packages/harness-codex)
inside an Apple Container sandbox. The Codex harness starts a WebSocket bridge
inside the sandbox, so the sandbox publishes a local bridge port.

```sh
OPENAI_API_KEY=... pnpm example:codex
```

Optional environment variables:

- `CODEX_MODEL`: model passed to the Codex harness.
- `CODEX_BRIDGE_PORT`: local bridge port. Defaults to `4100`.
- `CODEX_SESSION_ID`: deterministic Apple Container session id.

## Options

- `image`: Docker-compatible image for the sandbox. Defaults to
  `alpine:latest`.
- `cwd`: default working directory inside the sandbox. Defaults to
  `/workspace`.
- `env`: default environment variables for sandbox commands.
- `containerBinary`: Apple Container CLI binary. Defaults to `container`.
- `containerArgs`: extra arguments passed to `container create` before the
  image name.
- `ports`: TCP ports published on `127.0.0.1` with the same host and container
  port.
- `name`: explicit container name. A random name is generated when omitted.
- `keepContainer`: keep the container after `stop()`. Defaults to `false`.

## Provider and Session API

`createAppleContainerSandbox()` returns an AI SDK
`HarnessV1SandboxProvider`.

Sessions returned by `createSession()` implement the AI SDK
`HarnessV1NetworkSandboxSession` contract, including the
`Experimental_SandboxSession` file and process methods:

- `description`
- `readFile`, `readBinaryFile`, `readTextFile`
- `writeFile`, `writeBinaryFile`, `writeTextFile`
- `spawn`
- `run`
- `id`, `defaultWorkingDirectory`, `ports`
- `restricted`
- `stop`, `destroy`

Configured ports resolve to local URLs through `getPortUrl()`, for example
`ws://127.0.0.1:4100`. Unconfigured ports reject with
`HarnessCapabilityUnsupportedError`.

It also exposes `image` for direct inspection.
