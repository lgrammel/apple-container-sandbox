export const appleContainerSandboxPackageName =
  "@lgrammel/apple-container-sandbox";

export class AppleContainerSandboxNotImplementedError extends Error {
  constructor(message = "Apple Container sandbox execution is not implemented yet.") {
    super(message);
    this.name = "AppleContainerSandboxNotImplementedError";
  }
}

export function createAppleContainerSandbox(options = {}) {
  return {
    name: "apple-container-sandbox",
    options,
    async createSandbox() {
      throw new AppleContainerSandboxNotImplementedError();
    },
  };
}
