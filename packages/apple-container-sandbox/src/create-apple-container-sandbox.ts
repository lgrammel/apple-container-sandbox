import { randomUUID } from "node:crypto";

import { AppleContainerSandboxSession } from "./apple-container-sandbox-session.js";
import type { AppleContainerSandboxOptions } from "./apple-container-sandbox-options.js";
import type { AppleContainerSandboxProvider } from "./apple-container-sandbox-provider.js";
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
): AppleContainerSandboxProvider {
  const normalizedOptions: NormalizedAppleContainerSandboxOptions = {
    containerArgs: options.containerArgs ?? [],
    containerBinary: options.containerBinary ?? defaultContainerBinary,
    cwd: options.cwd ?? defaultCwd,
    env: options.env ?? {},
    image: options.image ?? defaultImage,
    keepContainer: options.keepContainer ?? false,
    name: options.name,
  };

  return {
    name: "apple-container-sandbox",
    options,
    async createSandbox({ abortSignal } = {}) {
      const containerId = normalizedOptions.name ?? `ai-sdk-sandbox-${randomUUID()}`;
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
            containerId,
            ...createEnvArgs(normalizedOptions.env),
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
          ["start", containerId],
          { abortSignal },
        );

        assertSuccessfulResult("start sandbox container", startResult);

        return new AppleContainerSandboxSession({
          containerArgs: normalizedOptions.containerArgs,
          containerBinary: normalizedOptions.containerBinary,
          containerId,
          cwd: normalizedOptions.cwd,
          env: normalizedOptions.env,
          image: normalizedOptions.image,
          keepContainer: normalizedOptions.keepContainer,
        });
      } catch (error) {
        if (containerCreated) {
          await runContainerCli(normalizedOptions.containerBinary, [
            "delete",
            "--force",
            containerId,
          ]).catch(() => {});
        }

        throw error;
      }
    },
  };
}
