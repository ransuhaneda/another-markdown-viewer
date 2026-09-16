# Markdown Preview v0.1.0

## Release scope

This release completes the documented v1 implementation phases:

- Application shell and visual foundation.
- Source editing, GFM preview, and local draft recovery.
- Document state, layouts, cursor recovery, and scroll recovery.
- Markdown sanitization, URL policy, and rich-text paste conversion.
- Markdown file open and save operations.
- Browser print-to-PDF export with dedicated print styles.
- Live Preview active-block mapping.
- Help dialog, keyboard behavior, responsive layout, and reduced-motion handling.

## Verification

- `pnpm check` passes.
- `pnpm test` passes with 17 tests.
- `pnpm build` passes.
- `git diff --check` passes.
- The production build has a known non-blocking Vite warning because the main JavaScript bundle is larger than 500 kB after minification.

## Known release limitation

The final manual browser, accessibility, performance, and print-preview review remains a product-owner responsibility. The application uses browser print-to-PDF for v1 as documented.
