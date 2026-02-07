# Flag/Report Button Implementation

The flag/report button is now integrated into all media overlays (Gallery, Hub, Search).

## Features

✅ **Quick Flag Button**
- Red flag icon in the bottom action bar
- Visible next to Like and Share buttons
- Click to open detailed report modal

✅ **Report Modal**
- 8 report categories:
  - NSFW Content (sexual/adult)
  - Violence (graphic content)
  - Hate Speech (discrimination)
  - Spam (misleading)
  - Copyright (infringement)
  - Harassment (bullying)
  - Misinformation (false info)
  - Other

✅ **Detailed Reporting**
- Select category with descriptions
- Optional description field (500 char limit)
- Shows talent name and content type
- Character counter
- Submit/Cancel buttons

✅ **User Protection**
- Requires login to report
- Shows error if not authenticated
- Prevents duplicate reports via API
- Success confirmation after submission

✅ **Integration Points**
- MediaOverlay (Gallery, Hub, Search)
- Bottom action bar with Like/Share
- Dark theme support
- Responsive design
- Smooth animations

## Button Appearance

**Default State:**
- Red flag icon + "Report" text
- Light hover effect

**Mobile:**
- Flag icon only (no text to save space)
- Same functionality

## Report Submission

When a user submits a report:

```
POST /api/moderation/report
{
  contentId: string
  contentType: "IMAGE" | "VIDEO" | "AUDIO"
  reason: string (optional description)
  category: "nsfw" | "violence" | "hate" | "spam" | "copyright" | "harassment" | "misinformation" | "other"
  reportedById: string
}
```

Reports are:
- Saved to database with timestamp
- Categorized by severity
- Viewable in admin dashboard
- Can't be duplicated by same user

## Admin Dashboard

All reports appear in the Admin Moderation Dashboard at `/admin/moderation`:
- Overview tab shows pending count
- Reports tab displays categorized reports
- Admin can click to view full details
- Actions: Mark Resolved, Issue Strike, Issue Ban

## Next Steps

1. Database migration: `npx prisma migrate dev`
2. Restart dev server
3. Test by opening gallery/hub/search overlay
4. Click the red flag button to see report modal
