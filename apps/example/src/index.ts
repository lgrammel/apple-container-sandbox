import { createAppleContainerSandbox } from "@lgrammel/apple-container-sandbox";

const sandboxProvider = createAppleContainerSandbox({
  image: "node:22",
  cwd: "/workspace",
});

const sandbox = await sandboxProvider.createSandbox();

try {
  await sandbox.writeTextFile({
    path: "/workspace/example.js",
    content: [
      "const message = 'Hello from Apple Container Sandbox';",
      "await import('node:fs/promises').then((fs) =>",
      "  fs.writeFile('/workspace/result.txt', message),",
      ");",
      "console.log(message);",
    ].join("\n"),
  });

  const runResult = await sandbox.run({
    command: "node /workspace/example.js",
  });

  console.log(runResult.stdout.trim());
  console.log(await sandbox.readTextFile({ path: "/workspace/result.txt" }));
} finally {
  await sandbox.close();
}
