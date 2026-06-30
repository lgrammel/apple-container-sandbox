import { mkdtemp, realpath } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test, vi } from "vitest";
import { HarnessCapabilityUnsupportedError } from "@ai-sdk/harness";
import type { Experimental_SandboxSession } from "@ai-sdk/provider-utils";

import { createAppleContainerSandbox } from "../src/create-apple-container-sandbox.js";
import { collectStream } from "./helpers/collect-stream.js";
import { createFakeContainerCli } from "./helpers/create-fake-container-cli.js";

test("creates an AI SDK-compatible sandbox session", async () => {
  const containerBinary = await createFakeContainerCli();
  const cwd = await realpath(await mkdtemp(join(tmpdir(), "apple-container-sandbox-")));

  const appleContainerSandbox = createAppleContainerSandbox({
    containerBinary,
    cwd,
    env: {
      BASE_VALUE: "base",
    },
    image: "fake-node:latest",
    name: "test-session",
  });

  const sandboxSession = await appleContainerSandbox.createSession();

  try {
    expect(sandboxSession.containerId).toBe("test-session");
    expect(sandboxSession.id).toBe("test-session");
    expect(sandboxSession.defaultWorkingDirectory).toBe(cwd);
    expect(sandboxSession.ports).toEqual([]);
    expect(sandboxSession.description).toMatch(/fake-node:latest/);

    const runResult = await sandboxSession.run({
      command: "printf '%s' \"$BASE_VALUE:$COMMAND_VALUE:$(pwd)\"",
      env: {
        COMMAND_VALUE: "command",
      },
    });

    expect(runResult).toEqual({
      exitCode: 0,
      stdout: `base:command:${cwd}`,
      stderr: "",
    });

    const filePath = join(cwd, "nested", "message.txt");
    await sandboxSession.writeTextFile({
      path: filePath,
      content: "one\ntwo\nthree\n",
    });

    expect(await sandboxSession.readTextFile({ path: filePath, startLine: 2, endLine: 3 })).toBe(
      "two\nthree",
    );

    const bytes = await sandboxSession.readBinaryFile({ path: filePath });
    expect(new TextDecoder().decode(bytes ?? undefined)).toBe("one\ntwo\nthree\n");

    const stream = await sandboxSession.readFile({ path: filePath });
    expect(stream).not.toBeNull();
    expect(new TextDecoder().decode(await collectStream(stream))).toBe("one\ntwo\nthree\n");

    expect(await sandboxSession.readTextFile({ path: join(cwd, "missing.txt") })).toBeNull();

    expect((await sandboxSession.run({ command: "exit 7" })).exitCode).toBe(7);

    const restricted = sandboxSession.restricted();
    expect(restricted.description).toBe(sandboxSession.description);
    expect(await restricted.readTextFile({ path: filePath, startLine: 1, endLine: 1 })).toBe("one");

    await expect(sandboxSession.getPortUrl({ port: 3000 })).rejects.toBeInstanceOf(
      HarnessCapabilityUnsupportedError,
    );
  } finally {
    await sandboxSession.stop().catch(() => {});
    await sandboxSession.destroy().catch(() => {});
  }
});

test("uses the harness session id and onFirstCreate hook", async () => {
  const containerBinary = await createFakeContainerCli();
  const cwd = await realpath(await mkdtemp(join(tmpdir(), "apple-container-sandbox-")));
  let bootstrapOptions: { abortSignal?: AbortSignal } | undefined;
  const onFirstCreate = vi.fn(
    async (session: Experimental_SandboxSession, options: { abortSignal?: AbortSignal }) => {
      bootstrapOptions = options;
      await session.writeTextFile({
        path: join(cwd, "bootstrap.txt"),
        content: "bootstrapped",
      });
    },
  );

  const appleContainerSandbox = createAppleContainerSandbox({
    containerBinary,
    cwd,
    image: "fake-node:latest",
  });

  const sandboxSession = await appleContainerSandbox.createSession({
    sessionId: "harness-session",
    onFirstCreate,
  });

  try {
    expect(sandboxSession.containerId).toBe("harness-session");
    expect(onFirstCreate).toHaveBeenCalledOnce();
    expect(bootstrapOptions).toEqual({ abortSignal: undefined });
    expect(await sandboxSession.readTextFile({ path: join(cwd, "bootstrap.txt") })).toBe(
      "bootstrapped",
    );
  } finally {
    await sandboxSession.close().catch(() => {});
  }
});
