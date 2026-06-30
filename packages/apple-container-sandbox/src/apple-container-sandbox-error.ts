export class AppleContainerSandboxError extends Error {
  command?: string[];
  exitCode?: number;
  stderr?: string;

  constructor(
    message: string,
    {
      cause,
      command,
      exitCode,
      stderr,
    }: {
      cause?: unknown;
      command?: string[];
      exitCode?: number;
      stderr?: string;
    } = {},
  ) {
    super(message, { cause });
    this.name = "AppleContainerSandboxError";
    this.command = command;
    this.exitCode = exitCode;
    this.stderr = stderr;
  }
}
