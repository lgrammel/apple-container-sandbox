export async function collectStream(stream: ReadableStream<Uint8Array> | null) {
  if (stream == null) {
    throw new Error("Expected sandbox file stream.");
  }

  const chunks: Buffer[] = [];

  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }

  return Buffer.concat(chunks);
}
