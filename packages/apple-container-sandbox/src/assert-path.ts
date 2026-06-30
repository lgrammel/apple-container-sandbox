export function assertPath(path: string): void {
  if (path.length === 0) {
    throw new TypeError("Sandbox file path must be a non-empty string.");
  }
}
