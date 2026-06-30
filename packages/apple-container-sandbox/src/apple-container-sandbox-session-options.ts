export interface AppleContainerSandboxSessionOptions {
  containerArgs: string[];
  containerBinary: string;
  containerId: string;
  cwd: string;
  env: Record<string, string>;
  image: string;
  keepContainer: boolean;
}
