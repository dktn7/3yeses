# GitHub Copilot Instructions for 3yeses

You are assisting on **3yeses**, a subscription-based talent marketplace built with Next.js 16, TypeScript, Prisma, Stripe, and Tailwind CSS.  
Your goal is to generate secure, idiomatic, production-ready code that matches the conventions in this file.

---

## 0. High‑level project overview

- Product: **3yeses** – a subscription-only platform where talents (actors, musicians, models, voice artists, dancers, etc.) showcase portfolios and get discovered.[file:1]
- Architecture:
  - Next.js 16 **App Router**, React 18, TypeScript (strict).[file:1]
  - PostgreSQL + Prisma ORM (≈20 models covering User, TalentProfile, PortfolioItem, Subscription, Payment, analytics, etc.).[file:1]
  - JWT authentication with bcrypt password hashing.[file:1]
  - Stripe for **subscription billing** (not per-booking).[file:1]
  - Tailwind CSS for styling; next-intl for i18n (11 locales).[file:1]

When generating code, assume this context is always true unless the user explicitly changes it.

---

## 1. Business model and pricing

### 1.1 Subscription model

- Monetization is **subscription-only** (no per-booking payments).[file:1]
- There is **one paid tier**: `STANDARD`.
- **Subscription is mandatory** — users subscribe during the sign-up flow. Without an active subscription the platform cannot be used.
- There is no free tier or limited-access state. An account without a subscription has no access.

### 1.2 Pricing

- **STANDARD**:
  - **6 months**: £10, billed via Stripe recurring subscription.[file:2]
  - **12 months (annual)**: £20, billed via Stripe recurring subscription.
- Two Stripe price IDs: `STRIPE_PRICE_STANDARD_6M` and `STRIPE_PRICE_STANDARD_12M`.
- Do **not** create additional pricing tiers (FREE/BASIC/PRO/ENTERPRISE) unless the user explicitly asks to change the model.

### 1.3 Feature gating

Treat these as the default rules unless specified otherwise:

- **Without active subscription**: no platform access. Users are redirected to the pricing / sign-up flow.
- **With active STANDARD subscription**:
  - Unlimited portfolio uploads (images, videos, audio).[file:1]
  - Full profile customization.
  - Priority search ranking.
  - Full dashboard analytics available.

---

## 2. Data model and persistence

### 2.1 Prisma & PostgreSQL

- Use Prisma ORM with PostgreSQL.[file:1]
- Always use generated Prisma client; avoid raw SQL unless unavoidable.
- Infer types from Prisma rather than redefining them.

Example:

```ts
type UserWithSubscription = Prisma.UserGetPayload<{
  include: { subscription: true };
}>;
```

### 2.2 Subscription model (conceptual)

Even if field names differ slightly, follow these concepts:

**Subscription**:

- `id`: string
- `userId`: string
- `plan`: SubscriptionPlan (enum, only STANDARD)
- `status`: SubscriptionStatus (ACTIVE | CANCELED | PAST_DUE | UNPAID | TRIALING).[file:1]
- `stripeSubscriptionId`?: string
- `stripeCustomerId`?: string
- `stripePriceId`?: string
- `currentPeriodStart`?: Date
- `currentPeriodEnd`?: Date
- `startDate`: Date
- `endDate`?: Date
- `cancelAt`?: Date
- `canceledAt`?: Date

**Payment**:

- `id`: string
- `userId`: string
- `amount`: number (in minor units, e.g. pence).[file:1]
- `currency`: string (default "gbp" or "usd").[file:1]
- `status`: PaymentStatus (PENDING | SUCCEEDED | FAILED | REFUNDED).[file:1]
- `stripePaymentIntentId`?: string
- `stripeInvoiceId`?: string
- `description`?: string
- `metadata`?: Json

When generating migration snippets, keep them consistent with this shape.

---

## 3. Next.js 16 / React patterns

### 3.1 App Router usage

- Use `app/` directory with route segments.
- Default components are Server Components.
- Add `"use client"` at the top only when:
  - Using React hooks (`useState`, `useEffect`, `useSWR`, etc.).
  - Handling browser events (clicks, forms, etc.).

Example route:

```ts
// app/(dashboard)/[locale]/dashboard/page.tsx
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // render server component dashboard
}
```

### 3.2 API routes

- Place API handlers at `app/api/[name]/route.ts`.
- Export `GET`, `POST`, etc. as async functions.
- Always validate input, check authentication, and handle errors gracefully.

Example:

```ts
// app/api/subscribe/route.ts
import { NextRequest, NextResponse } from "next/server";
import { SubscribeSchema } from "@/lib/validation/subscription";
import { getCurrentUser } from "@/lib/auth";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await req.json();
  const parse = SubscribeSchema.safeParse(json);
  if (!parse.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  // create Stripe Checkout session...
}
```

---

## 4. Stripe integration

### 4.1 Keys and configuration

- Use environment variables for all Stripe secrets (e.g. `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_STANDARD_PRICE_ID`).[file:1]
- Never hardcode secret keys in code or tests.
- Price IDs may be stored in a config module, but use env vars for actual values.

Example config:

```ts
export const STRIPE_STANDARD_PRICE_ID = process.env.STRIPE_STANDARD_PRICE_ID!;
```

### 4.2 Checkout flow

Implement the following pattern unless asked otherwise:

1. Authenticated user clicks "Subscribe with Stripe".
2. Frontend calls `/api/subscribe` with no sensitive card data (Stripe handles it).
3. Server uses `stripe.checkout.sessions.create` with:
   - `mode: "subscription"`
   - `line_items` referencing `STRIPE_STANDARD_PRICE_ID`
   - `success_url` and `cancel_url`.
