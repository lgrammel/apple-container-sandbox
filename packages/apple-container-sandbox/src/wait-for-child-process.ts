import { type ChildProcess } from "node:child_process";

import { AppleContainerSandboxError } from "./apple-container-sandbox-error.js";
import { getAbortReason } from "./get-abort-reason.js";

export function waitForChildProcess(
  child: ChildProcess,
  abortSignal: AbortSignal | undefined,
  command: string[],
): Promise<{ exitCode: number }> {
  return new Promise((resolve, reject) => {
    let settled = false;

    const settleResolve = (value: { exitCode: number }) => {
      if (settled) {
        return;
      }

      settled = true;
      abortSignal?.removeEventListener("abort", onAbort);
      resolve(value);
    };

    const settleReject = (reason: unknown) => {
      if (settled) {
        return;
      }

      settled = true;
      abortSignal?.removeEventListener("abort", onAbort);
      reject(reason);
    };

    const onAbort = () => {
      child.kill("SIGTERM");
      settleReject(getAbortReason(abortSignal));
    };

    abortSignal?.addEventListener("abort", onAbort, { once: true });

    child.once("error", (error) => {
      const message =
        "code" in error && error.code === "ENOENT"
          ? `Apple Container CLI executable "${command[0]}" was not found on PATH. Install Apple Container or pass a custom containerBinary option.`
          : `Failed to start Apple container CLI: ${error.message}`;

      settleReject(
        new AppleContainerSandboxError(message, {
          cause: error,
          command,
        }),
      );
    });

    child.once("close", (code) => {
      settleResolve({ exitCode: code ?? 1 });
    });
  });
}
