# Tool Example

Example for using the AI SDK `tool()` API with
`@lgrammel/apple-container-sandbox`.

The example defines a shell tool whose `execute` function runs commands through
the AI SDK `experimental_sandbox` option. It creates an Apple Container sandbox
from `node:22`, asks a model to use the shell tool, and stops the session when
the turn finishes.

Before running it, verify the Apple Container CLI is available:

```sh
container --version
```

Copy the example environment file, set an AI Gateway API key in `.env`, and run
the example:

```sh
cp apps/tool-example/.env.example apps/tool-example/.env
pnpm example:tool
```

The example loads `apps/tool-example/.env` with `dotenv`.

Environment variables:

- `AI_GATEWAY_API_KEY`: API key used by AI SDK Gateway.
- `TOOL_MODEL`: model passed to `generateText`.
- `TOOL_SESSION_ID`: deterministic Apple Container session id.
