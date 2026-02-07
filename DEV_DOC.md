# Development import rules (short)

This short guide explains the import rules for the `lib/` folder so we avoid accidentally bundling server code into client bundles.

Client vs Server separation

- Client-safe helpers: export from `@/lib` (barrel) only things safe to bundle in the browser (UI helpers, category mappings, hooks).
- Server-only modules: import directly from their files:
  - Prisma accessor: `import { getPrisma } from '@/lib/prisma';`
  - Auth service: `import AuthService from '@/lib/auth/auth-service';`
- Do not re-export server-only modules from the client barrel. This avoids accidentally bundling server code into client bundles.

Barrels

- Keep `lib/index.ts` small and client-only.
- If you need a server barrel, keep it server-only and ensure callers are server files (prefer direct imports to avoid confusion).

Build and cleanup

- Remove stale compiled artifacts before builds if you see ambiguous export errors:
  - Delete `lib/*.js`, `lib/**/*.js`, and clear `.next` then run `npx next build`.
- Typical commands (PowerShell):

```powershell
# Remove compiled .js under lib
Get-ChildItem -Path .\lib -Recurse -Include *.js | Remove-Item -Force
# Clean and build
Remove-Item -Recurse -Force .next; npx next build
```

Style

- Use `import type { X } from '...';` for types only.
- Prefer default `AuthService` import everywhere: `import AuthService from '@/lib/auth/auth-service';`

Quick canonical import rules (automated normalization checklist):

- Auth service (default):
  - import AuthService from '@/lib/auth/auth-service';
- Prisma accessor (named):
  - import { getPrisma } from '@/lib/prisma';

Also: do not commit compiled `.js` artifacts under `lib/` — they can shadow TypeScript sources and cause confusing build warnings.

If you want this as a `docs/` page or in `README.md` instead, tell me and I'll move it.
