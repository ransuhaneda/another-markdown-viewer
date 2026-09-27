# Another Markdown Viewer — Product Decisions

This file records the accepted product contract. Implementation must follow it.

## Product

- Product name: **Another Markdown Viewer**.
- Primary goal: a polished writing tool with a low-friction Markdown workflow.
- Target platform: browser web app.
- Initial deployment target: Cloudflare Pages.
- Do not add server infrastructure without a product requirement.
- The first release is a practical Markdown writing surface, not a document-management system.

## Editing model

- The canonical document state is the raw Markdown string.
- Source editing operates on the canonical Markdown document.
- Preserve source structure and whitespace as much as possible.
- Do not normalize or rewrite Markdown automatically.
- The editor shows raw Markdown.
- The rendered document is a separate pane and updates as the source changes.
- The editor has no alternate Live Preview mode.
- Pane layouts are editor-only, rendered-view-only, and split view.
- Split view shows raw Markdown beside the rendered document.
- On small screens, show one pane at a time with a clear editor/preview toggle.
- Keep the application frame fixed for long documents. Let the editor and Rendered View scroll independently.
- Use the available pane width for rendered Markdown.
- Support standard text editing, Markdown formatting, explicit Markdown save, and Focus mode shortcuts. Bold uses `Ctrl/Cmd+B`, italic uses `Ctrl/Cmd+I`, strikethrough uses `Alt+Shift+S`, links use `Ctrl/Cmd+K`, and code blocks use `Ctrl+Shift+K` or `Cmd+Option+C` on macOS. Do not add a command palette in v1.

## Markdown support

- V1 targets GitHub Flavored Markdown.
- Markdown files may start with YAML frontmatter enclosed by `---` delimiters. A closing `...` delimiter is also accepted.
- Valid YAML frontmatter is parsed and shown as a key/value table above the rendered Markdown. Array values are shown as separate values.
- Frontmatter remains part of the canonical Markdown source and is not rewritten.
- Invalid or unterminated frontmatter remains visible as Markdown content.
- CommonMark and Markdown Extra are future extensions, not v1 requirements.
- The Rendered View updates as source Markdown changes.
- Tables are supported in the Rendered View.
- Incomplete Markdown remains ordinary text while the user types and must not block editing or preview rendering.
- Rich-text paste should preserve Markdown when present and convert common formatting to Markdown when needed.
- Pasted HTML should convert common safe elements to Markdown and preserve unsupported HTML in the source.
- Raw HTML blocks are supported subject to sanitization.
- The `<kbd>` HTML element is supported in Markdown and uses a dark keycap style in Preview.
- Print output uses a light keycap style.

## Rendering and security

- Support interactive links and images in Rendered View.
- Open external links in a new tab with appropriate relationship protections.
- Load external HTTP and HTTPS images normally. Use lazy loading where appropriate.
- Sanitize unsafe URL schemes. Preserve useful visible text or image alt text when a destination is unsafe. Make the unsafe destination inert.
- Sanitize raw HTML with a maintained DOM sanitizer.
- Do not allow scripts, event handlers, unsafe embeds, or unsafe URL schemes.
- Remove unsupported or unsafe HTML from Rendered View. Preserve it in the Markdown source and escape it when shown as content.
- Show failed images with a broken-image state and alt text.
- Use the supplied image showcase as a rendering reference for headings, separators, code blocks, responsive images, galleries, side-by-side layouts, figures/captions, lazy loading, and dark document presentation. Do not support arbitrary pasted page CSS or classes.

## File handling and recovery

- Allow users to paste Markdown without uploading a file.
- Use `browser-fs-access` for file operations.
- Use browser file APIs where available. Provide import/download fallback behavior.
- Explicit Save means saving or downloading a Markdown file, not writing recovery data.
- Keep local browser recovery automatic and central to the product.
- Store one latest document and restore it immediately on startup.
- Autosave recovery 500 ms after changes.
- Persist Markdown, useful editor settings, last mode/layout, cursor position, and scroll position.
- Clear Draft deletes the recovery document and opens a blank editor.
- Do not present local recovery as explicit file saving.
- If local storage is unavailable or full, continue editing in memory and show a persistent recovery warning. Keep this secondary to the main copy, inspect, and PDF-download flow.
- Target technical documents up to approximately 5 MB in v1.

## Export

- Produce a print-quality rendered document for PDF export.
- Transfer Markdown to PDF as real flowing document content, not stitched screenshots.
- Avoid broken page cuts through text, code blocks, figures, and other blocks where practical.
- Intentionally style PDF typography, spacing, links, images, tables, code blocks, and page layout for reading and printing.
- Use browser print styles and the system print-to-PDF flow in v1.
- Include only the rendered document in PDF output, not application chrome.
- Define export layout in a dedicated print stylesheet.

## Interface and design

- Use one intentional visual identity. Do not add selectable themes or broad customization.
- Keep the document canvas dark, calm, and developer-tool oriented.
- Keep surrounding controls restrained and functional.
- Prioritize calm focus, developer-tool clarity, minimal chrome, excellent typography, Obsidian-like editing behavior, accessibility, responsive behavior, and image-rich Markdown rendering.
- Keep pane scrollbars narrow and use the accent color.
- Keep motion subtle and limited to pane, panel, and mode transitions. Respect reduced-motion preferences. Do not delay writing or cursor movement.
- Include product name, new/clear document, open file, save/download, PDF export, mode/layout toggle, split-pane resize handle, word/character count, recovery status, keyboard-shortcut help, and Markdown syntax help.
- Keep Help limited to a Markdown syntax reference and keyboard shortcuts.
- Focus mode hides application chrome and pane headers but keeps the current editor mode and pane layout.
- Keep document panes and the split resize handle available in Focus mode. Provide a floating exit control and `Escape` shortcut.
- Make Focus mode session-only. Do not store it in document recovery.
- Move focus to the visible document pane when entering Focus mode. Restore focus to the header control when exiting.
- Follow the one-pane small-screen model in Focus mode. Do not change print output.

