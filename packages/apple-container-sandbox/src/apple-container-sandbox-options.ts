export interface AppleContainerSandboxOptions {
  /**
   * Docker-compatible image used for each sandbox session.
   *
   * @default "alpine:latest"
   */
  image?: string;

  /**
   * Default working directory inside the sandbox.
   *
   * @default "/workspace"
   */
  cwd?: string;

  /**
   * Default environment variables available to sandbox commands.
   */
  env?: Record<string, string>;

  /**
   * Apple Container CLI binary to execute.
   *
   * @default "container"
   */
  containerBinary?: string;

  /**
   * Extra arguments passed to `container create` before the image name.
   */
  containerArgs?: string[];

  /**
   * TCP ports to publish on 127.0.0.1 with the same host and container port.
   */
  ports?: ReadonlyArray<number>;

  /**
   * Explicit container name. A random name is generated when omitted.
   */
  name?: string;

  /**
   * Keep the container after `stop()` instead of deleting it.
   *
   * @default false
   */
  keepContainer?: boolean;
}
