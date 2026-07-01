import "dotenv/config";

import { generateText, isStepCount, tool } from "ai";
import { z } from "zod/v4";
import {
  AppleContainerSandboxError,
  createAppleContainerSandbox,
  type AppleContainerSandboxSession,
} from "@lgrammel/apple-container-sandbox";

const model = process.env.TOOL_MODEL;
const sessionId = process.env.TOOL_SESSION_ID ?? "apple-container-tool-example";
const prompt =
  process.argv.slice(2).join(" ") ||
  [
    "Use the shell tool to create /workspace/tool-demo/hello.js.",
    "The file should print a concise greeting from the AI SDK shell tool example.",
    "Run the file with node and summarize the result.",
  ].join(" ");

if (!process.env.AI_GATEWAY_API_KEY) {
  throw new Error("Set AI_GATEWAY_API_KEY before running the AI SDK shell tool example.");
}

if (!model) {
  throw new Error("Set TOOL_MODEL before running the AI SDK shell tool example.");
}

const appleContainerSandbox = createAppleContainerSandbox({
  image: "node:22",
  cwd: "/workspace",
});

const shellTool = tool({
  description: "Run a shell command inside the Apple Container sandbox.",
  inputSchema: z.object({
    command: z.string().describe("Shell command to run."),
    workingDirectory: z
      .string()
      .optional()
      .describe("Directory where the command should run. Defaults to /workspace."),
  }),
  execute: async ({ command, workingDirectory }, { experimental_sandbox, abortSignal }) => {
    if (!experimental_sandbox) {
      throw new Error("The shell tool requires an AI SDK experimental_sandbox.");
    }

    return experimental_sandbox.run({
      command,
      workingDirectory,
      abortSignal,
    });
  },
});

let sandboxSession: AppleContainerSandboxSession | undefined;

try {
  sandboxSession = await appleContainerSandbox.createSession({ sessionId });

  const result = await generateText({
    model,
    tools: {
      shell: shellTool,
    },
    experimental_sandbox: sandboxSession,
    stopWhen: isStepCount(3),
    prompt,
    onToolExecutionStart: ({ toolCall }) => {
      console.log(`[tool] ${toolCall.toolName}`);
    },
  });

  console.log(result.text);
} catch (error) {
  if (error instanceof AppleContainerSandboxError) {
    console.error(error.message);
    process.exitCode = 1;
  } else {
    throw error;
  }
} finally {
  await sandboxSession?.stop();
}
