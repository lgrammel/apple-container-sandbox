import { spawn as spawnChildProcess } from "node:child_process";

import { collectNodeStream } from "./collect-node-stream.js";
import type { ContainerCliResult } from "./container-cli-result.js";
import { pipeStdin } from "./pipe-stdin.js";
import type { RunContainerCliOptions } from "./run-container-cli-options.js";
import { waitForChildProcess } from "./wait-for-child-process.js";

export async function runContainerCli(
  containerBinary: string,
  args: string[],
  { abortSignal, stdin }: RunContainerCliOptions = {},
): Promise<ContainerCliResult> {
  abortSignal?.throwIfAborted();
  const command = [containerBinary, ...args];

  const child = spawnChildProcess(containerBinary, args, {
    stdio: ["pipe", "pipe", "pipe"],
  });

  const waitPromise = waitForChildProcess(child, abortSignal, command);
  const stdinPromise = pipeStdin(child.stdin, stdin).catch((error: unknown) => {
    child.kill("SIGTERM");
    throw error;
  });

  const [stdout, stderr, { exitCode }] = await Promise.all([
    collectNodeStream(child.stdout),
    collectNodeStream(child.stderr),
    waitPromise,
    stdinPromise,
  ]);

  return {
    command,
    exitCode,
    stdout,
    stderr,
  };
}
