# Another Markdown Viewer v0.1.5

## Release scope

This release adopts Vite+ as the repository toolchain and consolidates the project's current status and release-verification guidance.

- Uses Vite+ for development, testing, production builds, and preview commands.
- Refreshes the supported dependency versions and lockfile.
- Adds Vite+ formatting, lint, and staged-check configuration.
- Documents the current implementation status and local release verification.
- Restores TypeScript recognition for CSS side-effect imports.
- Keeps embedded Base64/data-URI image conversion deferred until a product decision authorizes it.

## Verification

- `vp run check`
- `vp run test`
- `vp run test:browser`
- `vp run build`

All four commands pass. The production build reports a non-blocking warning because the main JavaScript bundle is larger than 500 kB after minification.
