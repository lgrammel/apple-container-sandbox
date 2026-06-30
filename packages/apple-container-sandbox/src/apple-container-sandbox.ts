import type { AppleContainerSandboxOptions } from "./apple-container-sandbox-options.js";
import type { AppleContainerSandboxSession } from "./apple-container-sandbox-session.js";

export interface AppleContainerSandbox {
  name: "apple-container-sandbox";
  options: AppleContainerSandboxOptions;
  createSession(options?: { abortSignal?: AbortSignal }): Promise<AppleContainerSandboxSession>;
}
