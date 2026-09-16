# Contributing

## Versioning

This package follows [Semantic Versioning](https://semver.org/) (`MAJOR.MINOR.PATCH`):

- **MAJOR** — breaking API changes (e.g. 1.x → 2.0.0 when the callback API was replaced with
  Promises).
- **MINOR** — new, backwards-compatible functionality.
- **PATCH** — backwards-compatible bug fixes.

Every published change is recorded in [CHANGELOG.md](./CHANGELOG.md), following the
[Keep a Changelog](https://keepachangelog.com/) format. `CHANGELOG.md` is committed to the
repository — it is the public, permanent record of what shipped in each version.

## Release process

1. Land your changes on `master` through a pull request.
2. Move the relevant entries from the `[Unreleased]` section of `CHANGELOG.md` into a new
   dated version section.
3. Bump the version and create the matching git tag in one step:
   ```sh
   npm version patch   # or: minor / major
   ```
   This updates `package.json`/`package-lock.json` and creates a `vX.Y.Z` git commit + tag.
4. Push the commit and the tag:
   ```sh
   git push && git push --tags
   ```
5. Publish to npm (runs lint, typecheck, tests, and the build via `prepublishOnly`):
   ```sh
   npm publish
   ```
6. Create a GitHub release from the pushed tag and paste in the matching CHANGELOG section.

## Draft/local release notes

While you're working on a change, it's often useful to jot down notes, breaking-change
reminders, or a draft changelog entry before it's ready to be written up properly. Keep that kind
of scratch file **out of the repository** — for example `notes/`, `RELEASE_NOTES.local.md`, or
any file matching `*.local.md`. These patterns are already listed in `.gitignore`, so such files
never get committed or pushed, no matter which branch you're on. Once a change is ready to
ship, copy the finalized text into `CHANGELOG.md` (which _is_ committed) and delete the draft.

The same applies to any other personal, machine-specific file (scratch scripts, local `.env`
files, editor-specific notes) — keep it local, don't add it to the repo.
