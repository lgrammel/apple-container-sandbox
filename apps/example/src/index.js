import {
  appleContainerSandboxPackageName,
  createAppleContainerSandbox,
} from "@lgrammel/apple-container-sandbox";

const sandboxProvider = createAppleContainerSandbox({
  image: "node:22",
});

console.log(`${appleContainerSandboxPackageName}: ${sandboxProvider.name}`);
