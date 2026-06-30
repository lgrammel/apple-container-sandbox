export function getAbortReason(abortSignal: AbortSignal | undefined): unknown {
  return abortSignal?.reason ?? new DOMException("The operation was aborted.");
}
