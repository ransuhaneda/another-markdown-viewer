---
version: alpha
name: Markdown Preview
description: Calm dark writing surface for inspecting and exporting Markdown.
colors:
  primary: "#8CB4FF"
  canvas: "#111417"
  surface: "#181C20"
  raised: "#20262C"
  ink: "#F1F4F5"
  ink-soft: "#C1C9CE"
  ink-muted: "#8B969E"
  rule: "#364149"
  accent: "#8CB4FF"
  accent-soft: "#24354F"
  on-accent: "#0B1016"
  status-positive: "#A7E3C1"
  status-warning: "#F2C879"
  status-negative: "#F09B9B"
typography:
  body:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  heading:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "2.25rem"
    fontWeight: 650
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  ui:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.4
  mono:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.6
spacing:
  0: 0
  1: "0.25rem"
  2: "0.5rem"
  3: "0.75rem"
  4: "1rem"
  5: "1.5rem"
  6: "2rem"
  7: "3rem"
  8: "4rem"
rounded:
  sm: "0.375rem"
  md: "0.625rem"
  lg: "0.875rem"
  round: "999px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.sm}"
    padding: "0.625rem 0.875rem"
  button-secondary:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "0.625rem 0.875rem"
  editor-surface:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
  code-surface:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
  application-canvas:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
  supporting-copy:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-soft}"
  metadata-copy:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-muted}"
  focus-surface:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.ink}"
  rule-boundary:
    backgroundColor: "{colors.rule}"
  positive-status:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.status-positive}"
  warning-status:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.status-warning}"
  negative-status:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.status-negative}"
---

## Overview

Markdown Preview is a focused browser tool.

The main flow is simple:

1. Paste Markdown.
2. Make small edits.
3. Inspect the rendered result.
4. Download a polished PDF.

The visual identity is a dark writing surface with restrained controls.
The interface should feel calm and clear.
The document should remain the most important object on screen.

Use one controlled accent for focus, links, active controls, and important actions.
Use rules and surface contrast to create structure.
Do not use decorative gradients, noisy effects, or a visual theme system.

## Colors

- **Canvas (`#111417`):** Main application background.
- **Surface (`#181C20`):** Editor and preview surfaces.
- **Raised (`#20262C`):** Toolbars, code blocks, modal surfaces, and selected controls.
- **Ink (`#F1F4F5`):** Primary text.
- **Ink soft (`#C1C9CE`):** Supporting text and secondary prose.
- **Ink muted (`#8B969E`):** Metadata and recovery status. Do not use it as the only status cue.
- **Rule (`#364149`):** Dividers, pane boundaries, and quiet borders.
- **Accent (`#8CB4FF`):** Links, focus, active mode, and primary actions.
- **Accent soft (`#24354F`):** Selected and focused surfaces.
- **Warning (`#F2C879`):** Recovery warning or degraded local storage. Pair it with text.
- **Negative (`#F09B9B`):** Errors. Pair it with text.

Check foreground and background pairs before release.
Normal text needs a contrast ratio of at least 4.5:1.
Large text and non-text boundaries need a contrast ratio of at least 3:1.
Do not use color as the only status signal.

## Typography

Use the system body font for interface text and rendered Markdown.
Use the monospace stack for source Markdown, inline code, code blocks, metadata, and technical values.
Keep body text at 16px or larger.
Use a readable line length for rendered Markdown.
Use strong weight and spacing for headings.
Do not use uppercase authored document text.
Do not add a remote font dependency.

The rendered document should resemble a calm technical reading surface.
The supplied image showcase may guide spacing, responsive images, figures, captions, code blocks, and dark presentation.
It must not force arbitrary page CSS or a copied composition into the product.

## Layout

Use a simple application frame:

1. Compact utility header.
2. Main editor or preview region.
3. Optional split boundary.
4. Small status area when needed.

Desktop split view uses two readable panes.
The split handle must remain easy to discover and operate.
Preview content uses a readable maximum width inside its pane.
Source content uses the available editor width without unnecessary decoration.

On small screens, show one pane at a time.
Use an explicit editor/preview toggle.
Do not squeeze two full editing surfaces into an unusable narrow column.

Use a spacing scale based on the values in the front matter.
Prefer spacing, rules, and surface contrast over shadows.
Use light radius values.
Do not use pill-shaped controls except for compact status indicators when required.

## Components

### Application header

Keep the header compact.
Place the product name and primary actions in a stable order.
Do not let utility controls compete with the document.
Use 16px icons inside 40px controls for familiar document actions.
Give every icon-only control an accessible name and a tooltip.
Use only standard icon sizes: 16px, 24px, or 32px.

### Mode and layout controls

Expose Live and Source as editor modes.
Expose editor-only, rendered-view-only, and split behavior as pane layouts.
Keep Rendered View visible in split layout for both editor modes.
Use text labels where an icon could be unclear.
Show the active state with accent color, a visible boundary, and an accessible state.
Use consistent spacing tokens between control groups.

### Editor surface

Use CodeMirror for source and editor behavior.
Keep the editing surface visually quiet.
Reveal Markdown syntax for the active Live Preview block.
Do not add decorative editor chrome.
Keep the editor and rendered document on independent scroll surfaces.
Use narrow accent scrollbars with transparent tracks.
Do not let long documents scroll the application frame.

### Rendered Markdown

Use readable prose spacing.
Keep headings distinct from body text.
Keep links visibly interactive.
Keep code blocks scrollable without breaking the page.
Keep images responsive.
Use captions and figure spacing when the document provides them.
Use lazy loading for external images where appropriate.

### Modal help

Use a compact modal inside the current page.
Provide a Markdown syntax reference first.
Provide keyboard shortcuts second.
Keep the content scannable.
Do not create a separate help page for v1.

### Status messages

Pair every status color with text or a non-color cue.
Keep recovery status brief.
Make local-storage warnings persistent but unobtrusive.
Do not interrupt the main copy, inspect, and PDF-download flow.

## Interaction and motion

Use short transitions for pane, panel, and mode changes.
Do not animate document text, cursor movement, or live-preview mapping.
Respect `prefers-reduced-motion`.
Remove non-essential transitions when reduced motion is enabled.
Keep focus visible on every interactive control.
Use native browser behavior when it is clear and reliable.

### Focus mode

Hide the application header, workspace toolbar, pane headers, and footer in Focus mode.
Keep the active document panes and split resize handle visible.
Keep a compact floating `Exit Focus mode` control visible and keyboard-accessible.
Return focus to the header Focus mode control when Focus mode ends.
On small screens, preserve the existing single-pane behavior and keep the exit control reachable.
Do not add motion for Focus mode. Respect reduced-motion preferences if a transition is added later.

## Accessibility

Use semantic landmarks and labels.
Use keyboard-accessible controls.
Keep focus order aligned with visual order.
Use visible focus indicators with sufficient contrast.
Do not rely on color alone.
Keep text readable at browser zoom.
Keep modal focus contained while it is open.
Return focus to the help trigger when the modal closes.

## Do's and Don'ts

### Do

- Keep the document central.
- Use semantic tokens.
- Preserve Markdown source.
- Use calm spacing and clear hierarchy.
- Make errors and recovery state understandable.
- Verify narrow layouts.
- Keep rendered PDF styling intentional.

### Don't

- Do not add a theme picker.
- Do not add decorative animation.
- Do not use arbitrary colors in components.
- Do not hide important recovery or error state.
- Do not make the editor look like a dashboard.
- Do not use screenshots as PDF content.
- Do not copy the supplied reference page or another product's distinctive design.
- Do not add UI only because a design pattern is fashionable.
