# Another Markdown Viewer v0.1.3

## Release scope

This release removes the Live Preview editor mode. The editor uses raw Markdown, and the Rendered View remains separate and updates as the source changes.

- Removes Live Preview controls and editor behavior.
- Keeps editor-only, rendered-only, and split layouts.
- Restores legacy recovery drafts in Source without losing Markdown or layout state.
- Removes the unused Live Preview dependency.

## Verification

- `pnpm run check`
- `pnpm run test`
- `pnpm run test:browser`
- `pnpm run build`

The production build may report a non-blocking Vite warning because the main JavaScript bundle is larger than 500 kB after minification.
