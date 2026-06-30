export interface NormalizedAppleContainerSandboxOptions {
  containerArgs: string[];
  containerBinary: string;
  cwd: string;
  env: Record<string, string>;
  image: string;
  keepContainer: boolean;
  name?: string;
  ports: ReadonlyArray<number>;
}
