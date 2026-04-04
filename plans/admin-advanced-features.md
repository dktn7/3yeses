# Technical Plan: Advanced Admin Features

This plan outlines the implementation of advanced administrative features for the 3Yeses platform, focusing on specialized UI themes, system observability, content management, and communications.

## 1. "Blue Mode" & Accessibility

**Goal:** Create a distinct visual identity for the Admin Panel ("Blue-tinted Light Mode") to distinguish it from the main user application, along with accessibility controls.

### Architecture
- **Scope:** Applies only to routes under `/admin/*` (or the specific admin layout).
- **State Management:** A React Context (`AdminThemeContext`) to manage:
  - `theme`: `'default' | 'blue-light'`
  - `fontSize`: `1` (Normal), `2` (Large), `3` (Extra Large)
  - `highContrast`: `boolean`
  - `inverted`: `boolean`
- **Persistence:** Store preferences in `localStorage` (key: `admin_theme_prefs`).

### Implementation Strategy
1.  **Tailwind Configuration:**
    - Define CSS variables for admin-specific semantic colors (e.g., `--admin-bg`, `--admin-text`, `--admin-primary`).
    - Extend `tailwind.config.ts` to include an `admin` modifier or specific utility classes that map to these variables.
    
    ```css
    /* globals.css */
    .admin-theme-blue {
      --admin-bg: #f0f7ff;
      --admin-surface: #ffffff;
      --admin-border: #bfdbfe;
      --admin-primary: #2563eb;
      --admin-text: #1e3a8a;
    }
    
    .admin-high-contrast {
      --admin-bg: #ffffff;
      --admin-surface: #ffffff;
      --admin-border: #000000;
      --admin-primary: #0000aa;
      --admin-text: #000000;
    }
    ```

2.  **Theme Provider:**
    - Create `components/admin/AdminThemeProvider.tsx`.
    - Apply classes to the root `<div>` of the `AdminLayout` based on context state.
    - `fontSize` will apply a scaling class (e.g., `text-scale-110`) or set a root font-size variable.

3.  **UI Controls:**
    - Add a "Theme & Accessibility" settings panel in the Admin Sidebar or a top-bar dropdown.
    - Toggles for "High Contrast" and "Invert Colors".
    - Slider or button group for Font Size.

## 2. System Monitoring Dashboard

**Goal:** Visualize system health, API usage, and database performance.

### Data Model (`SystemMetric`)
We need a new Prisma model to store time-series data.

```prisma
model SystemMetric {
  id        String   @id @default(cuid())
  type      MetricType
  value     Float    // duration in ms, or count
  name      String   // e.g., "api_request_duration", "db_query_duration"
  tags      Json?    // e.g., { path: "/api/users", method: "GET" }
  createdAt DateTime @default(now())

  @@index([type, createdAt])
}

enum MetricType {
  API_REQUEST
  DB_QUERY
  ERROR_LOG
  SYSTEM_HEALTH
}
```

### Architecture
1.  **Ingestion:**
    - **API Usage:** Middleware (`middleware.ts` or a wrapper) to measure request duration and log 4xx/5xx errors.
    - **DB Health:** A Prisma extension (`$extends`) to intercept queries and log duration if it exceeds a threshold (e.g., >100ms).
    - **Uptime:** Since this is likely serverless, "uptime" is abstract. We will track "Success Rate" (200s vs 500s) over time.

2.  **Visualization (Recharts):**
    - **Charts:**
      - **API Traffic:** Area chart of requests/minute.
      - **Latency:** Line chart of average P95 response times.
      - **Errors:** Bar chart of 5xx errors by endpoint.
    - **Dashboard Page:** `/admin/system/monitor`.

3.  **Data Cleanup:**
    - A cron job or periodic check to delete `SystemMetric` records older than 30 days to prevent DB bloat.

## 3. CMS (Content Management System)

**Goal:** Version-controlled editing for static content pages (Pricing, Terms, Privacy) with **multi-language support (i18n)**.

### Data Model

We separate the "Page" concept from the specific "Version" and use a dedicated table to track which version is "Live" for each locale.

```prisma
model ContentPage {
  slug        String   @id // e.g., "terms-of-service"
  description String?  // Internal note: "Legal terms page"
  
  versions    ContentVersion[]
  published   PublishedContent[] 
}

// Stores the pointer to the currently active version for a specific locale
model PublishedContent {
  id        String      @id @default(cuid())
  
  page      ContentPage @relation(fields: [pageSlug], references: [slug], onDelete: Cascade)
  pageSlug  String
  
  locale    String      // e.g., "en", "es", "fr"
  
  version   ContentVersion @relation(fields: [versionId], references: [id])
  versionId String
  
  @@unique([pageSlug, locale]) // Only one published version per page per locale
}

model ContentVersion {
  id          String      @id @default(cuid())
  
  page        ContentPage @relation(fields: [pageSlug], references: [slug], onDelete: Cascade)
  pageSlug    String
  
  locale      String      // Language of this specific version
  title       String      // Localized title
  content     String      @db.Text // HTML or Markdown
  changelog   String?     // "Updated pricing section"
  
  authorId    String
  author      User     @relation(fields: [authorId], references: [id])
  
  createdAt   DateTime @default(now())
  
  // Back-relation to see if this version is published
  publishedEntry PublishedContent[]
}
```

