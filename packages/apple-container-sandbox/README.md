# @lgrammel/apple-container-sandbox

AI SDK sandbox provider backed by Apple Container Sandboxes.

## Status

This package is an early scaffold. The public package name, workspace layout,
and publish metadata are in place; sandbox execution will be implemented next.

## Install

```sh
pnpm add @lgrammel/apple-container-sandbox
```

## Usage

```js
import { createAppleContainerSandbox } from "@lgrammel/apple-container-sandbox";

const sandboxProvider = createAppleContainerSandbox({
  image: "node:22",
});
```
