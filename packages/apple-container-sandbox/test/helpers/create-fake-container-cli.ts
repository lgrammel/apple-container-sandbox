import { chmod, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

export async function createFakeContainerCli() {
  const directory = await mkdtemp(join(tmpdir(), "fake-container-cli-"));
  const containerBinary = join(directory, "container");

  await writeFile(
    containerBinary,
    `#!/usr/bin/env node
import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";

const args = process.argv.slice(2);
const command = args[0];

if (["create", "start", "stop", "delete"].includes(command)) {
  process.exit(0);
}

if (command !== "exec") {
  console.error(\`unsupported command: \${command}\`);
  process.exit(2);
}

let index = 1;
let interactive = false;
let cwd = process.cwd();
const env = { ...process.env };

while (args[index]?.startsWith("-")) {
  const option = args[index++];

  if (option === "--interactive" || option === "-i") {
    interactive = true;
  } else if (option === "--env" || option === "-e") {
    const [key, ...value] = args[index++].split("=");
    env[key] = value.join("=");
  } else if (
    option === "--workdir" ||
    option === "--cwd" ||
    option === "-w"
  ) {
    cwd = args[index++];
    mkdirSync(cwd, { recursive: true });
  } else {
    console.error(\`unsupported exec option: \${option}\`);
    process.exit(2);
  }
}

index += 1;
const processArgs = args.slice(index);
const child = spawn(processArgs[0], processArgs.slice(1), {
  cwd,
  env,
  stdio: [interactive ? "pipe" : "ignore", "pipe", "pipe"],
});

if (interactive) {
  process.stdin.pipe(child.stdin);
}

child.stdout.pipe(process.stdout);
child.stderr.pipe(process.stderr);
child.on("error", (error) => {
  console.error(error.message);
  process.exit(1);
});
child.on("close", (code) => process.exit(code ?? 1));
`,
  );

  await chmod(containerBinary, 0o755);
  return containerBinary;
}
