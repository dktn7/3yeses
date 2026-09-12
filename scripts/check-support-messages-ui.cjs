const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const base = process.env.DASHBOARD_REVIEW_URL || 'http://localhost:3003';
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1360, height: 920 } });
  const failures = [];
  const posts = [];

  page.on('pageerror', (error) => failures.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') failures.push(message.text());
  });
  await page.addInitScript(() => {
    localStorage.setItem('cookie-consent', JSON.stringify({ necessary: true, preferences: false, statistics: false, marketing: false }));
    localStorage.setItem('theme', 'light');
  });

  const mockUser = {
    id: 'user-test-1',
    email: 'test@3yeses.online',
    name: 'Test User',
    role: 'TALENT',
    firstName: 'Test',
    lastName: 'User',
    emailVerified: true,
    profileComplete: false,
    avatarUrl: null,
    talentProfile: { userId: 'user-test-1', performerTitle: 'Actor' },
  };

  const inbox = {
    success: true,
    announcements: [
      {
        id: 'announcement-1',
        title: 'Scheduled maintenance',
        message: '3YESES support will be slower than usual tonight while we update account tools.',
        type: 'INFO',
        createdAt: new Date('2026-09-12T09:00:00.000Z').toISOString(),
        expiresAt: null,
      },
      {
        id: 'announcement-2',
        title: 'Portfolio review queue',
        message: 'The team is reviewing new portfolio reports today.',
        type: 'WARNING',
        createdAt: new Date('2026-09-12T10:00:00.000Z').toISOString(),
        expiresAt: null,
      },
    ],
    conversations: [
      {
        id: 'ticket-1',
        subject: 'Billing question',
        category: 'BILLING',
        status: 'WAITING_FOR_USER',
        priority: 'MEDIUM',
        createdAt: new Date('2026-09-11T12:30:00.000Z').toISOString(),
        updatedAt: new Date('2026-09-12T08:30:00.000Z').toISOString(),
        lastMessage: {
          id: 'message-2',
          content: 'Could you confirm the invoice number?',
          isStaff: true,
          author: { id: 'admin-1', name: '3YESES Support', email: 'support@3yeses.online' },
          createdAt: new Date('2026-09-12T08:30:00.000Z').toISOString(),
        },
        messages: [
          {
            id: 'ticket-1-initial',
            content: 'I need help with my billing history.',
            isStaff: false,
            author: { id: 'user-test-1', name: 'Test User', email: 'test@3yeses.online' },
            createdAt: new Date('2026-09-11T12:30:00.000Z').toISOString(),
          },
          {
            id: 'message-2',
            content: 'Could you confirm the invoice number?',
            isStaff: true,
            author: { id: 'admin-1', name: '3YESES Support', email: 'support@3yeses.online' },
            createdAt: new Date('2026-09-12T08:30:00.000Z').toISOString(),
          },
        ],
      },
    ],
    counts: { announcements: 2, conversations: 1, open: 1 },
  };

  await page.route('**/api/auth/verify', (route) => route.fulfill({ json: { success: true, user: mockUser } }));
  await page.route('**/api/user/profile-completion', (route) => route.fulfill({ json: { percentage: 70, missingFields: ['Add portfolio media'] } }));
  await page.route('**/api/notifications', (route) => route.fulfill({ json: { notifications: [], unreadCount: 0 } }));
  await page.route('**/api/communications/alerts', (route) => route.fulfill({ json: inbox.announcements }));
  await page.route('**/api/messages', async (route) => {
    if (route.request().method() === 'POST') {
      posts.push(route.request().postDataJSON());
      return route.fulfill({ status: 201, json: { success: true, conversation: inbox.conversations[0] } });
    }
    return route.fulfill({ json: inbox });
  });

  await page.goto(`${base}/en-gb/support`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button').filter({ hasText: /^T$/ }).click();
  await page.getByRole('button', { name: /Messages/i }).waitFor();
  await page.getByRole('button', { name: /Messages/i }).click();
  await page.waitForURL('**/en-gb/dashboard/messages');
  await page.getByRole('heading', { name: 'Messages' }).waitFor();
  await page.getByText('Scheduled maintenance').waitFor();
  await page.getByRole('heading', { name: 'Billing question' }).waitFor();
  await page.getByText('Could you confirm the invoice number?').nth(1).waitFor();

  await page.getByPlaceholder('Reply to support').fill('The invoice number is INV-1042.');
  await page.getByRole('button', { name: 'Reply' }).click();

  await page.getByRole('button', { name: 'New support message' }).click();
  await page.getByPlaceholder('Subject').fill('Profile help');
  await page.getByPlaceholder('Tell us what you need help with.').fill('Please check whether my profile is ready for review.');
  await page.getByRole('button', { name: 'Send to support' }).click();

  await page.screenshot({ path: 'test-results/support-messages-ui.png', fullPage: true });

  const hasReply = posts.some((post) => post.ticketId === 'ticket-1' && post.message === 'The invoice number is INV-1042.');
  const hasNewTicket = posts.some((post) => post.subject === 'Profile help' && post.message.includes('profile is ready'));
  if (!hasReply) failures.push('Reply did not post the expected support ticket payload.');
  if (!hasNewTicket) failures.push('New support message did not post the expected support payload.');

  fs.writeFileSync('test-results/support-messages-ui.json', JSON.stringify({ posts, failures }, null, 2));
  await browser.close();

  if (failures.length) {
    console.error(JSON.stringify({ failures, posts }, null, 2));
    process.exitCode = 1;
    return;
  }

  console.log(JSON.stringify({ ok: true, posts }, null, 2));
})().catch(async (error) => {
  console.error(error);
  process.exitCode = 1;
});
