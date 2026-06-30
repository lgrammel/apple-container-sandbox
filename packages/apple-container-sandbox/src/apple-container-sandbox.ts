import type { HarnessV1SandboxProvider } from "@ai-sdk/harness";

import type { AppleContainerSandboxOptions } from "./apple-container-sandbox-options.js";
import type { AppleContainerSandboxSession } from "./apple-container-sandbox-session.js";

export interface AppleContainerSandbox extends HarnessV1SandboxProvider {
  name: "apple-container-sandbox";
  options: AppleContainerSandboxOptions;
  createSession(
    options?: Parameters<HarnessV1SandboxProvider["createSession"]>[0],
  ): Promise<AppleContainerSandboxSession>;
}
