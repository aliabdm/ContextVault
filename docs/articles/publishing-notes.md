# Publishing notes

## Medium

- File: `medium-contextvault-desktop.md`
- Title: **The Code Survived. The Reasoning Disappeared.**
- Subtitle: **I could recover the code, but not the decisions that produced it. Here is how that problem became a local-first CLI, and why its first Desktop interface had to be rebuilt.**
- Suggested topics: Artificial Intelligence, Programming, Open Source, Desktop Apps, Developer Tools
- Suggested preview text: **Git showed me what changed, but the AI conversations that explained why were scattered or gone. That failure became ContextVault—and later forced me to rebuild its Desktop app.**
- Cover image: `https://context-vault-two.vercel.app/demo/desktop-walkthrough/step-11.png`

## Dev.to

- File: `devto-contextvault-desktop.md`
- Front matter is already included with `published: false`.
- Suggested organization: personal profile
- Suggested series: leave empty unless more ContextVault engineering posts are planned
- Suggested discussion question: **If you build a GUI over an existing CLI, when do you spawn the command and when do you call the underlying library directly?**

## Publishing order

Both articles now explain ContextVault from zero before discussing the Desktop redesign, but they use different angles and can be published independently:

- Medium: product journey, UX mistake, local-first philosophy, and roadmap.
- Dev.to: Electron architecture, IPC, file watching, parity mapping, and verification.

If both are substantially rewritten into the same text later, publish the preferred original first and set the other platform's canonical URL to it. With the current distinct versions, a shared canonical URL is not necessary.

## Links verified before publishing

- Landing: `https://context-vault-two.vercel.app/`
- Downloads: `https://context-vault-two.vercel.app/download`
- GitHub: `https://github.com/aliabdm/ContextVault`
- npm: `https://www.npmjs.com/package/@aliabdm/contextvault`
- FAQ: `https://context-vault-two.vercel.app/faq`
- All three article image URLs returned HTTP 200 on 2026-07-04.
