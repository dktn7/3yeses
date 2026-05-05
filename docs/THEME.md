THEME CONVENTION — Light vs Dark Class Split

Purpose
- Make it explicit which classes target light mode vs dark mode.
- Prevent accidental visual drift when editing classes (clear intent).

Core rules
- Use `bg-light-surface` for elements intended to be light-mode surfaces.
- Use `dark:bg-dark-surface` (paired) when the element should also have a neutral dark surface.
- Do NOT use raw `bg-white` (or `bg-black`) for generic surfaces.
- Preserve opacity variants (e.g. `bg-white/90` -> keep as `bg-light-surface/90` if translucency is required).
- Preserve intentional color-specific dark overrides (e.g. `dark:bg-red-950/50`) — these are palette decisions, not neutrals.

Per-mode palette
- **Light mode:** primary colour family is blue — use `primary-blue` / `text-blue-900` for prominent CTAs and headings.
- **Dark mode:** primary colour family is red — use `accent-red` / `text-red-100` for prominent CTAs and headings.

Component rules
- **Primary buttons:** `bg-primary-blue` in light, `dark:bg-accent-red` in dark; text should be white for both.
- **Secondary buttons / inputs:** neutral surfaces use `bg-light-surface` with `dark:bg-dark-surface` and borders remain tone-mapped (`border-blue-200` / `dark:border-red-800`).
- **Cards / Panels / Modals:** use `bg-light-surface dark:bg-dark-surface` for neutral containers; shadows and borders may change but colour roles remain.
- **Badges / status chips:** keep colour accents when they express status (e.g., warning, error) but use neutral surfaces for generic labels.

Examples
- Preferred (neutral surface):
  - `className="p-4 rounded bg-light-surface dark:bg-dark-surface"`
- Translucent glass (keep opacity):
  - `className="p-4 rounded bg-light-surface/90 backdrop-blur-md"`
- Color-accent dark override (keep explicit color):
  - `className="p-4 rounded bg-light-surface dark:bg-red-950/50"`

Migration guidance
1. Replace non-opacity `bg-white` occurrences with `bg-light-surface`.
2. When `bg-white` is paired with a generic dark fallback (e.g. `dark:bg-gray-800`), prefer `dark:bg-dark-surface` if the dark fallback is just a neutral surface.
3. Keep `bg-white/*` opacity forms unchanged unless you intentionally want to change translucency.
4. For dynamic/template class strings, edit manually to keep conditional logic intact.

Developer notes
- `bg-light-surface` and `bg-dark-surface` are implemented in `app/globals.css` and included in `tailwind.config.ts` utility list.
- If you need to force a colour in light or dark only, use `bg-light-<color>` or `dark:bg-<color>` explicitly.

Why this helps
- Editors and reviewers can instantly see whether a change affects light mode, dark mode, or both.
- Reduces accidental regressions where a `bg-white` change unintentionally affects dark mode.

If you want, I can:
- Continue converting the next ~20 files to this convention.
- Add an ESLint/Tailwind rule or a codemod to flag raw `bg-white` usages.
