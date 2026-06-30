import { randomUUID } from "node:crypto";

import { AppleContainerSandboxSession } from "./apple-container-sandbox-session.js";
import type { AppleContainerSandbox } from "./apple-container-sandbox.js";
import type { AppleContainerSandboxOptions } from "./apple-container-sandbox-options.js";
import { assertSuccessfulResult } from "./assert-successful-result.js";
import { createEnvArgs } from "./create-env-args.js";
import { defaultContainerBinary } from "./default-container-binary.js";
import { defaultCwd } from "./default-cwd.js";
import { defaultImage } from "./default-image.js";
import type { NormalizedAppleContainerSandboxOptions } from "./normalized-apple-container-sandbox-options.js";
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
