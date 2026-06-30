export function selectLineRange(
  text: string,
  startLine = 1,
  endLine = Number.POSITIVE_INFINITY,
): string {
  if (startLine < 1 || endLine < startLine) {
    return "";
  }

  const lines = text.split(/\r?\n/);
  return lines.slice(startLine - 1, endLine).join("\n");
}
