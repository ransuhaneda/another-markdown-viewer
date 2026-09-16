# Markdown Preview Implementation Roadmap

This roadmap breaks the product contract into focused phases. Each phase should use a separate `feat/*` branch and focused commits. Use `fix/*` branches for defects discovered after integration.

## Git baseline and workflow

- Use `development` as the integration branch.
- Start each feature branch from the latest `development`.
- Use `feat/*` for new work.
- Use `fix/*` for defects.
- Keep commits focused on one behavior, boundary, security policy, test group, or visual concern.
- Run focused tests after related changes.
- Run `pnpm check`, `pnpm test`, and `pnpm build` before integrating a phase.
- Verify editing, persistence, rendering, file access, PDF export, and responsive work in a real browser.
- Do not add backend infrastructure, Workers, accounts, analytics, a theme picker, or undocumented Markdown features.

## Phase 0 — Project foundation

**Branch:** `feat/phase-0-foundation`

Check the project-init commit before starting this phase. If Vite, TypeScript, pnpm scripts, Vitest, the initial documents, and the initial token structure are already present and verified, mark Phase 0 complete and do not recreate it.

Scope:

- Vite and TypeScript setup.
- Strict TypeScript configuration.
- Minimal pnpm scripts: `dev`, `check`, `test`, `build`, and `preview`.
- Vitest setup.
- Initial project documents.
- Initial CSS token structure.
- Basic build and test smoke checks.

Suggested commits:

```text
chore: initialize Vite TypeScript project
chore: add project verification scripts
feat: add initial design tokens
test: add foundation smoke test
```

Acceptance checks:

```bash
pnpm check
pnpm test
pnpm build
```

## Phase 1 — Application shell and visual foundation

**Branch:** `feat/phase-1-app-shell`

Scope:

- Compact application header.
- Product name and primary document actions.
- Workspace toolbar and semantic landmarks.
- Editor and preview pane structure.
- Mode and layout controls.
- Footer status area.
- Dark document canvas and restrained controls.
- Semantic design-token usage.
- Initial responsive structure.
- Accessible labels and visible active states.

Relevant documents:

- `DECISIONS.md`: Interface and design, product flow, and welcome/help sections.
- `DESIGN.md`: Layout, components, accessibility, and interaction rules.

Suggested commits:

```text
feat: add application shell and document workspace
feat: add semantic workspace controls
feat: apply document canvas and surface tokens
style: establish editor and preview pane layout
test: cover application shell expectations
```

Acceptance checks:

- The product name and primary actions are visible.
- Editor and preview regions have semantic labels.
- Active controls have visible and accessible states.
- Components use semantic tokens instead of arbitrary colors.
- Narrow layouts do not force two unusable panes.

## Phase 2 — Source editing, preview, and draft recovery

**Branch:** `feat/phase-2-editor-rendering-recovery`

Scope:

- CodeMirror source editor.
- Markdown syntax mode.
- GFM rendering.
- DOM sanitization.
- Rendered link and image behavior.
- Local draft recovery.
- Recovery debounce.
- Clear Draft.
- Basic mode switching.
- Word count.

This phase must remain separate from the application shell when implemented from the baseline. If older work combines these concerns, preserve the product behavior but avoid adding more unrelated changes to the same branch.

## Phase 3 — Document state, modes, layouts, and recovery completion

**Branch:** `feat/phase-3-document-state`

Scope:

- Separate document state from UI state.
- Keep raw Markdown as the canonical document state.
- Support editor-only, preview-only, and split layouts.
- Support one pane at a time on small screens.
- Persist and restore mode, layout, cursor position, and scroll positions.
- Autosave after a 500 ms debounce.
- Restore the latest draft on startup.
- Implement Clear Draft.
- Show a persistent warning when storage is unavailable or full.
- Continue editing in memory when recovery fails.

Suggested commits:

```text
refactor: define document and workspace state
feat: add editor-only preview-only and split layouts
feat: persist cursor and scroll recovery state
feat: restore workspace state on startup
feat: show persistent recovery failure status
test: cover document state and recovery transitions
```

## Phase 4 — GFM rendering, sanitization, URL policy, and paste conversion

**Branch:** `feat/phase-4-markdown-pipeline`

Scope:

- Required GFM constructs: headings, paragraphs, emphasis, links, images, lists, blockquotes, fenced code, tables, task lists, and strikethrough.
- Document the safe raw HTML allowlist.
- Remove scripts, event handlers, unsafe embeds, and unsafe URL schemes.
- Preserve useful link text and image alt text when destinations are unsafe.
- Configure external links with a new tab and relationship protections.
- Load HTTP and HTTPS images lazily.
- Keep failed images visible with alt text.
- Keep incomplete Markdown editable.
- Convert common rich-text and safe HTML paste to Markdown.
- Preserve unsupported HTML in source.
- Keep parser, sanitizer, URL policy, and paste conversion in focused modules.

