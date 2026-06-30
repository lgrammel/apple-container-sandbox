export interface ContainerCliResult {
  command: string[];
  exitCode: number;
  stdout: Buffer;
  stderr: Buffer;
}
