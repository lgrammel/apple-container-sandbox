import { AppleContainerSandboxError } from "./apple-container-sandbox-error.js";
import type { ContainerCliResult } from "./container-cli-result.js";

export function assertSuccessfulResult(action: string, result: ContainerCliResult): void {
  if (result.exitCode === 0) {
    return;
  }

  throw new AppleContainerSandboxError(
    `Failed to ${action}: ${result.stderr.toString("utf8").trim()}`,
    {
      command: result.command,
      exitCode: result.exitCode,
      stderr: result.stderr.toString("utf8"),
    },
  );
}
