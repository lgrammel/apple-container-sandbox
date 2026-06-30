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
      console.log(`\n[finish] ${formatEventValue(event.finishReason)}`);
      break;
    case "error":
      console.error(event.error);
      break;
  }
}

function formatEventValue(value: unknown) {
  return typeof value === "string" ? value : JSON.stringify(value);
}
