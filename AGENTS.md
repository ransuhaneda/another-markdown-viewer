# Project instructions

Use this file as the project router.
Read the smallest relevant source before you change code.
Keep product decisions in `DECISIONS.md`.
Keep visual and interaction identity in `DESIGN.md`.
Keep deferred ideas in `future-feature-list.md`.

## Authority

Use this precedence when documents conflict:

1. `AGENTS.md` — project routing and stable guardrails.
2. `DECISIONS.md` — product contract and accepted scope.
3. `DESIGN.md` — visual identity and interaction principles.
4. `README.md` — setup and exercised commands.
5. Source code and tests — implementation that must agree with the documents above.

Stop and reconcile a conflict before you continue.
Do not invent a decision when a document is unclear.

## Read by task

- Product scope or feature behavior: read `DECISIONS.md`.
- Visual or interaction work: read `DESIGN.md` and the relevant section of `DECISIONS.md`.
- Dependency or architecture work: read `DECISIONS.md`, then inspect `package.json` and the affected source.
- Markdown parsing, rendering, sanitization, or paste conversion: read the Markdown sections in `DECISIONS.md` and the relevant tests.
- Recovery or browser storage work: read the file handling and recovery sections in `DECISIONS.md` and the persistence tests.
- PDF work: read the export sections in `DECISIONS.md` and the print stylesheet.
- Deferred ideas: read `future-feature-list.md`. Do not implement an item without an explicit product decision.
- Setup and verification: read `README.md` when it exists. Use the commands defined there.

## Product boundaries

- Build a client-side browser web app for the Markdown Preview product.
- Use Cloudflare Pages as the initial deployment target.
- Do not add server infrastructure or a Cloudflare Worker without a product requirement.
- Treat raw Markdown as the canonical document state.
- Protect the low-friction flow: paste Markdown, make small edits, inspect Live Preview, and download a polished PDF.
- Preserve source Markdown and whitespace as much as possible.
- Do not rewrite or normalize source Markdown without a deliberate user action.
- Keep local recovery automatic, but do not present it as explicit file saving.
- Keep help inside a small modal. Help covers the Markdown syntax reference and keyboard shortcuts.
- Do not add user-selectable themes or broad visual customization.
- Do not expand the Markdown dialect without updating `DECISIONS.md` and adding focused tests.

## Architecture boundaries

- Use Vite and TypeScript.
- Use CodeMirror 6 for source and editor behavior.
- Use a GFM parser for Markdown rendering.
- Sanitize rendered HTML with a maintained DOM sanitization library.
- Use `browser-fs-access` for file operations.
- Keep browser-only behavior at the application boundary.
- Keep Markdown parsing, sanitization, URL policy, paste conversion, recovery serialization, and document state in focused modules.
- Keep rendering and persistence independent from UI components.
- Keep the raw Markdown string as the single document source of truth.
- Use CSS custom properties from `src/styles/tokens.css` for visual tokens.
- Use semantic design tokens in components. Do not place arbitrary color or spacing values in component styles.
- Prefer native browser APIs and small focused modules.
- Avoid abstractions that do not support a current product requirement.

## Code rules

- Follow YAGNI and KISS.
- Use strict TypeScript.
- Use one term for one concept.
- Keep functions small and focused.
- Preserve unrelated work.
- Add a dependency only when it removes real complexity or provides required behavior.
- Check bundle and runtime cost before adding a dependency.
- Do not add a Worker, backend, account system, analytics, or tracking without a product decision.
- Do not copy external code, assets, text, or distinctive visual compositions.
- Keep user-authored Markdown separate from application UI state.
- Keep unsafe HTML and URL handling explicit and testable.

## Documentation rules

- Use Simplified Technical English.
- Use short active sentences.
- Use one instruction in each sentence.
- Preserve commands, paths, identifiers, and quoted values exactly.
- Update `DECISIONS.md` when an accepted product decision changes.
- Update `DESIGN.md` when the accepted visual identity or interaction principles change.
- Add deferred ideas to `future-feature-list.md` instead of silently expanding scope.
- Do not turn help or project documentation into a long tutorial.

## Verification

Use these scripts when they exist in `package.json`:

```text
pnpm dev
pnpm check
pnpm test
pnpm build
pnpm preview
```

Use focused tests after each related change.
Run the full check, test, and build commands before a delivery handoff.
Verify changed behavior in a real browser when the change affects editing, persistence, rendering, file access, print export, or responsive layout.
Do not claim a check passed without real command output.

## Git workflow

- Use `development` as the integration branch.
- Use `feat/*` for new features.
- Use `fix/*` for bug fixes.
- Do not initialize Git, create branches, commit, push, or publish unless the user authorizes that action.

## Scope control

Before adding a feature, identify the product decision that authorizes it.
If no decision authorizes it, record it in `future-feature-list.md` and stop at the boundary.
Do not replace a missing decision with a plausible default when the choice changes product scope.
