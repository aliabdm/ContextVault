# ContextVault release process

ContextVault has two independently versioned deliverables.

## Desktop releases

- Version source: `desktop/package.json`
- Tag format: `v<desktop-version>` (example: `v1.5.5`)
- Workflow: `.github/workflows/release.yml`
- Output: Windows installer and Linux AppImage attached to the GitHub Release

The workflow rejects a tag that does not match `desktop/package.json`. Create the tag only after the release branch passes all builds and is pushed.

## npm package releases

- Version source: root `package.json`
- Published files: `scripts/context-engine.mjs`, `scripts/vault-terminal.mjs`, `README.md`, and `LICENSE`
- Tag format: `npm-v<package-version>` (example: `npm-v1.3.1`)
- Workflow: `.github/workflows/npm-release.yml`
- Required repository secret: `NPM_TOKEN`

Bump and publish the npm package when `scripts/context-engine.mjs`, `scripts/vault-terminal.mjs`, the CLI contract, or package metadata changes materially. Desktop-only, landing-only, extension-only, and documentation-only changes do not require an npm version bump.

## Before either release

1. Confirm the working tree contains no personal notes, generated intermediates, or duplicate recorder scripts.
2. Run `npm test` and `npm run build` at the repository root.
3. Run `npm run build` in `desktop/` and `landing/`.
4. Verify download routes and the landing demo in a browser.
5. Push the release branch before pushing its annotated tag.
