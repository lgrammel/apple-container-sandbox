export interface AppleContainerSandboxProcess {
  readonly pid?: number;
  readonly stdout: ReadableStream<Uint8Array>;
  readonly stderr: ReadableStream<Uint8Array>;
  wait(): PromiseLike<{ exitCode: number }>;
  kill(): PromiseLike<void>;
}
