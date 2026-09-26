# Another Markdown Viewer — Product Decisions

This file records decisions settled during the project discovery interview. Implementation details not listed here remain open and must not conflict with this contract.

## Product

- Product name: **Another Markdown Viewer**.
- Primary goal: a polished writing tool with a low-friction Markdown workflow.
- Target platform: browser web app.
- Initial deployment: Cloudflare Pages.
- Cloudflare Workers are deferred until a server-side requirement exists.
- The first release is a practical Markdown writing surface, not a document-management system.

## Editing model

- The canonical document state is the raw Markdown string.
- Source editing and Live Preview editing operate on the same underlying Markdown document.
- Source structure and whitespace should be preserved as much as possible.
- The editor should not normalize or rewrite Markdown automatically.
- The intended editing experience is similar to Obsidian Live Preview: formatted text is shown without unnecessary Markdown markers, and the relevant Markdown syntax is revealed while editing.
- The editor should prioritize accurate cursor placement and reveal the active block.
- When a selection spans formatted regions, the relevant Markdown syntax should become visible so the selected content remains predictable to edit.
- If reliable Live Preview cursor mapping cannot be achieved, the safe fallback is Source plus Preview rather than a fragile approximation.
- Plain/source editing remains available for users who need to see the actual Markdown.
- Editor modes are Live and Source.
- Live shows formatted Markdown in the editable pane. Source shows raw Markdown.
- Rendered View is a pane, not an editor mode.
- Pane layouts are editor-only, rendered-view-only, and split view.
- Both editor modes support split view. The rendered pane stays visible when Source is active.
- On small screens, show one pane at a time with a clear editor/preview toggle.
- Keep the application frame fixed for long documents. The editor and Rendered View scroll independently.
- Rendered Markdown content uses the available width of its pane.
- Keyboard shortcuts support standard text editing, Markdown formatting, explicit Markdown save, and Focus mode. Bold uses `Ctrl/Cmd+B`, italic uses `Ctrl/Cmd+I`, strikethrough uses `Alt+Shift+S`, links use `Ctrl/Cmd+K`, and code blocks use `Ctrl+Shift+K` or `Cmd+Option+C` on macOS. No command palette is included in v1.

## Markdown support

- V1 targets GitHub Flavored Markdown.
- Markdown files may start with YAML frontmatter enclosed by `---` delimiters. A closing `...` delimiter is also accepted.
- Valid YAML frontmatter is parsed and shown as a key/value table above the rendered Markdown. Array values are shown as separate values.
- Frontmatter remains part of the canonical Markdown source and is not rewritten.
- Invalid or unterminated frontmatter remains visible as Markdown content.
- CommonMark and Markdown Extra are future extensions, not v1 requirements.
- Live Preview should support headings, emphasis, strikethrough, inline code, links, images, blockquotes, ordered and unordered lists, task-list markers, and fenced code blocks.
- Tables may be rendered in v1 but are not required to receive complex Live Preview editing behavior initially.
- Incomplete Markdown should remain ordinary text while the user is typing; it must not block editing or preview rendering.
- Rich-text paste should preserve Markdown when present and convert common formatting to Markdown when needed.
- Pasted HTML should convert common safe elements to Markdown and preserve unsupported HTML in the source.
- Raw HTML blocks are supported subject to sanitization.
- The `<kbd>` HTML element is supported in Markdown and uses a dark keycap style in Preview.
- Print output uses a light keycap style.

## Rendering and security

- Rendered Preview supports interactive links and images.
- External links open in a new tab with appropriate relationship protections.
- External HTTP and HTTPS images load normally and use lazy loading where appropriate.
- Unsafe URL schemes are sanitized. Useful visible text or image alt text remains when a destination is unsafe; the unsafe destination becomes inert.
- Raw HTML is sanitized using a documented allowlist of permitted elements and attributes.
- Scripts, event handlers, unsafe embeds, and unsafe URL schemes are not allowed.
- Unsupported or unsafe HTML is removed from rendered Preview but preserved in the Markdown source as visible escaped content where necessary.
- Failed images remain visible through a broken-image state with alt text rather than being silently hidden.
- The supplied image showcase is a rendering and styling reference for headings, separators, code blocks, responsive images, galleries, side-by-side layouts, figures/captions, lazy loading, and dark document presentation. It is not a requirement to support arbitrary pasted page CSS/classes.

## File handling and recovery

- Users can paste Markdown directly without uploading a file.
- File handling uses the `browser-fs-access` library rather than a bespoke filesystem abstraction.
- Browser file APIs are used where available, with import/download fallback behavior.
- Explicit Save means saving/downloading a Markdown file, not merely writing recovery data.
- Local browser recovery is automatic and central to the product.
- Recovery stores one latest document and restores it immediately on startup.
- Recovery autosaves after a 500 ms debounce following changes.
- Persisted recovery state includes Markdown, useful editor settings, last mode/layout, cursor position, and scroll position.
- Clear Draft deletes the recovery document and opens a blank editor.
- Local recovery is not a substitute for explicit file saving.
- If local storage is unavailable or full, continue editing in memory and show a persistent recovery warning; this is secondary to the main copy, inspect, and PDF-download flow.
- V1 targets large technical documents up to approximately 5 MB.

