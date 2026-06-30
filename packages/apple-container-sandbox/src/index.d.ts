export declare const appleContainerSandboxPackageName =
  "@lgrammel/apple-container-sandbox";

export interface AppleContainerSandboxOptions {
  image?: string;
  cwd?: string;
  env?: Record<string, string>;
}

export interface AppleContainerSandboxProvider {
  name: "apple-container-sandbox";
  options: AppleContainerSandboxOptions;
  createSandbox(): Promise<never>;
}

export declare class AppleContainerSandboxNotImplementedError extends Error {
  constructor(message?: string);
}

export declare function createAppleContainerSandbox(
  options?: AppleContainerSandboxOptions,
): AppleContainerSandboxProvider;