## Technology

- Use Vite and TypeScript.
- Use CodeMirror 6.
- Use a GitHub-Flavored Markdown parser.
- Sanitize rendered HTML with a maintained DOM sanitizer.
- Use `browser-fs-access`.
- Keep the application client-side. Do not require a backend runtime in v1.

## Acceptance and ownership

- Acceptance is production-ready through the first six phases: document/recovery, source editing, rendered preview, GFM rendering/sanitization, file handling/PDF export, and responsive behavior.
- The user owns the final phase: accessibility, performance, and browser verification.

## Product flow

- The production flow is: paste Markdown into Source, make small edits, inspect Preview, and download a polished PDF.
- Do not require users to complete an entire long-form writing workflow in the app.
- Use local recovery to protect copied and lightly edited content. Keep it secondary to the inspect-and-download flow.

## Markdown support contract

- Require GFM headings, paragraphs, emphasis, links, images, lists, blockquotes, fenced code blocks, tables, task lists, and strikethrough in v1.
- Do not require footnotes unless the selected parser provides them without special product complexity.
- Use a documented allowlist of safe raw HTML elements and attributes. The allowlist may include common structural elements, `figure`, `figcaption`, images, links, tables, and code-related elements.
- Exclude scripts, event handlers, unsafe embeds, and unsafe URL schemes.
- Remove unsupported or unsafe HTML from Rendered View but preserve it in Markdown source. Escape it when shown as content.
- Make unsafe link and image destinations inert while preserving useful visible text or image alt text.
- Support external HTTP and HTTPS images and lazy-load them where appropriate.
- Show failed images with a browser-like broken-image state and alt text.

## Export contract

- Use browser print styles and the system print-to-PDF flow in v1.
- Transfer Markdown to PDF as real flowing document content, not stitched screenshots.
- Avoid broken cuts through text, code blocks, figures, and other blocks where practical.
- Intentionally style PDF typography, spacing, links, images, tables, code blocks, and page layout for reading and printing.
- Include only the rendered document in PDF output. Exclude application chrome.
- Define export layout in a dedicated print stylesheet.

## Recovery and document size

- If local storage is unavailable or full, continue editing in memory and show a persistent recovery warning.
- Keep this failure state secondary to the copy, inspect, and PDF-download flow.
- Target technical documents up to approximately 5 MB in v1.

## Welcome and help

- An optional short editable welcome example may be available. Do not make it a permanent recovery template.
- Keep Help as a minimal modal. Do not navigate away from the editor.
- Limit Help to a Markdown syntax reference and keyboard shortcuts.
- Keep the syntax reference as the main help content. Do not turn Help into a long tutorial.

## Motion

- Keep motion subtle and limited to pane, panel, and mode transitions.
- Respect the user's reduced-motion preference.
- Do not delay writing or cursor movement.

## Future features

- Use `future-feature-list.md` as the unestimated parking lot for initial exclusions, deferred Markdown dialects, and later product ideas.
- Do not treat it as a prioritized roadmap.

## Agent and documentation rules

- `AGENTS.md` explicitly prohibits server infrastructure without a product requirement.
- Do not expand Markdown dialect support without documentation and tests.
- Do not rewrite source Markdown unnecessarily.
- Do not add selectable themes or broad visual customization without an explicit product decision.
- Check bundle and runtime cost before adding dependencies.
- Update `DESIGN.md` when the visual identity changes.
- Do not treat local recovery as explicit file saving.
- Account for small-screen behavior when changing the UI.
- Require an explicit product decision for features outside this contract.
- Use Simplified Technical English in documentation and help.
- Follow YAGNI and KISS.

## Repository and agent workflow

- Use pnpm for package management and project scripts.
- Use kebab-case filenames, PascalCase types and components, camelCase functions and variables, and UPPER_SNAKE_CASE only for true constants.
- Keep the initial repository structure small: root project documents, `public/`, `src/`, and `tests/`.
- Use Vitest for focused unit tests and Playwright for browser smoke tests.
- Keep scripts minimal: `pnpm dev`, `pnpm check`, `pnpm test`, `pnpm build`, and `pnpm preview`.
- Use `AGENTS.md` as task router, `DECISIONS.md` as product contract, `DESIGN.md` as design identity, and `README.md` as setup and command guide.
- Use the Google `DESIGN.md` shape: YAML front matter for tokens and Markdown sections for rationale and rules.
- Keep CSS tokens in `src/styles/tokens.css` and use semantic tokens in components.
- Use `development` as the integration branch. Use `feat/*` and `fix/*` branches for implementation work.
- Do not initialize Git, create branches, commit, push, or publish without explicit user authorization.
- Keep visual review as a product-owner decision, not an agent workflow gate.

## Resolved discovery questions

- V1 does not require footnotes unless the parser provides them without special product complexity.
- Raw HTML rendering uses a documented allowlist of safe elements and attributes. The allowlist may include common structural elements, `figure`, `figcaption`, images, links, tables, and code-related elements.
- The browser print-to-PDF path is acceptable only if flowing content and intentional pagination are verified. Screenshot stitching is not acceptable.
- Local-storage failure must not block the copy, inspect, and PDF-download flow.
- The welcome sample is optional. Help is a minimal in-editor modal focused on Markdown syntax and keyboard shortcuts.
- Future features belong in an unestimated parking lot.
- The user owns final accessibility, performance, and browser verification.
