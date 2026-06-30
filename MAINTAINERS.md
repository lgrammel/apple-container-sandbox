# Maintainers

This repository publishes `@lgrammel/apple-container-sandbox` with Changesets.

## Release prerequisites

- Use Node.js 22 or newer.
- Use the pinned package manager from `package.json`: `pnpm@11.9.0`.
- Make sure `pnpm install` has completed.
- Make sure you are authenticated to npm with an account that can publish
  `@lgrammel/apple-container-sandbox`.
- If publishing fails with an OTP or non-interactive auth error, run
  `npm login` first. Press Enter when npm prompts to open the browser, complete
  the browser login, then rerun the publish command.
- Release from `main` after the branch is up to date with `origin/main`.

## Adding changesets

Every user-visible package change should include a changeset.

```sh
pnpm changeset
```

Choose `@lgrammel/apple-container-sandbox`, select the semver bump, and write a
concise release note for package users.

Use:

- `patch` for bug fixes and documentation that ships in the package.
- `minor` for backwards-compatible API or behavior additions.
- `major` for breaking API, runtime, packaging, or behavior changes.

Commit the generated `.changeset/*.md` file with the implementation change.

## Publishing

After changesets are merged to `main`, publish with one command:

```sh
pnpm release
```

The release script:

- requires a clean `main` branch that is in sync with its upstream;
- consumes pending changesets with `pnpm run version`;
- runs `pnpm format:check`, `pnpm lint`, `pnpm test`, and `pnpm build`;
- verifies package contents with an npm publish dry run;
- commits the version and changelog updates as
  `Release @lgrammel/apple-container-sandbox@<version>`;
- publishes with `changeset publish`;
- ensures the Changesets release tag exists.

Changesets publishes packages whose versions are not already present on npm and
creates package tags such as `@lgrammel/apple-container-sandbox@0.0.2` after npm
accepts the publish.

For npm two-factor auth, pass the OTP through the release script:

```sh
pnpm release --otp 123456
```

To verify the checks and npm package contents without versioning, committing,
publishing, or tagging, run:

```sh
pnpm release:dry
```

After publishing, verify the npm registry:

```sh
pnpm view @lgrammel/apple-container-sandbox version
```

Then push the release commit and tag:

```sh
git push
git push origin @lgrammel/apple-container-sandbox@<version>
```

Alternatively, let the release script push both after a successful publish:

```sh
pnpm release --push
```

## Failed publishes

If publishing fails before npm accepts the package, fix the issue and rerun
`pnpm release` from the same version commit.

If npm accepted the package but a later step failed, do not reuse the published
version. Create a new changeset for any fix, run `pnpm run version`, and publish
a new version.
