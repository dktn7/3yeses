---
name: 3yeses-dashboard-quality-loop
description: Audit and improve the 3YESES authenticated dashboard and talent-profile experience as one product, preserving behavior while raising visual quality, interaction completeness, and cross-page consistency.
---

# 3YESES dashboard quality loop

Use this for dashboard, talent-profile, settings, media, likes, comments, sharing, and related authenticated-surface work. It complements the generic redesign and frontend-design skills with the product-specific comparison loop that has recurred in this project.

## Inputs and boundaries

- Identify the requested surface and its neighboring flows before editing. Treat the public site, talent profile, dashboard overview, profile editing, settings, and media viewer as one experience when the change crosses those boundaries.
- Preserve existing authentication, data contracts, permissions, and routing. Do not invent messaging or social behavior when the request is about support, announcements, or profile media.
- Use the existing stack and assets. Check `package.json` before introducing dependencies.
- Before locating symbols or behavior in the repository, use Graphify when available; fall back to text search only for literals, comments, or already-located files.

## Workflow

1. Establish the current state. Inspect the relevant routes/components, shared layout and tokens, loading/empty/error states, and the corresponding public-site surface.
2. Build a short audit covering hierarchy, spacing, typography, palette, responsive behavior, interaction states, accessibility, and product parity. Rate the current result plainly; call out generic or unfinished areas.
3. Trace each requested interaction end to end: edit/save/cancel, media add/remove/view, like/comment/share, settings, billing, support, or announcement behavior as applicable. Note permission and failure states.
4. Make the smallest coherent set of changes. Prefer shared components/tokens over page-local overrides. Keep the visual language recognizably 3YESES and avoid redesigning unrelated routes.
5. Validate at desktop and mobile widths, including loading, empty, error, hover/focus/active, and authenticated states. Use the project’s Playwright/unit checks when behavior changed.
6. Finish with a concise before/after assessment, files changed, remaining inconsistencies, and the exact verification performed.

## Definition of done

- The requested surface is visually comparable to its neighboring 3YESES surfaces.
- Primary actions have clear affordance and complete success, loading, empty, error, and permission states.
- Responsive and keyboard behavior are checked, and no unrelated flow is regressed.
- Any unresolved issue is named rather than hidden behind a positive rating.
