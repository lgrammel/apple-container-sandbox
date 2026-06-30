export function createEnvArgs(env: Record<string, string> = {}): string[] {
  return Object.entries(env).flatMap(([key, value]) => ["--env", `${key}=${value}`]);
}
