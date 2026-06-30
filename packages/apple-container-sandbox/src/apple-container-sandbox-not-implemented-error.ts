export class AppleContainerSandboxNotImplementedError extends Error {
  constructor(message = "Apple Container sandbox execution is implemented.") {
    super(message);
    this.name = "AppleContainerSandboxNotImplementedError";
  }
}
