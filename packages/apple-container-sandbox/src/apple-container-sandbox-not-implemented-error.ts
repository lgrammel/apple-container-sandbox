export class AppleContainerSandboxNotImplementedError extends Error {
  constructor(message = "Apple Container sandbox functionality is not implemented.") {
    super(message);
    this.name = "AppleContainerSandboxNotImplementedError";
  }
}
