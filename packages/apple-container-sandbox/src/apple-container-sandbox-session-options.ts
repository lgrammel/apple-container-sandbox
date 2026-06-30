export interface AppleContainerSandboxSessionOptions {
  containerBinary: string;
  cwd: string;
  env: Record<string, string>;
  id: string;
  image: string;
  keepContainer: boolean;
  ports: ReadonlyArray<number>;
}
