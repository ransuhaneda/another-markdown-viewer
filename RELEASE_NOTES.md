# Another Markdown Viewer v0.1.1

## Release scope

This release integrates the latest `feat/general-changes` work while keeping Live Preview editing disabled in production until it passes further testing.

- Keeps Source editing and the separate rendered Preview pane available.
- Restores older Live Preview recovery drafts safely in Source mode.
- Includes the documented v1 implementation phases for file handling, recovery, Markdown rendering, and PDF export.

## Verification

- `pnpm run check`
- `pnpm run test`
- `pnpm run test:browser`
- `pnpm run build`

The production build may report a non-blocking Vite warning because the main JavaScript bundle is larger than 500 kB after minification.
