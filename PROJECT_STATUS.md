# Another Markdown Viewer — Project Status

**Status date:** 2026-10-24
**Repository:** `development` at `v0.1.5`
**Production:** [md-viewer.384721.xyz](https://md-viewer.384721.xyz/) on Cloudflare Pages

## Summary

Another Markdown Viewer is a client-side Vite and TypeScript application for editing raw Markdown, inspecting a rendered document, and exporting it through the browser print flow. The current release passes the TypeScript check, unit tests, browser suite, and production build against the local Vite+ preview.

Local release verification is complete. Hosted deployment verification remains separate and should use the deployed application as the browser-test target.

## Verified repository state

| Area | Current state | Evidence |
| --- | --- | --- |
| Branch and release | `development`, tag `v0.1.5` | Git history inspection |
| Production deployment | Documented at `https://md-viewer.384721.xyz/` | `README.md`, `RELEASE_NOTES.md` |
| TypeScript | Passes | `vp run check` |
| Unit tests | 31 tests pass across 6 files | `vp run test` |
| Production build | Passes | `vp run build` |
| Browser tests | 36 tests pass against the local Vite+ preview | `vp run test:browser` |
| Build warning | Main JavaScript bundle is 851.78 kB minified | Vite+ build output |
| Working tree | Clean after release preparation | Git status inspection |

## Implemented product surface

- Raw Markdown editing with CodeMirror 6.
- GitHub-Flavored Markdown rendering.
- YAML frontmatter parsing and rendered property display.
- HTML sanitization and unsafe URL handling.
- Rich-text and HTML paste conversion.
- Local draft recovery with storage-failure handling.
- Editor-only, rendered-view-only, and split layouts.
- Responsive one-pane behavior on small screens.
- Focus mode and keyboard shortcuts.
- Markdown open and download through browser file APIs.
- Browser print-to-PDF flow with dedicated print styling.
- Cloudflare Pages deployment documentation.

These capabilities are supported by source modules under `src/`, unit tests under `tests/`, and browser tests under `tests/browser/`. The browser suite now passes against the local Vite+ preview.

## Current documentation authority

1. `AGENTS.md` — routing and stable guardrails.
2. `DECISIONS.md` — accepted product contract.
3. `DESIGN.md` — visual and interaction rules.
4. `PROJECT_STATUS.md` — current verified status and release evidence.
5. `README.md` — setup and command guide.
6. `IMPLEMENTATION-ROADMAP.md` — phase sequence and remaining work.
7. `future-feature-list.md` — deferred ideas, not commitments.

If these documents conflict, stop and reconcile the conflict. Do not treat an old release note or generated test artifact as current status.

## Remaining work

### Release verification follow-up

The local browser suite passes all 36 tests against the Markdown Viewer production preview. Run it against the deployed URL when hosted release verification is required.

### Performance follow-up

Investigate the 851.78 kB minified JavaScript bundle. Code splitting or dependency review may reduce it, but this is not a release blocker by itself.

### Product-owner verification

The final acceptance phase still requires real-browser review of accessibility, performance, responsive behavior, recovery, unsafe content handling, file operations, and print output. See Phase 9 in `IMPLEMENTATION-ROADMAP.md`.

## Commands

```bash
vp run check
vp run test
vp run build
vp run test:browser
```

Use `PLAYWRIGHT_BASE_URL` only after confirming that the target serves this project:

```bash
PLAYWRIGHT_BASE_URL=https://md-viewer.384721.xyz vp run test:browser
```

## Scope boundaries

The v1 product remains client-side. It has no accounts, backend, collaboration, cloud synchronization, plugin system, selectable themes, or arbitrary custom CSS. Deferred features belong in `future-feature-list.md` and require an explicit product decision before implementation.