### UI Flow
1.  **Page List:** `/admin/cms`
    -   Lists all pages (e.g., "Terms", "Privacy").
    -   Shows status columns: "EN (Live)", "ES (Draft)", "FR (Missing)".

2.  **Editor:** `/admin/cms/[slug]`
    -   **Locale Selector:** Tabs at the top (e.g., `[ English ] [ Español ] [ + Add Locale ]`).
    -   **Main Area:** Rich Text Editor (TipTap) for the selected locale.
    -   **Sidebar:** Version history *filtered by the selected locale*.
    -   **Actions:** 
        -   "Save Draft" (Creates new `ContentVersion`).
        -   "Publish" (Updates `PublishedContent` for this locale to point to the new version).
        -   "Compare" (Diff against previous version).

## 4. Communications System

**Goal:** Manage email templates and global system notifications.

### Data Model

```prisma
model EmailTemplate {
  id          String   @id // e.g., "welcome-email"
  name        String
  subject     String
  body        String   @db.Text // HTML with {{variables}}
  variables   String[] // List of available variables for this template
  lastUpdated DateTime @updatedAt
}

model GlobalNotification {
  id          String   @id @default(cuid())
  title       String
  message     String
  type        NotificationType // INFO, WARNING, CRITICAL
  targetRole  Role?    // Null = All, or specific role
  active      Boolean  @default(true)
  expiresAt   DateTime?
  createdAt   DateTime @default(now())
}
```

### UI Flow
1.  **Email Templates:**
    - List view of all templates.
    - Edit view with live preview (mock data).
    - Send Test Email functionality.
2.  **Global Notifications:**
    - "Broadcast Center" in Admin.
    - Create new notification: Inputs for title, message, type (color code), audience.
    - Dashboard list of active notifications with "Deactivate" button.
    - **Frontend:** A component in `GlobalHeader` that fetches and displays active global notifications.

## 5. Login UX Improvements

**Goal:** Refine the admin login experience.

### Improvements
1.  **State Machine:**
    - Define clear states: `IDLE`, `VALIDATING`, `SUBMITTING`, `SUCCESS`, `ERROR`, `LOCKED_OUT`.
    - Implementation: Use `useReducer` or a state library for the login form.
2.  **Visual Feedback:**
    - **Loading:** Replace button text with a spinner. Disable inputs.
    - **Error:** Shake animation on the form container. Clear red border on inputs.
    - **Success:** Smooth transition/fade out before redirect.
3.  **Security/UX:**
    - **Focus:** Auto-focus email input on load.
    - **Enter Key:** Ensure `OnSubmit` handles 'Enter' key properly.
    - **Redirect:** Capture `?callbackUrl=` to redirect deep into admin panel after login.

## Implementation Steps (Todo List)

1.  **Database Updates:**
    - [ ] Create `SystemMetric`, `ContentPage`, `ContentVersion`, `PublishedContent`, `EmailTemplate`, `GlobalNotification` models in `schema.prisma`.
    - [ ] Run `prisma migrate dev`.

2.  **Core Admin Infrastructure:**
    - [ ] Create `AdminThemeProvider` context and wrapper.
    - [ ] Configure Tailwind for admin-specific variables.
    - [ ] Build "Settings" sidebar panel for accessibility toggles.

3.  **System Monitoring:**
    - [ ] Implement `logMetric` utility function.
    - [ ] Create API route `/api/admin/metrics` to aggregate data.
    - [ ] Build `MonitoringDashboard` component using `recharts`.

4.  **CMS (with i18n):**
    - [ ] Seed initial pages (Terms, Privacy) for default locale ('en').
    - [ ] Build `ContentEditor` component with Locale Tabs.
    - [ ] Implement API logic to fetch "Published" version by locale.

5.  **Communications:**
    - [ ] Build `EmailTemplateEditor` with preview.
    - [ ] Build `NotificationManager` interface.
    - [ ] Create `GlobalAlert` component for the main site layout.

6.  **Login UX:**
    - [ ] Refactor `app/admin-login/page.tsx` to use new state machine logic.
    - [ ] Add animations (framer-motion or CSS).
