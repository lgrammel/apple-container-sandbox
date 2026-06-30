export interface RunContainerCliOptions {
  abortSignal?: AbortSignal;
  stdin?: ReadableStream<Uint8Array> | Uint8Array;
}
