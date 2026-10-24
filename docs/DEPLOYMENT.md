# ContextVault deployment and releases

This guide documents the GitHub Actions workflows that are in this repository and the manual steps for releases that do not have a workflow.

## What runs automatically?

Pushing a normal commit or merging a pull request into `main` does **not** publish a package, create a Desktop release, or upload the Chrome extension to the Chrome Web Store. The release workflows run only when you push a matching Git tag:

| Deliverable | Version source | Tag to push | Workflow | Result |
| --- | --- | --- | --- | --- |
| npm package | `package.json` | `npm-v<version>` | `.github/workflows/npm-release.yml` | Tests/builds and publishes to npmjs.com |
| GitHub Packages npm package | `package.json` | `github-package-v<version>` | `.github/workflows/github-package-release.yml` | Tests/builds and publishes to `npm.pkg.github.com` |
| Desktop | `desktop/package.json` | `v<version>` | `.github/workflows/release.yml` | Builds Windows installer and Linux AppImage, then creates/updates a GitHub Release |
| Chrome extension | `manifest.json` | None | No store-publishing workflow exists | Build and upload a ZIP manually in the Chrome Web Store Developer Dashboard |

The root build workflow builds the browser extension as a check, but it does not publish it to any extension store. The npm and GitHub Packages workflows also run the root test/build commands before publishing the CLI package; they do not publish a new extension release.

Each tag is independent. A normal push does not trigger any of the release workflows, and pushing one tag does not trigger the other release workflows.

## Before releasing

1. Make the changes and commit them on the branch you intend to release.
2. From the repository root, run `npm ci`, `npm test`, and `npm run build`.
3. For Desktop changes, run `npm ci` and `npm run build` from `desktop/` too. The Desktop release workflow builds on Windows and Linux runners.
4. Push the release commit to GitHub before pushing its tag.
5. Check the run under the repository's **Actions** tab. Confirm it succeeds and inspect its artifacts or published release.

The commands below assume the intended source commit is checked out and the working tree is clean. Replace each example version with the new version in the matching manifest.

## Publish a new version to npmjs.com

The root `package.json` version controls the npm package. Update it to a version not already published on npm, for example `1.3.4`, and commit/push that change. Then push the matching tag:

```bash
git tag npm-v1.3.4
git push origin npm-v1.3.4
```

The `Publish npm package` workflow verifies that the tag exactly matches `package.json`, runs `npm ci`, `npm test`, and `npm run build`, then runs `npm publish --access public` against `https://registry.npmjs.org`.

GitHub Actions must have the repository secret `NPM_TOKEN` configured with permission to publish this npm package. The workflow uses it as `NODE_AUTH_TOKEN`; it is not stored in the repository files. If publish fails with `ENEEDAUTH`, check that the secret exists and is valid. If it fails with npm `E403`/2FA, the token's npm permissions or publish/2FA policy must allow this automated publish.

## Publish a new version to GitHub Packages

The GitHub Packages npm registry is separate from npmjs.com. The root `package.json` version controls the package version in both registries, so use a version that is not already published to GitHub Packages. Commit/push the version change, then push this tag:

```bash
git tag github-package-v1.3.4
git push origin github-package-v1.3.4
```

The `Publish GitHub npm package` workflow verifies the tag against `package.json`, runs the root install/test/build, and publishes to `https://npm.pkg.github.com`. It uses the workflow's built-in `GITHUB_TOKEN`; the job grants it `packages: write`, so no GitHub token secret is needed. The `repository` field in `package.json` points to this repository and lets GitHub associate the package with it.

The package listing is under the repository's **Packages** section. If a newly published package is private, an owner can open that package's **Package settings** and change its visibility to **Public**. GitHub does not make npmjs.com and GitHub Packages versions mirror one another automatically.

## Publish a Desktop release

The `desktop/package.json` version controls Desktop releases independently of the root CLI version. Update it to a new release version, for example `1.8.1`, and commit/push the change. Push a tag with a `v` prefix:

```bash
git tag v1.8.1
git push origin v1.8.1
```

The `Release` workflow checks the tag against `desktop/package.json`. It runs Windows and Linux builds in parallel, uploads the Windows `ContextVault-Setup-*.exe` and Linux `ContextVault-*.AppImage`, then creates/updates the GitHub Release and release notes. It uses `GITHUB_TOKEN` with `contents: write`; no separate release token is configured in the workflow.

The workflow does not build or upload a macOS installer. A macOS source build can be made locally from `desktop/` with `npm run package:mac`; uploading a macOS artifact to a GitHub Release is a separate manual task unless the workflow is extended.

## Release the Chrome extension

There is no GitHub Actions workflow in this repository that uploads the extension to the Chrome Web Store. Build output is generated in the root `dist/` directory by:

```bash
npm ci
npm test
npm run build
```

Before each store release, update `manifest.json`'s `version` to a new Chrome extension version (three numeric components, for example `1.3.1`), commit the change, and push it. From the repository root, create a ZIP containing the **contents** of `dist/` (so `manifest.json` is at the ZIP root), for example in PowerShell:

```powershell
npm ci
npm test
npm run build
Compress-Archive -Path dist\* -DestinationPath contextvault-extension-1.3.1.zip -Force
```

Open the Chrome Web Store Developer Dashboard, select the ContextVault extension, upload the ZIP as a new package, review the permissions and store listing, then submit it for review/publish. Do not upload the whole repository or a ZIP with `dist/` as its top-level folder. Keep the source `manifest.json` version higher than the version already published in the store.

The repository currently has an old checked-in ZIP under `release/`; it is not generated or uploaded by a workflow. Build a fresh ZIP from `dist/` for each extension release.

## Releasing more than one deliverable

The deliverables have separate versions and triggers. If a change needs both a new npm release and a Desktop release, update both version files, push the commit, and push both matching tags. To also publish to GitHub Packages, push its matching `github-package-v<root-package-version>` tag. The extension still needs its own `manifest.json` version bump, ZIP, and manual Chrome Web Store submission. No single normal push currently releases all four deliverables.

## Workflow inventory

- `.github/workflows/npm-release.yml` — npmjs.com CLI package publication; tag `npm-v*`; requires `NPM_TOKEN`.
- `.github/workflows/github-package-release.yml` — GitHub Packages CLI package publication; tag `github-package-v*`; uses `GITHUB_TOKEN` with `packages: write`.
- `.github/workflows/release.yml` — Windows/Linux Desktop builds and GitHub Releases; tag `v*`; uses `GITHUB_TOKEN` with `contents: write`.
- Chrome Web Store publication — no workflow configured; manual build, ZIP, and dashboard upload.
