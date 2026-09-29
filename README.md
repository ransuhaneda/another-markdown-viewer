# Another Markdown Viewer

Another Markdown Viewer is a focused, client-side browser workspace for editing Markdown, checking the rendered document, and exporting a print-ready PDF.

**Try the deployed app:** [md-viewer.384721.xyz](https://md-viewer.384721.xyz/)

## What it does

- Edit raw Markdown in CodeMirror 6.
- View the rendered document as you type.
- Use editor-only, rendered-view-only, or split layouts.
- Render GitHub-Flavored Markdown, including tables, task lists, strikethrough, and fenced code blocks.
- Open and download Markdown files in the browser.
- Recover the latest working draft locally in the same browser.
- Export the rendered document through the browser print flow for PDF output.
- Sanitize rendered HTML and unsafe link or image destinations.

The app is client-side and does not require a backend runtime. Cloudflare Pages hosts the production deployment.

## Quick start

### Requirements

- Node.js
- pnpm

### Install dependencies

```bash
pnpm install
```

### Start the development server

```bash
pnpm dev
```

Open the local URL printed by Vite. The repository configuration uses `http://127.0.0.1:5173` for the development server.

### Use the app

1. Paste or open a Markdown document.
2. Edit the source Markdown.
3. Inspect the Rendered View.
4. Save the Markdown file or download a PDF.

Use **Markdown help** in the app for the syntax reference and keyboard shortcuts.

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start the Vite development server. |
| `pnpm run check` | Run the TypeScript check without emitting files. |
| `pnpm run test` | Run the Vitest unit test suite, excluding browser tests. |
| `pnpm run test:browser` | Run the Playwright browser smoke tests. |
| `pnpm run test:browser:headed` | Run the Playwright tests with a visible browser. |
| `pnpm run build` | Create the production bundle in `dist/`. |
| `pnpm run preview` | Serve the production bundle locally. |

## Verification

Run the complete local verification set before a deployment:

```bash
pnpm run check
pnpm run test
pnpm run test:browser
pnpm run build
```

The browser tests use the local production preview server by default. Set `PLAYWRIGHT_BASE_URL` to test another deployment, for example:

```bash
PLAYWRIGHT_BASE_URL=https://md-viewer.384721.xyz pnpm run test:browser
```

## Project boundaries

- Raw Markdown is the canonical document state.
- Local recovery is automatic, but it is not a replacement for downloading a Markdown file.
- The app does not provide accounts, cloud synchronization, collaboration, or a backend service.
- The visual identity does not include user-selectable themes.

See [`DECISIONS.md`](./DECISIONS.md) for the product contract, [`DESIGN.md`](./DESIGN.md) for visual and interaction rules, and [`RELEASE_NOTES.md`](./RELEASE_NOTES.md) for release-specific changes.
