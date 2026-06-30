import { type ChildProcess } from "node:child_process";

import { AppleContainerSandboxError } from "./apple-container-sandbox-error.js";
import { getAbortReason } from "./get-abort-reason.js";

export function waitForChildProcess(
  child: ChildProcess,
  abortSignal: AbortSignal | undefined,
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
      settleReject(
        new AppleContainerSandboxError(`Failed to start Apple container CLI: ${error.message}`, {
          cause: error,
        }),
      );
    });

    child.once("close", (code) => {
      settleResolve({ exitCode: code ?? 1 });
    });
  });
}
