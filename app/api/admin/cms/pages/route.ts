import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdminAuth } from '@/lib/middleware/adminAuth';

// All real pages in the app that should be manageable via CMS
const DEFAULT_PAGES = [
  { slug: 'home', internalNote: 'Homepage / Landing page', title: 'Home' },
  { slug: 'about', internalNote: 'About 3YESES', title: 'About Us' },
  { slug: 'terms', internalNote: 'Terms of Service', title: 'Terms of Service' },
  { slug: 'privacy', internalNote: 'Privacy Policy', title: 'Privacy Policy' },
  { slug: 'pricing', internalNote: 'Subscription Pricing', title: 'Pricing' },
  { slug: 'contact', internalNote: 'Contact Us', title: 'Contact' },
  { slug: 'help', internalNote: 'Help & FAQ', title: 'Help & FAQ' },
  { slug: 'resources', internalNote: 'Resources for Talent', title: 'Resources' },
  { slug: 'success-stories', internalNote: 'Success Stories', title: 'Success Stories' },
  { slug: 'categories', internalNote: 'Talent Categories', title: 'Categories' },
  { slug: 'hub', internalNote: 'Creative Hub / Portfolio Feed', title: 'Creative Hub' },
  { slug: 'search-results', internalNote: 'Search Results', title: 'Search Results' },
  { slug: 'dashboard', internalNote: 'User Dashboard', title: 'Dashboard' },
  { slug: 'auth-login', internalNote: 'Login Page', title: 'Login' },
  { slug: 'auth-signup', internalNote: 'Registration Flow', title: 'Sign Up' },
];

async function handler(req: NextRequest, context: { admin: { userId: string } }) {
  try {
    const adminId = context.admin.userId;

    // Ensure all site pages exist in CMS with at least one content version
    for (const page of DEFAULT_PAGES) {
      // Upsert the content page
      await prisma.contentPage.upsert({
        where: { slug: page.slug },
        update: {},
        create: { slug: page.slug, internalNote: page.internalNote },
      });

      // Check if this page already has any versions
      const versionCount = await prisma.contentVersion.count({
        where: { pageSlug: page.slug },
      });

      // Create a default draft version if none exist
      if (versionCount === 0) {
        await prisma.contentVersion.create({
          data: {
            pageSlug: page.slug,
            locale: 'en-gb',
            title: page.title,
            content: `<h1>${page.title}</h1>\n<p>${page.internalNote || 'Page content goes here.'}</p>`,
            changeNote: 'Initial draft created automatically',
            authorId: adminId,
          },
        });
      }
    }

    const pages = await prisma.contentPage.findMany({
      include: {
        published: {
          include: {
            version: {
              select: {
                createdAt: true,
                title: true,
              }
            }
          }
        },
        _count: {
          select: { versions: true }
        }
      }
    });

    return NextResponse.json(pages);
  } catch (error) {
    console.error('Error fetching CMS pages:', error);
    // Return empty array on error to prevent frontend crash
    return NextResponse.json([], { status: 500 });
  }
}

export const GET = withAdminAuth(handler);