## Export

- PDF export produces a print-quality rendered document.
- Markdown content should transfer seamlessly to PDF as real flowing document content, not as stitched screenshots.
- PDF pagination must avoid cutting text, code blocks, figures, and other blocks in visually broken ways where practical.
- PDF typography, spacing, links, images, tables, code blocks, and page layout should be intentionally styled for reading and printing.
- V1 uses browser print styles and the system print-to-PDF flow.
- PDF output contains the rendered document only, not application chrome.
- A dedicated print stylesheet should define export layout rather than copying the screen layout.

## Interface and design

- The interface is a single intentional visual identity, not a user-selectable theme system.
- The document canvas is dark, calm, and developer-tool oriented.
- The surrounding application controls are restrained and functional.
- Priorities: calm focus, developer-tool clarity, minimal chrome, excellent typography, Obsidian-like editing behavior, dark document canvas, accessibility, responsive behavior, and image-rich Markdown rendering.
- Pane scrollbars use the accent color and stay narrow so they do not obscure document content.
- Motion is subtle and limited to pane, panel, and mode transitions; it must respect reduced-motion preferences and never delay writing or cursor movement.
- V1 UI includes: product name, new/clear document, open file, save/download, PDF export, mode/layout toggle, split-pane resize handle, word/character count, recovery status, keyboard-shortcut help, and Markdown syntax help.
- Help is limited to the Markdown syntax reference and keyboard shortcuts.
- Focus mode hides application chrome and pane headers while preserving the current editor mode and pane layout.
- Focus mode keeps the document panes and split resize handle available. Users can exit with a floating control or `Escape`.
- Focus mode is session-only. It resets after reload and is not part of document state or local recovery.
- Entering Focus mode moves focus to the visible document pane. Exiting restores focus to the header control.
- Focus mode follows the existing one-pane small-screen model and does not change print output.

## Technology

- Vite.
- TypeScript.
- CodeMirror 6.
- A GitHub-Flavored Markdown parser.
- A DOM sanitization library.
- `browser-fs-access`.
- Client-side architecture with no required backend runtime for v1.

## Acceptance and ownership

- Acceptance is production-ready through the first six phases: document/recovery, source editing, Live Preview, GFM rendering/sanitization, file handling/PDF export, and responsive behavior.
- The user owns the final phase: accessibility, performance, and browser verification.

## Product flow

- The primary user flow is: copy Markdown into the editor, make small edits, inspect it in Live Preview, and download a polished PDF.
- The product does not need to encourage users to complete an entire long-form writing workflow inside the app.
- Local recovery protects copied and lightly edited content, but it is secondary to the inspect-and-download flow.

## Markdown support contract

- V1 requires GFM headings, paragraphs, emphasis, links, images, lists, blockquotes, fenced code blocks, tables, task lists, and strikethrough.
- Footnotes are not required unless the selected parser provides them without adding special product complexity.
- Raw HTML uses a documented allowlist of safe elements and attributes.
- The allowlist may include common structural elements, `figure`, `figcaption`, images, links, tables, and code-related elements.
- Scripts, event handlers, unsafe embeds, and unsafe URL schemes are excluded.
- Unsupported or unsafe HTML is removed from rendered Preview but preserved in the Markdown source; when shown as content, it is escaped so it cannot execute or alter the layout.
- Unsafe link and image destinations become inert while useful visible text or image alt text remains.
- External images support HTTP and HTTPS URLs and use lazy loading where appropriate.
- Failed images remain visible with a browser-like broken-image state and alt text.

## Export contract

- PDF export uses browser print styles and the system print-to-PDF flow in v1.
- Markdown must transfer seamlessly to PDF as real flowing document content, not as stitched screenshots.
- Pagination should avoid cutting text, code blocks, figures, and other blocks in visually broken ways where practical.
- PDF typography, spacing, links, images, tables, code blocks, and page layout must be intentionally styled for reading and printing.
- PDF output contains the rendered document only, not application chrome.
- A dedicated print stylesheet defines export layout rather than copying the screen layout.

## Recovery and document size

- If local storage is unavailable or full, continue editing in memory and show a persistent recovery warning.
- This failure state is secondary to the primary copy, inspect, and PDF-download flow.
- V1 targets large technical documents up to approximately 5 MB.

## Welcome and help

- A product-specific editable welcome document is the first-load default when no recovered draft exists. It uses local project illustrations and is not a permanent recovery template.
- Help is minimal and modal; it does not navigate to another page.
- Help v1 contains a Markdown syntax reference and keyboard shortcuts.
- The syntax reference is the main help content and should not become a long documentation wall.

## Motion

- Motion is subtle and limited to pane, panel, and mode transitions.
- Motion respects reduced-motion preferences and never delays writing or cursor movement.

## Future features

- `future-feature-list.md` contains the exclusions from the initial scope, deferred Markdown dialects, and later product ideas.
- It is a parking lot, not a prioritized roadmap and does not include estimates.

## Agent and documentation rules

