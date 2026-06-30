# @lgrammel/apple-container-sandbox

Run AI SDK sandbox sessions in Apple Container on your Mac.

`@lgrammel/apple-container-sandbox` is an AI SDK Harness V1 sandbox provider
that creates a long-lived Apple Container session for each sandbox. It gives
AI agents and local tools a Docker-compatible image, isolated file access,
command execution, and optional localhost port publishing without leaving your
Apple silicon development machine.

## Why use it

- Use the AI SDK sandbox API with Apple Container instead of a remote sandbox
  service.
- Run commands in Docker-compatible images through the Apple Container CLI.
- Read and write files inside the sandbox with the AI SDK
  `Experimental_SandboxSession` methods.
- Publish selected sandbox ports on `127.0.0.1` for local bridges, servers, or
  harness integrations.
- Clean up containers automatically when a session stops.

## Requirements

- Apple silicon Mac
- macOS 26 or newer
- Apple Container CLI available as `container`, or a custom `containerBinary`
  option
- Node.js 22 or newer
- ESM project configuration

## Quick start

Install Apple Container:

```sh
brew install container
container system start
container --version
```

If you do not use Homebrew, download a signed installer from the
[Apple Container releases page](https://github.com/apple/container/releases).

Install the sandbox provider:

```sh
pnpm add @lgrammel/apple-container-sandbox
```

Write a file, run it in a sandbox, read the result, and stop the session:

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
    content: [
      "const message = 'Hello from Apple Container Sandbox';",
      "await import('node:fs/promises').then((fs) =>",
      "  fs.writeFile('/workspace/result.txt', message),",
      ");",
      "console.log(message);",
    ].join("\n"),
  });

  const runResult = await sandboxSession.run({
    command: "node /workspace/example.js",
  });

  console.log(runResult.stdout.trim());
  console.log(await sandboxSession.readTextFile({ path: "/workspace/result.txt" }));
} finally {
  await sandboxSession.stop();
}
```

In this repository, run the workspace example:

```sh
pnpm example
```

## Local ports

Pass `ports` when the sandbox needs to expose a local service or bridge. Each
configured port is published on `127.0.0.1` with the same host and container
port.

```ts
const appleContainerSandbox = createAppleContainerSandbox({
  image: "node:22",
  cwd: "/workspace",
  ports: [4100],
});

const sandboxSession = await appleContainerSandbox.createSession();
const bridgeUrl = await sandboxSession.getPortUrl({
  port: 4100,
  protocol: "ws",
});

console.log(bridgeUrl); // ws://127.0.0.1:4100
```

## Codex harness example

The `apps/codex-example` package runs
[`@ai-sdk/harness-codex`](https://github.com/vercel/ai/tree/main/packages/harness-codex)
inside an Apple Container sandbox. The Codex harness starts a WebSocket bridge
inside the sandbox, so the sandbox publishes a local bridge port.

```sh
cp apps/codex-example/.env.example apps/codex-example/.env
pnpm example:codex
```

The example loads `apps/codex-example/.env` with `dotenv`. Set one of
`OPENAI_API_KEY`, `CODEX_API_KEY`, or `AI_GATEWAY_API_KEY`.

Optional environment variables:

- `CODEX_MODEL`: model passed to the Codex harness.
- `CODEX_BRIDGE_PORT`: local bridge port. Defaults to `4100`.
- `CODEX_SESSION_ID`: deterministic Apple Container session id.

## Configuration

```ts
const appleContainerSandbox = createAppleContainerSandbox({
  image: "node:22",
  cwd: "/workspace",
  env: {
    NODE_ENV: "development",
  },
  memory: "2G",
  ports: [4100],
  containerBinary: "/opt/homebrew/bin/container",
  keepContainer: false,
});
```

- `image`: Docker-compatible image for the sandbox. Defaults to
  `alpine:latest`.
- `cwd`: default working directory inside the sandbox. Defaults to
  `/workspace`.
- `env`: default environment variables for sandbox commands.
- `memory`: amount of memory allocated to the container. Passed to
  `container create --memory`.
- `ports`: TCP ports published on `127.0.0.1` with the same host and container
  port.
- `containerBinary`: Apple Container CLI binary. Defaults to `container`.
- `containerArgs`: extra arguments passed to `container create` before the
  image name.
- `name`: explicit container name. A random name is generated when omitted.
- `keepContainer`: keep the container after `stop()`. Defaults to `false`.

If `container` is installed but not on `PATH`, either add its directory to
`PATH` or set `containerBinary`.

## API surface

`createAppleContainerSandbox()` returns an AI SDK
`HarnessV1SandboxProvider`.

Sessions returned by `createSession()` implement the AI SDK
`HarnessV1NetworkSandboxSession` contract, including the
`Experimental_SandboxSession` file and process methods:

- `readFile`, `readBinaryFile`, `readTextFile`
- `writeFile`, `writeBinaryFile`, `writeTextFile`
- `spawn`
- `run`
- `getPortUrl`
- `stop`, `destroy`

Session metadata includes `description`, `id`, `image`,
`defaultWorkingDirectory`, `ports`, and `restricted`.

Configured ports resolve to local URLs through `getPortUrl()`. Unconfigured
ports reject with `HarnessCapabilityUnsupportedError`.

## Status

This package implements the AI SDK Harness V1 sandbox provider shape using the
Apple Container CLI. Each session creates a long-lived container from a
Docker-compatible image, runs commands with `container exec`, and removes the
container when the session is closed unless `keepContainer` is enabled.

## License

MIT
