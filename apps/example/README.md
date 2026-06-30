# Example

Minimal local example for `@lgrammel/apple-container-sandbox`.

The example source is TypeScript. It creates an Apple Container sandbox from
`node:22`, writes a small JavaScript workload into `/workspace`, runs it, reads
the output file back, and closes the session.

Before running it, verify the Apple Container CLI is available:

```sh
container --version
```

```sh
pnpm example
```
