export function assertCommand(command: string): void {
  if (command.length === 0) {
    throw new TypeError("Sandbox command must be a non-empty string.");
  }
}
