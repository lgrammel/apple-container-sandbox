import { expectTypeOf, test } from "vitest";

import {
  type AppleContainerSandbox,
  AppleContainerSandboxSession,
  createAppleContainerSandbox,
  type AppleContainerSandboxOptions,
  type AppleContainerSandboxProcess,
  type AppleContainerSandboxProvider,
} from "@lgrammel/apple-container-sandbox";
import type { HarnessV1NetworkSandboxSession, HarnessV1SandboxProvider } from "@ai-sdk/harness";

test("createAppleContainerSandbox exposes the sandbox type", () => {
  const appleContainerSandbox = createAppleContainerSandbox({
    containerArgs: ["--cpus", "2"],
    containerBinary: "container",
    cwd: "/workspace",
    env: {
      NODE_ENV: "test",
    },
    image: "node:22",
    keepContainer: true,
    memory: "2G",
    name: "typed-session",
    ports: [4100],
  });

  expectTypeOf(appleContainerSandbox).toEqualTypeOf<AppleContainerSandbox>();
  expectTypeOf(appleContainerSandbox).toExtend<HarnessV1SandboxProvider>();
  expectTypeOf(appleContainerSandbox).toExtend<AppleContainerSandboxProvider>();
  expectTypeOf(appleContainerSandbox.name).toEqualTypeOf<"apple-container-sandbox">();
  expectTypeOf(appleContainerSandbox.specificationVersion).toEqualTypeOf<"harness-sandbox-v1">();
  expectTypeOf(appleContainerSandbox.providerId).toEqualTypeOf<string>();
  expectTypeOf(appleContainerSandbox.options).toEqualTypeOf<AppleContainerSandboxOptions>();
});

test("sandbox sessions match the AI SDK method shapes", () => {
  type Session = Awaited<ReturnType<AppleContainerSandbox["createSession"]>>;

  expectTypeOf<Session>().toEqualTypeOf<AppleContainerSandboxSession>();
  expectTypeOf<Session>().toExtend<HarnessV1NetworkSandboxSession>();
  expectTypeOf<Session["id"]>().toEqualTypeOf<string>();
  expectTypeOf<Session["defaultWorkingDirectory"]>().toEqualTypeOf<string>();
  expectTypeOf<Session["ports"]>().toEqualTypeOf<ReadonlyArray<number>>();
  expectTypeOf<Session["getPortUrl"]>().returns.resolves.toEqualTypeOf<string>();
  expectTypeOf<Session["restricted"]>().returns.toEqualTypeOf<
    ReturnType<HarnessV1NetworkSandboxSession["restricted"]>
  >();
  expectTypeOf<Session["stop"]>().returns.resolves.toEqualTypeOf<void>();
  expectTypeOf<Session["destroy"]>().returns.resolves.toEqualTypeOf<void>();
  expectTypeOf<Session["description"]>().toEqualTypeOf<string>();
  expectTypeOf<
    Session["readFile"]
  >().returns.resolves.toEqualTypeOf<ReadableStream<Uint8Array> | null>();
  expectTypeOf<Session["readBinaryFile"]>().returns.resolves.toEqualTypeOf<Uint8Array | null>();
  expectTypeOf<Session["readTextFile"]>().returns.resolves.toEqualTypeOf<string | null>();
  expectTypeOf<Session["writeFile"]>().returns.resolves.toEqualTypeOf<void>();
  expectTypeOf<Session["writeBinaryFile"]>().returns.resolves.toEqualTypeOf<void>();
  expectTypeOf<Session["writeTextFile"]>().returns.resolves.toEqualTypeOf<void>();
  expectTypeOf<Session["spawn"]>().returns.resolves.toEqualTypeOf<AppleContainerSandboxProcess>();
  expectTypeOf<Session["run"]>().returns.resolves.toEqualTypeOf<{
    exitCode: number;
    stdout: string;
    stderr: string;
  }>();
});

test("sandbox options reject unknown fields", () => {
  createAppleContainerSandbox({
    image: "node:22",
  });

  createAppleContainerSandbox({
    // @ts-expect-error unknown options should not be accepted
    unsupported: true,
  });
});
