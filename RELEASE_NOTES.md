# Another Markdown Viewer v0.1.4

## Release scope

This release documents the Cloudflare Pages deployment and removes repository-local OMH workflow metadata that is not required to build, deploy, or use the application.

- Adds the production URL to the project documentation.
- Adds the setup, usage, command, and verification guide in `README.md`.
- Ignores `.omh/` because it contains local workflow metadata rather than application source or deployment configuration.
- Keeps the current Source and Rendered View workflow accurate in the documentation.

## Verification

- `pnpm run check`
- `pnpm run test`
- `pnpm run test:browser`
- `pnpm run build`

The production build may report a non-blocking Vite warning because the main JavaScript bundle is larger than 500 kB after minification.