Suggested commits:

```text
feat: define GFM rendering baseline
feat: add safe raw HTML allowlist
feat: enforce safe link and image URL policy
feat: preserve broken images and alt text
feat: convert rich text paste to Markdown
test: cover required GFM constructs
test: cover unsafe HTML and URL sanitization
test: cover rich text paste conversion
```

Use focused fix branches such as `fix/phase-4-unsafe-url-policy` for defects found after integration.

## Phase 5 — File handling and Markdown save/open

**Branch:** `feat/phase-5-file-handling`

Scope:

- Integrate `browser-fs-access`.
- Open Markdown files with browser APIs and fallback behavior.
- Download Markdown files explicitly.
- Preserve raw source text and whitespace.
- Define opening, opened, saved, cancelled, and failed states.
- Handle invalid or unsupported files without destroying the current document.
- Keep browser-only APIs at the application boundary.

Suggested commits:

```text
feat: add browser file access adapter
feat: implement Markdown file opening
feat: implement Markdown file download
feat: add file operation status feedback
test: cover file import and download behavior
```

## Phase 6 — PDF export and print styling

**Branch:** `feat/phase-6-pdf-export`

Scope:

- Add a dedicated print stylesheet.
- Print rendered document content only.
- Hide application chrome.
- Intentionally style typography, spacing, links, images, tables, code, figures, and captions.
- Avoid broken pagination through text, code blocks, figures, and other blocks where practical.
- Use the browser print-to-PDF flow for v1.
- Verify that output is flowing document content, not stitched screenshots.

Suggested commits:

```text
feat: add dedicated Markdown print stylesheet
feat: style document typography for PDF export
feat: add print pagination rules
feat: connect PDF action to browser print flow
test: cover print visibility and document-only output
```

If browser print styles cannot meet the quality contract, record a product decision before adding a dedicated PDF dependency.

## Phase 7 — Live Preview behavior

**Branch:** `feat/phase-7-live-preview`

Scope:

- Evaluate cursor mapping between source Markdown and rendered content.
- Hide unnecessary syntax when it is not active.
- Reveal syntax for the active block.
- Preserve accurate cursor placement and selections.
- Keep incomplete Markdown editable.
- Keep Source mode available.
- Use Source plus Preview as the safe fallback if reliable mapping is not possible.

Keep this phase isolated because it is the highest-risk editor behavior. Do not mix it with persistence, file handling, or visual redesign.

## Phase 8 — Help, accessibility, responsive behavior, and polish

**Branch:** `feat/phase-8-interface-polish`

Scope:

- Add a compact in-page help modal.
- Include only the Markdown syntax reference and keyboard shortcuts.
- Trap modal focus and return focus to the trigger.
- Support Escape and keyboard navigation.
- Audit labels, focus order, pressed states, and visible focus.
- Verify browser zoom and small screens.
- Add subtle pane, panel, and mode transitions.
- Respect `prefers-reduced-motion`.

Suggested commits:

```text
feat: add Markdown syntax and shortcut help modal
feat: add accessible modal focus management
feat: add responsive single-pane workspace behavior
feat: add reduced-motion-safe workspace transitions
fix: improve keyboard focus and control states
test: cover help modal keyboard behavior
```

## Phase 9 — Release verification

**Branch:** `feat/phase-9-release-verification`

Scope:

- Run the full automated checks.
- Verify the primary paste, edit, inspect, and PDF flow in a real browser.
- Verify recovery, Clear Draft, storage failure, and documents near 5 MB.
- Verify unsafe HTML, URLs, images, broken images, and unsupported HTML.
- Verify narrow and wide layouts, browser zoom, and print preview.
- Check bundle size and investigate warnings.
- Create a separate `fix/release-*` branch for each verified defect class.

Required commands:

```bash
pnpm check
pnpm test
pnpm build
pnpm dev
```

## Phase completion checklist

```text
[ ] Scope matches DECISIONS.md.
[ ] No deferred feature was implemented accidentally.
[ ] No backend, Worker, account, analytics, or theme system was added.
[ ] Raw Markdown remains the canonical document state.
[ ] Focused tests were added or updated.
[ ] Focused tests pass.
[ ] pnpm check passes.
[ ] pnpm test passes.
[ ] pnpm build passes.
[ ] Real-browser verification was performed when required.
[ ] The diff contains no unrelated changes.
[ ] Known limitations are recorded.
```

## Current starting point

The project-init commit is the baseline for deciding whether Phase 0 is complete. The previous Phase 2 implementation is being removed from the active branch so work can restart from the first incomplete phase.
