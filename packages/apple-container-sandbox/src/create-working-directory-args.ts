export function createWorkingDirectoryArgs(workingDirectory: string | undefined) {
  return workingDirectory == null ? [] : ["--workdir", workingDirectory];
}
