import { mkdtemp, realpath } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test } from "vitest";

import { createAppleContainerSandbox } from "../src/create-apple-container-sandbox.js";
import { collectStream } from "./helpers/collect-stream.js";
import { createFakeContainerCli } from "./helpers/create-fake-container-cli.js";

test("creates an AI SDK-compatible sandbox session", async () => {
  const containerBinary = await createFakeContainerCli();
  const cwd = await realpath(await mkdtemp(join(tmpdir(), "apple-container-sandbox-")));

  const sandboxProvider = createAppleContainerSandbox({
    containerBinary,
    cwd,
    env: {
      BASE_VALUE: "base",
    },
    image: "fake-node:latest",
    name: "test-session",
  });

  const sandbox = await sandboxProvider.createSandbox();

  try {
    expect(sandbox.containerId).toBe("test-session");
    expect(sandbox.description).toMatch(/fake-node:latest/);

    const runResult = await sandbox.run({
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
    await sandbox.writeTextFile({
      path: filePath,
      content: "one\ntwo\nthree\n",
    });

    expect(await sandbox.readTextFile({ path: filePath, startLine: 2, endLine: 3 })).toBe(
      "two\nthree",
    );

    const bytes = await sandbox.readBinaryFile({ path: filePath });
    expect(new TextDecoder().decode(bytes ?? undefined)).toBe("one\ntwo\nthree\n");

    const stream = await sandbox.readFile({ path: filePath });
    expect(stream).not.toBeNull();
    expect(new TextDecoder().decode(await collectStream(stream))).toBe("one\ntwo\nthree\n");

    expect(await sandbox.readTextFile({ path: join(cwd, "missing.txt") })).toBeNull();

    expect((await sandbox.run({ command: "exit 7" })).exitCode).toBe(7);
  } finally {
    await sandbox.close().catch(() => {});
  }
});
