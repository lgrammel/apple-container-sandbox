# Codex Example

Example for running `@ai-sdk/harness-codex` with
`@lgrammel/apple-container-sandbox`.

The Codex harness starts a WebSocket bridge inside the sandbox, so this example
creates an Apple Container sandbox with a published local bridge port.

Before running it, verify the Apple Container CLI is available:

```sh
container --version
```

Copy the example environment file, set an API key in `.env`, and run the
example:

```sh
cp apps/codex-example/.env.example apps/codex-example/.env
pnpm example:codex
```

The example loads `apps/codex-example/.env` with `dotenv`. Set one of
`OPENAI_API_KEY`, `CODEX_API_KEY`, or `AI_GATEWAY_API_KEY`.

Optional environment variables:

- `CODEX_MODEL`: model passed to the Codex harness.
- `CODEX_BRIDGE_PORT`: local bridge port. Defaults to `4100`.
- `CODEX_SESSION_ID`: deterministic Apple Container session id.
