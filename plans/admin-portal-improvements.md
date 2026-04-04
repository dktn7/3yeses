# 3Yeses Admin Portal: Technical Specification & Implementation Plan

This document outlines the functional and UI improvements for the 3Yeses Admin Portal, focusing on a "System Overview" aesthetic, enhanced search/filtering, and new system reporting capabilities.

## 1. Aesthetic Guidelines: "System Overview"
The admin portal will adopt a high-density, professional visual style.

- **Color Palette:**
  - **Background:** `bg-[#0a0a0b]` (Deep Obsidian)
  - **Accents:** `text-red-500`, `border-red-500/20`, `bg-red-500/10` (Security Red)
  - **Surface:** `bg-white/5` with `backdrop-blur-md` (Glassmorphism)
  - **Typography:** Inter for body, JetBrains Mono or similar for IDs/Data (Data-heavy look)
- **UI Elements:**
  - Borders: `border-white/10` with subtle glow effects on hover.
  - Buttons: Sharp corners or very small radius (`rounded-lg`), subtle gradients.
  - Data Tables: High density, monospaced numeric data, status indicators with pulse animations.

## 2. Consistent Modal System (`AdminModal`)
A reusable modal component to replace current fragmented implementations.

- **Component:** `components/admin/AdminModal.tsx`
- **Props:**
  - `isOpen: boolean`
  - `onClose: () => void`
  - `title: string`
  - `description?: string`
  - `type: 'info' | 'danger' | 'warning' | 'success'` (Changes accent colors)
  - `children: ReactNode`
- **Features:**
  - Integrated overlay with `backdrop-blur-sm`.
  - Accessible focus trapping.
  - Consistent "X" close button and action button placement.
  - "Danger" mode specifically for deletions (Red glow, "Confirm Delete" prompt).

## 3. Smarter User Search & Category Filtering
Enhancing the `/admin/users` view.

### UI Placement:
- **Search Bar:** Multi-input group in the header or top of the table.
  - Field 1: General (Name/Email)
  - Field 2: User ID (Direct lookup)
- **Filters:** A persistent or slide-out "Filter Panel".
  - Talent Categories: Multiselect dropdown populated from the `Category` table.
  - Role Filter: (ADMIN, TALENT, USER).
  - Status Filter: (Verified, Unverified, Pending Consent).

### Logic (API):
- **Path:** `app/api/admin/users/route.ts`
- **Enhancements:**
  - Add `categoryId` and `userId` to query parameters.
  - Implement `prisma.user.findMany` filter logic:
    ```typescript
    if (categoryId) {
      where.talentProfile = { categoryId };
    }
    if (userId) {
      where.id = userId;
    }
    ```

## 4. Reports Page (`/admin/reports`)
A new high-density page for managing user-generated reports.

- **Layout:** Three-column dashboard style.
  - **Column 1:** Summary Stats (Total Pending, Critical, Handled Today).
  - **Column 2:** Feed of latest reports with "Quick Actions" (Ignore, Ban User, Warn).
  - **Column 3:** Detail view for the selected report (Linked content, Reporter details).
- **Data Source:** `prisma.report` model.
- **Aesthetic:** High-alert style for "Pending" reports (pulsing red indicators).

## 5. Admin Notifications
Centralized system alerts for administrators.

- **UI:** A sliding side panel (Drawer) triggered by the `Bell` icon in the layout header.
- **Data Source:** New `AdminNotification` model or filtered `Notification` where `type = SYSTEM`.
- **Feed Items:**
  - "New high-risk report submitted"
  - "Server load spikes"
  - "New talent verification pending"
- **Logic:** Real-time updates via polling or (future) WebSockets.

## 6. Regional Defaults (GMT & GBP)
Enforcing regional standards across the Admin UI.

- **Timezone:** 
  - All timestamps in tables to display in `GMT/UTC` by default with a `(GMT)` suffix.
  - Hovering over a timestamp shows local time in a tooltip.
- **Currency:**
  - All financial data (subscriptions, payments) formatted as `GBP (£)` by default.
- **Implementation:**
  - Create `lib/admin/formatters.ts` with `formatAdminDate` and `formatAdminCurrency`.
  - UI Toggle in `AdminSettings` to view alternative currencies (USD/EUR) if needed.

---

## Implementation Todo List

### Phase 1: Foundation & Aesthetics
- [ ] Create `components/admin/AdminModal.tsx`.
- [ ] Update `app/admin/layout.tsx` with high-security CSS variables/Tailwind classes.
- [ ] Implement `lib/admin/formatters.ts` for GMT and GBP.

### Phase 2: Enhanced User Management
- [ ] Redesign `/admin/users` UI to include the new search and filter bars.
- [ ] Update `app/api/admin/users/route.ts` to support category and ID filtering.
- [ ] Integrate `AdminModal` for user editing and deletion workflows.

### Phase 3: Reporting & Notifications
- [ ] Scaffold `app/admin/reports/page.tsx` with the three-column layout.
- [ ] Create `app/api/admin/reports/route.ts` for report management.
- [ ] Implement the `NotificationPanel` component and link to the layout bell icon.

### Phase 4: Polish & Settings
- [ ] Add currency/timezone display logic to all dashboard stats.
- [ ] Implement "System Dashboard" animations (pulse effects, smooth transitions on charts).
