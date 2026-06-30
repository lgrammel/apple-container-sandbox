import { expectTypeOf, test } from "vitest";

import {
  type AppleContainerSandbox,
  AppleContainerSandboxSession,
  createAppleContainerSandbox,
  type AppleContainerSandboxOptions,
  type AppleContainerSandboxProcess,
  type AppleContainerSandboxProvider,
} from "@lgrammel/apple-container-sandbox";

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
    name: "typed-session",
  });

  expectTypeOf(appleContainerSandbox).toEqualTypeOf<AppleContainerSandbox>();
  expectTypeOf(appleContainerSandbox).toEqualTypeOf<AppleContainerSandboxProvider>();
  expectTypeOf(appleContainerSandbox.name).toEqualTypeOf<"apple-container-sandbox">();
  expectTypeOf(appleContainerSandbox.options).toEqualTypeOf<AppleContainerSandboxOptions>();
});

test("sandbox sessions match the AI SDK method shapes", () => {
  type Session = Awaited<ReturnType<AppleContainerSandbox["createSession"]>>;

  expectTypeOf<Session>().toEqualTypeOf<AppleContainerSandboxSession>();
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