4. Response contains the `url` to redirect the user.

### 4.3 Webhooks

- Handle `/api/stripe/webhook` as a server-only route.
- Read raw body (do not call `req.json()` before verifying signature).
- Verify signature using `stripe.webhooks.constructEvent`.
- React to events:
  - `checkout.session.completed` – create subscription & payment records.
  - `customer.subscription.updated` / `deleted` – update `Subscription.status`.
- Always return 2xx on success; log but avoid leaking internal errors.

---

## 5. Access control and paywall

### 5.1 Helper utilities

Create and reuse helpers:

```ts
export function hasActiveSubscription(user: UserWithSubscription | null): boolean {
  return !!user?.subscription && user.subscription.status === "ACTIVE";
}
```

### 5.2 Middleware

Use Next.js middleware to protect dashboard/admin routes.

Pseudocode:

```ts
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getUserFromRequest } from "@/lib/auth/middleware";

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const isDashboard = url.pathname.startsWith("/dashboard");

  if (!isDashboard) return NextResponse.next();

  const user = await getUserFromRequest(req);
  if (!user) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (!hasActiveSubscription(user) && !url.pathname.startsWith("/pricing")) {
    url.pathname = "/pricing";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}
```

Do not duplicate paywall checks inside every page; use helpers/middleware plus backend authorization.

---

## 6. Authentication & security

### 6.1 Auth basics

- Use JWTs or a session library that stores tokens in HTTP-only cookies.[file:1]
- Require email verification before allowing sensitive actions.
- Support password reset with single-use, time-limited tokens.

### 6.2 Security rules

When generating code:

- Never log secrets or full JWTs.
- Sanitize and validate all input, especially for API routes.
- Use Zod (or similar) schemas for request bodies and query params.
- Avoid `any`, `eval`, dynamic `Function`, or unvalidated string concatenation for SQL.
- For Prisma, prefer generated methods (`findUnique`, `update`, `upsert`, `deleteMany`) and parameterized filters.

### 6.3 File uploads

- Use ImageKit for uploads.[file:1]
- Validate:
  - File type (e.g. images/videos/audio, but not executable binaries).
  - File size limits.
- Do not allow arbitrary server-side file paths from user input.

---

## 7. TypeScript standards

- Use strict TypeScript (no `any` unless absolutely necessary).
- Avoid `@ts-ignore`. If needed, prefer `@ts-expect-error` with a short comment.
- Use type inference from Prisma and Zod whenever possible.

API example with Zod:

```ts
const PortfolioItemSchema = z.object({
  title: z.string().min(1),
  url: z.string().url(),
  type: z.enum(["IMAGE", "VIDEO", "AUDIO", "DOCUMENT", "LINK"]),
  description: z.string().max(500).optional(),
});

type PortfolioItemInput = z.infer<typeof PortfolioItemSchema>;
```

For component props, prefer explicit Props interfaces.

---

## 8. UI and UX guidelines

### 8.1 Styling

- Use Tailwind CSS classes.
- Follow a clean, minimal style consistent with dark backgrounds and accent blue CTAs.
- Reuse existing components where possible (e.g., `Button`, `Card`, `Modal`).

### 8.2 Pricing UI

For the talents pricing section, show two duration options for the same Standard Access tier:

- Heading: "For Talents".
- Plan name: "Standard Access".
- Durations: "6 months — £10" and "12 months — £20 (Best Value)".
- Bullet points:
  - Full profile customization.
  - Unlimited portfolio uploads.
  - Priority search ranking.
  - Full dashboard analytics.
- Primary button: "Subscribe with Stripe".

Make the button stand out and be keyboard accessible.

### 8.3 Accessibility

- Use semantic HTML: `button`, `nav`, `main`, etc.
- Ensure focus states are visible.
- Provide `aria-labels` where the UI is not self-describing (e.g., icon-only buttons).

---

## 9. Internationalization (next-intl)

- 3yeses supports 11 locales.[file:1]
- Use `next-intl`:
  - `getTranslations` in server components.
  - `useTranslations` in client components.
- Do not hardcode user-facing text strings inside components when translations already exist; instead, reference translation keys.

Example:

```ts
const t = useTranslations("Pricing");
<h2>{t("standardAccess")}</h2>;
<p>{t("pricePerSixMonths", { price: "£10" })}</p>;
```

---

## 10. Testing & quality

- Use Playwright for end-to-end testing.[file:1]
- For new features, add tests that:
  - Verify non-subscribed users are redirected to `/pricing` when accessing premium pages.
  - Verify subscribed users with `status: ACTIVE` can access full dashboard and upload unlimited portfolio items.
  - Test Stripe webhook behaviour with mocked events where feasible.

General quality rules:

- Keep functions and components small and focused.
- Prefer composable hooks/components over large monolith files.
- Respect existing ESLint/Prettier configuration in the repo.
- Write clear error messages and avoid leaking internal stack traces to clients.

---

## 11. How to respond to prompts

When the user asks for code:

- Prefer editing existing patterns over inventing new ones.
- Use the subscription/paywall model described here by default.
- If a user asks for something that conflicts with these instructions (e.g., adding a FREE tier), follow the user's explicit instructions for that request.
- Include types, validation, and security checks by default, not as an afterthought.

This document defines the default behaviour for Copilot in the 3yeses repository.
setx PATH "%PATH%;C:\nvm4w\nodejs"