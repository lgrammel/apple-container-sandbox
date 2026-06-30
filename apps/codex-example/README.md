# Codex Example

Example for running `@ai-sdk/harness-codex` with
`@lgrammel/apple-container-sandbox`.

The Codex harness starts a WebSocket bridge inside the sandbox, so this example
creates an Apple Container sandbox with a published local bridge port.

Before running it, verify the Apple Container CLI is available:

```sh
container --version
```

Set an API key and run the example:

```sh
OPENAI_API_KEY=... pnpm example:codex
```

Optional environment variables:

- `CODEX_MODEL`: model passed to the Codex harness.
- `CODEX_BRIDGE_PORT`: local bridge port. Defaults to `4100`.
- `CODEX_SESSION_ID`: deterministic Apple Container session id.
