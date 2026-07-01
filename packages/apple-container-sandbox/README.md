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

## Examples

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

### Direct Usage

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

### AI SDK Shell Tool

The `apps/tool-example` package shows how to pass an Apple Container sandbox to
AI SDK `generateText` with `experimental_sandbox`. Its shell tool uses the
sandbox from tool execution options and runs commands with
`sandbox.run(...)`.

```ts
import { generateText, isStepCount, tool } from "ai";
import { z } from "zod/v4";
import { createAppleContainerSandbox } from "@lgrammel/apple-container-sandbox";

const appleContainerSandbox = createAppleContainerSandbox({
  image: "node:22",
  cwd: "/workspace",
});

const shellTool = tool({
  description: "Run a shell command inside the Apple Container sandbox.",
  inputSchema: z.object({
    command: z.string(),
    workingDirectory: z.string().optional(),
  }),
  execute: async ({ command, workingDirectory }, { experimental_sandbox, abortSignal }) => {
    if (!experimental_sandbox) {
      throw new Error("The shell tool requires an AI SDK experimental_sandbox.");
    }

    return experimental_sandbox.run({
      command,
      workingDirectory,
      abortSignal,
    });
  },
});

const sandboxSession = await appleContainerSandbox.createSession();

try {
  const result = await generateText({
    model: "openai/gpt-4.1-mini",
    tools: {
      shell: shellTool,
    },
    experimental_sandbox: sandboxSession,
    stopWhen: isStepCount(3),
    prompt: "Use the shell tool to create and run a small Node.js file.",
  });

  console.log(result.text);
} finally {
  await sandboxSession.stop();
}
```

In this repository, run the workspace example:

```sh
cp apps/tool-example/.env.example apps/tool-example/.env
pnpm example:tool
```

Set `AI_GATEWAY_API_KEY` and `TOOL_MODEL` in `apps/tool-example/.env`.

### AI SDK Codex Harness

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

Configured local ports resolve through `getPortUrl()`:

```ts
const sandboxSession = await appleContainerSandbox.createSession();
const bridgeUrl = await sandboxSession.getPortUrl({
  port: 4100,
  protocol: "ws",
});

console.log(bridgeUrl); // ws://127.0.0.1:4100
```

## License

MIT
