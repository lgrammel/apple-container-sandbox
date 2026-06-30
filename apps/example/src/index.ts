import {
  AppleContainerSandboxError,
  createAppleContainerSandbox,
  type AppleContainerSandboxSession,
} from "@lgrammel/apple-container-sandbox";

const appleContainerSandbox = createAppleContainerSandbox({
  image: "node:22",
  cwd: "/workspace",
});

let sandboxSession: AppleContainerSandboxSession | undefined;

try {
  sandboxSession = await appleContainerSandbox.createSession();

  await sandboxSession.writeTextFile({
    path: "/workspace/example.js",
    content: [
      "const message = 'Hello from Apple Container Sandbox';",
      "await import('node:fs/promises').then((fs) =>",
      "  fs.writeFile('/workspace/result.txt', message),",
      ");",
      "console.log(message);",
    ].join("\n"),
  });

  const runResult = await sandboxSession.run({
    command: "node /workspace/example.js",
  });

  console.log(runResult.stdout.trim());
  console.log(await sandboxSession.readTextFile({ path: "/workspace/result.txt" }));
} catch (error) {
  if (error instanceof AppleContainerSandboxError) {
    console.error(error.message);
    process.exitCode = 1;
  } else {
    throw error;
  }
} finally {
  await sandboxSession?.close();
}
