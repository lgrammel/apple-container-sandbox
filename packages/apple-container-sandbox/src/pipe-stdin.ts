import { type Writable } from "node:stream";
import { Readable } from "node:stream";
import { type ReadableStream as NodeReadableStream } from "node:stream/web";

export function pipeStdin(
  stdin: Writable,
  content: ReadableStream<Uint8Array> | Uint8Array | undefined,
): Promise<void> {
  if (content == null) {
    stdin.end();
    return Promise.resolve();
  }

  if (content instanceof ReadableStream) {
    return new Promise((resolve, reject) => {
      Readable.fromWeb(content as NodeReadableStream<Uint8Array>).pipe(stdin);
      stdin.on("finish", resolve);
      stdin.on("error", reject);
    });
  }

  return new Promise((resolve, reject) => {
    stdin.end(Buffer.from(content), () => resolve());
    stdin.on("error", reject);
  });
}
