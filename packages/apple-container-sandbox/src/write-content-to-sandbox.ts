import type { AppleContainerSandboxSession } from "./apple-container-sandbox-session.js";
import type { WriteFileOptions } from "./write-file-options.js";

export async function writeContentToSandbox(
  sandbox: AppleContainerSandboxSession,
  options: WriteFileOptions<Uint8Array>,
): Promise<void> {
  await sandbox.writeFile({
    ...options,
    content: new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(options.content);
        controller.close();
      },
    }),
  });
}
