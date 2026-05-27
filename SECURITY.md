# Security Policy

## Privacy Model

ContextVault is local-first. It stores captured conversations in the browser extension's IndexedDB database and generates exports locally when the user clicks an export button.

The extension does not include:

- Analytics
- Telemetry
- A hosted backend
- Automatic cloud sync
- Third-party data upload

## Host Permissions

The extension intentionally avoids `<all_urls>`. Content scripts and the injected network monitor run only on the supported LLM hosts listed in `manifest.json`.

When adding a new provider, contributors should add the narrowest possible host permission and a provider-specific adapter.

## Reporting Issues

Please report security issues privately if the repository has private advisories enabled. If not, open an issue with minimal reproduction details and avoid including private conversation content.

Useful report details:

- Browser version
- Extension version or commit
- Supported provider URL
- Whether the issue is DOM capture, network capture, storage, or export
- Minimal redacted steps to reproduce

## Dependency Audit Notes

Build tooling can produce `npm audit` findings in dev dependencies. Do not apply major-version audit fixes blindly; verify that CRX, Vite, TypeScript, and Vitest still build the extension before merging.
