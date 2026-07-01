import { randomUUID } from "node:crypto";
import { statSync } from "node:fs";
import { resolve } from "node:path";

import { AppleContainerSandboxSession } from "./apple-container-sandbox-session.js";
import type { AppleContainerSandbox } from "./apple-container-sandbox.js";
import type {
  AppleContainerSandboxMount,
  AppleContainerSandboxOptions,
} from "./apple-container-sandbox-options.js";
import { assertSuccessfulResult } from "./assert-successful-result.js";
import { createEnvArgs } from "./create-env-args.js";
import { defaultContainerBinary } from "./default-container-binary.js";
import { defaultCwd } from "./default-cwd.js";
import { defaultImage } from "./default-image.js";
import type {
  NormalizedAppleContainerSandboxMount,
  NormalizedAppleContainerSandboxOptions,
} from "./normalized-apple-container-sandbox-options.js";
import { runContainerCli } from "./run-container-cli.js";
import { shellQuote } from "./shell-quote.js";

export function createAppleContainerSandbox(
  options: AppleContainerSandboxOptions = {},
): AppleContainerSandbox {
  const normalizedOptions: NormalizedAppleContainerSandboxOptions = {
    containerArgs: options.containerArgs ?? [],
    containerBinary: options.containerBinary ?? defaultContainerBinary,
    cwd: options.cwd ?? defaultCwd,
    env: options.env ?? {},
    image: options.image ?? defaultImage,
    keepContainer: options.keepContainer ?? false,
    memory: options.memory,
    mounts: normalizeMounts(options.mounts ?? []),
    name: options.name,
    ports: normalizePorts(options.ports ?? []),
  };

  return {
    name: "apple-container-sandbox",
    options,
    specificationVersion: "harness-sandbox-v1",
    providerId: "apple-container-sandbox",
    async createSession({ abortSignal, onFirstCreate, sessionId } = {}) {
      const id = normalizedOptions.name ?? sessionId ?? `ai-sdk-sandbox-${randomUUID()}`;
      let containerCreated = false;

      const keepAliveCommand = [
        `mkdir -p -- ${shellQuote(normalizedOptions.cwd)}`,
        "trap 'exit 0' TERM INT",
        "while :; do sleep 2147483647 & wait $!; done",
      ].join(" && ");

      try {
        const createResult = await runContainerCli(
          normalizedOptions.containerBinary,
          [
            "create",
            "--name",
            id,
            ...createEnvArgs(normalizedOptions.env),
            ...createPortArgs(normalizedOptions.ports),
            ...createMemoryArgs(normalizedOptions.memory),
            ...createMountArgs(normalizedOptions.mounts),
            ...normalizedOptions.containerArgs,
            normalizedOptions.image,
            "/bin/sh",
            "-lc",
            keepAliveCommand,
          ],
          { abortSignal },
        );

        assertSuccessfulResult("create sandbox container", createResult);
        containerCreated = true;

        const startResult = await runContainerCli(
          normalizedOptions.containerBinary,
          ["start", id],
          { abortSignal },
        );

        assertSuccessfulResult("start sandbox container", startResult);

        const session = new AppleContainerSandboxSession({
          containerBinary: normalizedOptions.containerBinary,
          cwd: normalizedOptions.cwd,
          env: normalizedOptions.env,
          id,
          image: normalizedOptions.image,
          keepContainer: normalizedOptions.keepContainer,
          ports: normalizedOptions.ports,
        });

        await onFirstCreate?.(session.restricted(), { abortSignal });

        return session;
      } catch (error) {
        if (containerCreated) {
          await runContainerCli(normalizedOptions.containerBinary, ["delete", "--force", id]).catch(
            () => {},
          );
        }

        throw error;
      }
    },
  };
}

function normalizePorts(ports: ReadonlyArray<number>): ReadonlyArray<number> {
  return Array.from(new Set(ports)).map((port) => {
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      throw new RangeError(`Invalid Apple Container sandbox port: ${port}.`);
    }

    return port;
  });
}

function createPortArgs(ports: ReadonlyArray<number>): string[] {
  return ports.flatMap((port) => ["--publish", `127.0.0.1:${port}:${port}/tcp`]);
}

function createMemoryArgs(memory: string | undefined): string[] {
  return memory == null ? [] : ["--memory", memory];
}

function normalizeMounts(
  mounts: ReadonlyArray<AppleContainerSandboxMount>,
): ReadonlyArray<NormalizedAppleContainerSandboxMount> {
  return mounts.map(({ containerPath, hostPath, readOnly }) => {
    assertNonEmptyString(hostPath, "Sandbox mount hostPath");
    assertNonEmptyString(containerPath, "Sandbox mount containerPath");

    if (!containerPath.startsWith("/")) {
      throw new TypeError(`Sandbox mount containerPath must be absolute: ${containerPath}.`);
    }

    if (hasMountDelimiter(hostPath) || hasMountDelimiter(containerPath)) {
      throw new TypeError("Sandbox mount paths must not contain commas or equal signs.");
    }

    const resolvedHostPath = resolve(hostPath);
    let stat;
    try {
      stat = statSync(resolvedHostPath);
    } catch {
      throw new TypeError(`Sandbox mount hostPath does not exist: ${resolvedHostPath}.`);
    }

    if (!stat.isDirectory()) {
      throw new TypeError(`Sandbox mount hostPath must be a directory: ${resolvedHostPath}.`);
    }

    return {
      containerPath,
      hostPath: resolvedHostPath,
      readOnly: readOnly ?? false,
    };
  });
}

function createMountArgs(mounts: ReadonlyArray<NormalizedAppleContainerSandboxMount>): string[] {
  return mounts.flatMap(({ containerPath, hostPath, readOnly }) => [
    "--mount",
    [
      "type=bind",
      `src=${hostPath}`,
      `dst=${containerPath}`,
      ...(readOnly ? ["readonly"] : []),
    ].join(","),
  ]);
}

function assertNonEmptyString(value: string, name: string): void {
  if (typeof value !== "string" || value.length === 0) {
    throw new TypeError(`${name} must be a non-empty string.`);
  }
}

function hasMountDelimiter(path: string): boolean {
  return path.includes(",") || path.includes("=");
}
