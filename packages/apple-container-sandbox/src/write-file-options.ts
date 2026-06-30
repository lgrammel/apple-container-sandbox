export interface WriteFileOptions<Content> {
  path: string;
  content: Content;
  abortSignal?: AbortSignal;
}
