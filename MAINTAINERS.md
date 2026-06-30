# Maintainers

This repository publishes `@lgrammel/apple-container-sandbox` with Changesets.

## Release prerequisites

- Use Node.js 22 or newer.
- Use the pinned package manager from `package.json`: `pnpm@11.9.0`.
- Make sure `pnpm install` has completed.
- Make sure you are authenticated to npm with an account that can publish
  `@lgrammel/apple-container-sandbox`.
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

## Pre-release checks

Run the standard checks before versioning or publishing:

```sh
pnpm format:check
pnpm lint
pnpm test
pnpm build
pnpm pack:package
```

`pnpm pack:package` builds the package and creates the tarball that npm will
receive. Inspect the tarball contents when package files, exports, or README
content change.

## Versioning

After changesets are merged to `main`, create the release commit locally:

```sh
pnpm run version
git add .
git commit -m "Version packages"
```

This consumes pending changesets, updates package versions, and writes package
changelogs. Review the diff before committing.

Use `pnpm run version`, not `pnpm version`. Plain `pnpm version` is pnpm's
built-in semver command.

## Publishing

Publish the versioned package from the version commit:

```sh
pnpm release
```

The release script builds the workspace and runs `changeset publish`.
Changesets publishes packages whose versions are not already present on npm.

After publishing, verify the npm registry:

```sh
pnpm view @lgrammel/apple-container-sandbox version
```

Then push the release commit and tags:

```sh
git push
git push --tags
```

## Failed publishes

If publishing fails before npm accepts the package, fix the issue and rerun
`pnpm release` from the same version commit.

If npm accepted the package but a later step failed, do not reuse the published
version. Create a new changeset for any fix, run `pnpm run version`, and publish
a new version.
