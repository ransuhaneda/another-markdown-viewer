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

- Build a client-side browser web app for Another Markdown Viewer.
- Use Cloudflare Pages as the initial deployment target.
- Do not add server infrastructure or a Cloudflare Worker without a product requirement.
- Treat raw Markdown as the canonical document state.
- Protect the low-friction flow: paste Markdown, make small edits, inspect the Rendered View, and download a polished PDF.
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
Dev server is open on http://127.0.0.1:5173/

## Git workflow

- Use `development` as the integration branch.
- Use `feat/*` for new features.
- Use `fix/*` for bug fixes.
- Do not initialize Git, create branches, commit, push, or publish unless the user authorizes that action.

## Scope control

Before adding a feature, identify the product decision that authorizes it.
If no decision authorizes it, record it in `future-feature-list.md` and stop at the boundary.
Do not replace a missing decision with a plausible default when the choice changes product scope.

<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and `vp build`. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

Docs are local at `node_modules/vite-plus/docs` or online at https://viteplus.dev/guide/.

## Built-in Commands vs Scripts

`vp <name>` runs a built-in command. `vp run <name>` runs a `package.json` script or a `vite.config.ts` task. Scripts cannot overwrite built-ins, so `vp dev` and `vp run dev` may do different things. Check `package.json` and `vite.config.ts` first, and run `vp run <name>` when the project defines a script or task with that name.

## Running Scripts

Run TypeScript and JavaScript files with `vpx <file>`, for example `vpx ./scripts/seed.ts --dry-run`. It handles enums, decorators, JSX, and tsconfig `paths`, so do not add `tsx` or `ts-node` to run scripts. `vpx --watch <file>` reruns the file when a file it uses changes, in place of `tsx watch`. `vp node <file>` runs plain Node.js.

## Tool Versions

Run `vp toolchain` to show versions and relationships in the active Vite+
release. Add a tool name to select part of the graph. For example, run
`vp toolchain vite`. Use `--global` to ignore the local `vite-plus` package. Use
`vp why <package>` to show the package-manager dependency graph.

## Review Checklist

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to format, lint, type check and test changes.
- [ ] Check if there are `vite.config.ts` tasks or `package.json` scripts necessary for validation, run via `vp run <script>`.
- [ ] If setup, runtime, or package-manager behavior looks wrong, run `vp env doctor` and include its output when asking for help.

<!--VITE PLUS END-->
