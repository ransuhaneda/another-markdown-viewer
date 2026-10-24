# Another Markdown Viewer — Project Status

**Status date:** 2026-10-02  
**Repository:** `development` at `v0.1.4`  
**Production:** [md-viewer.384721.xyz](https://md-viewer.384721.xyz/) on Cloudflare Pages

## Summary

Another Markdown Viewer is a client-side Vite and TypeScript application for editing raw Markdown, inspecting a rendered document, and exporting it through the browser print flow. The current release is deployed and the TypeScript check, unit tests, and production build pass.

The project is **not release-verification complete**. The browser suite currently fails because the local preview at the configured test URL does not expose the expected Markdown Viewer DOM. The failure is an environment or target mismatch until the preview target is confirmed; it must not be reported as a product regression without that confirmation.

## Verified repository state

| Area | Current state | Evidence |
| --- | --- | --- |
| Branch and release | `development`, tag `v0.1.4` | Git history inspection |
| Production deployment | Documented at `https://md-viewer.384721.xyz/` | `README.md`, `RELEASE_NOTES.md` |
| TypeScript | Passes | `pnpm run check` |
| Unit tests | 31 tests pass across 6 files | `pnpm run test` |
| Production build | Passes | `pnpm run build` |
| Browser tests | 36 tests fail against the configured local preview | `pnpm run test:browser` |
| Build warning | Main JavaScript bundle is 864.40 kB minified | Vite build output |
| Working tree | Documentation was clean before this consolidation; browser test output was generated during verification | Git status inspection |

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

These capabilities are supported by source modules under `src/`, unit tests under `tests/`, and browser tests under `tests/browser/`. The browser suite still needs a valid target run before these behaviors are considered release-verified.

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

### Release verification blocker

Run the browser suite against the intended application. The current run reported contact-form DOM such as `Name`, `Email`, and `Message`, while the tests expected Another Markdown Viewer selectors such as `[data-editor-label]`, `.preview-content`, and `[data-pane="editor"]`. Confirm `PLAYWRIGHT_BASE_URL`, the preview process, and the checked-out project before rerunning.

Do not mark the browser suite passed until all 36 tests run against the Markdown Viewer build and the result is recorded.

### Performance follow-up

Investigate the 864.40 kB minified JavaScript bundle. Code splitting or dependency review may reduce it, but this is not a release blocker by itself.

### Product-owner verification

The final acceptance phase still requires real-browser review of accessibility, performance, responsive behavior, recovery, unsafe content handling, file operations, and print output. See Phase 9 in `IMPLEMENTATION-ROADMAP.md`.

## Commands

```bash
pnpm run check
pnpm run test
pnpm run build
pnpm run test:browser
```

Use `PLAYWRIGHT_BASE_URL` only after confirming that the target serves this project:

```bash
PLAYWRIGHT_BASE_URL=https://md-viewer.384721.xyz pnpm run test:browser
```

## Scope boundaries

The v1 product remains client-side. It has no accounts, backend, collaboration, cloud synchronization, plugin system, selectable themes, or arbitrary custom CSS. Deferred features belong in `future-feature-list.md` and require an explicit product decision before implementation.