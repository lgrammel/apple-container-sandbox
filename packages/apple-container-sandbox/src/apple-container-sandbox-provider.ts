import type { AppleContainerSandboxOptions } from "./apple-container-sandbox-options.js";
import type { AppleContainerSandboxSession } from "./apple-container-sandbox-session.js";

export interface AppleContainerSandboxProvider {
  name: "apple-container-sandbox";
  options: AppleContainerSandboxOptions;
  createSandbox(options?: { abortSignal?: AbortSignal }): Promise<AppleContainerSandboxSession>;
}