- `AGENTS.md` explicitly prohibits server infrastructure without a product requirement.
- Markdown dialect support must not expand without documentation and tests.
- Source Markdown must not be rewritten unnecessarily.
- The product must not gain user-selectable themes or visual customization without an explicit product decision.
- New dependencies require checking bundle and runtime cost.
- Design identity changes require updating `DESIGN.md`.
- Local recovery must not be treated as a replacement for explicit file save/download.
- UI changes must account for small-screen behavior.
- Product features outside the documented scope require an explicit decision.
- All documentation and help content must follow Simplified Technical English guidelines.
- Code should follow YAGNI and KISS principles.

## Repository and agent workflow

- Use pnpm for package management and project scripts.
- Use standard TypeScript naming: kebab-case filenames, PascalCase types and components, camelCase functions and variables, and UPPER_SNAKE_CASE only for true constants.
- Keep the initial repository structure small: root project documents, `public/`, `src/`, and `tests/`.
- Use Vitest for focused unit tests and Playwright for browser smoke tests.
- Keep the initial scripts minimal: `pnpm dev`, `pnpm check`, `pnpm test`, `pnpm build`, and `pnpm preview`.
- Use `AGENTS.md` as the task router, `DECISIONS.md` as the product contract, `DESIGN.md` as the design identity, and `README.md` as the setup and command guide.
- Use the Google `DESIGN.md` shape: YAML front matter for tokens and Markdown sections for rationale and rules.
- Keep CSS tokens in `src/styles/tokens.css` and use semantic tokens from components.
- Use `development` as the integration branch, with `feat/*` and `fix/*` branches for implementation work.
- Do not initialize Git, create branches, commit, push, or publish without explicit user authorization.
- Visual review remains a product-owner decision and is not an agent workflow gate.

## Round 6 clarifications

- The required GFM baseline is headings, paragraphs, emphasis, links, images, lists, blockquotes, fenced code blocks, tables, task lists, and strikethrough.
- Footnotes are not a v1 requirement unless the selected parser provides them without special product complexity.
- Raw HTML rendering uses a documented allowlist of safe elements and attributes. The allowlist may include common structural elements, `figure`, `figcaption`, images, links, tables, and code-related elements.
- Scripts, event handlers, unsafe embeds, and unsafe URL schemes are excluded from rendered output.
- Unsupported or unsafe HTML is removed from Preview but preserved in the Markdown source. If it is shown as content, it must be escaped.
- Unsafe link and image destinations become inert while useful visible text or image alt text remains.
- External image support includes HTTP and HTTPS URLs and uses lazy loading where appropriate.
- Failed images remain visible with a browser-like broken-image state and alt text.
- PDF export must produce real flowing document content rather than stitched screenshots. Pagination should avoid broken cuts through text, code blocks, figures, and other blocks where practical.
- PDF typography, spacing, links, images, tables, code blocks, and page layout must be intentionally styled for reading and printing.
- PDF output contains the rendered document only and excludes application chrome.
- Browser print styles and the system print-to-PDF flow are the preferred v1 implementation path, subject to verification that they meet the flowing-document quality requirement.
- If local storage is unavailable or full, editing continues in memory and the user sees a persistent recovery warning. This is secondary to the primary copy, inspect, and PDF-download flow.
- The v1 document-size target is approximately 5 MB.
- The product-specific first-load document is separate from the help modal. It is not a permanent recovery template.
- Help is a minimal modal and does not navigate away from the editor.
- Help v1 contains only a Markdown syntax reference and keyboard shortcuts. It must not become a long documentation page.
- Motion is subtle, limited to pane, panel, and mode transitions, and disabled or reduced according to the user's reduced-motion preference. It must never delay writing or cursor movement.
- `future-feature-list.md` is a parking lot for initial exclusions, deferred Markdown dialects, and later product ideas. It has no estimates and is not a prioritized roadmap.
- `AGENTS.md` prohibits server infrastructure without a product requirement, undocumented Markdown dialect expansion, unnecessary source rewriting, unapproved themes or visual customization, unchecked dependency growth, stale design identity, treating recovery as explicit file saving, ignoring small-screen behavior, and features outside the documented scope.
- Documentation and help use Simplified Technical English. Code follows YAGNI and KISS.

## Resolved discovery questions

Q54–Q68 are resolved by the sections above. Remaining implementation details may be decided during design and coding only when they do not conflict with this contract.

## Decision notes from Q54–Q68

- The GFM baseline does not require footnotes in v1 unless the parser provides them without special product complexity.
- The raw HTML allowlist is documented and includes only safe elements and attributes. It may include common structural elements, `figure`, `figcaption`, images, links, tables, and code-related elements.
- The browser print-to-PDF path is acceptable only if real flowing content and intentional pagination are verified. Screenshot stitching is not acceptable.
- Local-storage failure must not block the primary copy, inspect, and PDF-download flow.
- The product-specific welcome document is the first-load default when no recovered draft exists. The help experience is a minimal in-editor modal focused on Markdown syntax and keyboard shortcuts.
- Future features are recorded as an unestimated parking lot.
- The user owns final accessibility, performance, and browser verification.
