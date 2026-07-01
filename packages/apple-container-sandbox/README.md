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

```ts
import "dotenv/config";

import { createCodex } from "@ai-sdk/harness-codex";
import type { HarnessV1Bootstrap, HarnessV1StreamPart } from "@ai-sdk/harness";
import {
  AppleContainerSandboxError,
  createAppleContainerSandbox,
  type AppleContainerSandboxSession,
} from "@lgrammel/apple-container-sandbox";

const codexPort = Number.parseInt(process.env.CODEX_BRIDGE_PORT ?? "4100", 10);
const sessionId = process.env.CODEX_SESSION_ID ?? "apple-container-codex-example";
const sessionWorkDir = "/workspace/codex-demo";
const prompt =
  process.argv.slice(2).join(" ") ||
  [
    "Create a hello.js file in the current directory.",
    "It should print a concise greeting from Codex running inside Apple Container.",
    "Then run it with node and report what happened.",
  ].join(" ");

if (!Number.isInteger(codexPort) || codexPort < 1 || codexPort > 65535) {
  throw new Error("CODEX_BRIDGE_PORT must be an integer from 1 to 65535.");
}

if (!process.env.OPENAI_API_KEY && !process.env.CODEX_API_KEY && !process.env.AI_GATEWAY_API_KEY) {
  throw new Error("Set OPENAI_API_KEY, CODEX_API_KEY, or AI_GATEWAY_API_KEY before running Codex.");
}

const codexHarness = createCodex({
  model: process.env.CODEX_MODEL,
  port: codexPort,
});

const appleContainerSandbox = createAppleContainerSandbox({
  image: "node:22",
  cwd: "/workspace",
  ports: [codexPort],
});

let sandboxSession: AppleContainerSandboxSession | undefined;
let codexSession: Awaited<ReturnType<typeof codexHarness.doStart>> | undefined;
type CreateSessionOptions = NonNullable<Parameters<typeof appleContainerSandbox.createSession>[0]>;
type OnFirstCreate = NonNullable<CreateSessionOptions["onFirstCreate"]>;
type BootstrapSession = Parameters<OnFirstCreate>[0];
type RunOptions = Parameters<BootstrapSession["run"]>[0];

try {
  const bootstrap = await codexHarness.getBootstrap?.();

  sandboxSession = await appleContainerSandbox.createSession({
    sessionId,
    onFirstCreate: async (session, { abortSignal }) => {
      await runRequired(session, {
        command: "corepack enable pnpm && corepack prepare pnpm@11.9.0 --activate",
        abortSignal,
      });

      if (bootstrap) {
        await applyBootstrap(session, bootstrap, abortSignal);
      }
    },
  });

  codexSession = await codexHarness.doStart({
    sessionId,
    sandboxSession,
    sessionWorkDir,
    permissionMode: "allow-all",
  });

  const control = await codexSession.doPromptTurn({
    prompt,
    emit: printCodexEvent,
  });

  await control.done;
} catch (error) {
  if (error instanceof AppleContainerSandboxError) {
    console.error(error.message);
    process.exitCode = 1;
  } else {
    throw error;
  }
} finally {
  if (codexSession) {
    await Promise.resolve(codexSession.doDestroy()).catch(() => {});
  }
  await sandboxSession?.stop().catch(() => {});
}

async function applyBootstrap(
  session: BootstrapSession,
  bootstrap: HarnessV1Bootstrap,
  abortSignal?: AbortSignal,
) {
  for (const file of bootstrap.files) {
    await session.writeTextFile({
      path: file.path,
      content: file.content,
      abortSignal,
    });
  }

  for (const command of bootstrap.commands) {
    await runRequired(session, {
      command: command.command,
      workingDirectory: command.workingDirectory,
      abortSignal,
    });
  }
}

async function runRequired(session: BootstrapSession, options: RunOptions) {
  const result = await session.run(options);

  if (result.exitCode !== 0) {
    throw new Error(`Codex bootstrap failed: ${result.stderr || result.stdout}`);
  }
}

function printCodexEvent(event: HarnessV1StreamPart) {
  switch (event.type) {
    case "text-delta":
    case "reasoning-delta":
      process.stdout.write(event.delta);
      break;
    case "tool-call":
      console.log(`\n[tool] ${event.toolName}`);
      break;
    case "file-change":
      console.log(`\n[file] ${event.event}: ${event.path}`);
      break;
    case "finish":
      console.log(`\n[finish] ${event.finishReason.unified}`);
      break;
    case "error":
      console.error(event.error);
      break;
  }
}
```

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
  mounts: [
    {
      hostPath: process.cwd(),
      containerPath: "/workspace",
      readOnly: true,
    },
  ],
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
- `mounts`: host directories to bind mount into the sandbox. Relative
  `hostPath` values are resolved when the sandbox provider is created.
- `ports`: TCP ports published on `127.0.0.1` with the same host and container
  port.
- `containerBinary`: Apple Container CLI binary. Defaults to `container`.
- `containerArgs`: extra arguments passed to `container create` before the
  image name.
- `name`: explicit container name. A random name is generated when omitted.
- `keepContainer`: keep the container after `stop()`. Defaults to `false`.

If `container` is installed but not on `PATH`, either add its directory to
`PATH` or set `containerBinary`.

## License

MIT
