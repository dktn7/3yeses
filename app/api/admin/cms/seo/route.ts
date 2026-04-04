import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminAuth } from '@/lib/middleware/adminAuth';

// Default SEO metadata for all site pages
const DEFAULT_SEO: { route: string; title: string; description: string; keywords: string[] }[] = [
  { route: '/', title: '3YESES – Talent Marketplace', description: 'Discover and connect with top talent across acting, music, modelling, dance, and more.', keywords: ['talent', 'marketplace', 'actors', 'musicians', 'models'] },
  { route: '/about', title: 'About 3YESES', description: 'Learn about the 3YESES platform – empowering talent to showcase their skills and get discovered.', keywords: ['about', '3yeses', 'talent platform'] },
  { route: '/terms', title: 'Terms of Service – 3YESES', description: 'Read our terms of service and usage policies.', keywords: ['terms', 'legal', 'policies'] },
  { route: '/privacy', title: 'Privacy Policy – 3YESES', description: 'How we collect, use, and protect your personal data.', keywords: ['privacy', 'data protection', 'GDPR'] },
  { route: '/pricing', title: 'Pricing – 3YESES', description: 'Simple, affordable subscription plans for talent. Standard access for £10 per 6 months.', keywords: ['pricing', 'subscription', 'plans'] },
  { route: '/contact', title: 'Contact Us – 3YESES', description: 'Get in touch with the 3YESES team.', keywords: ['contact', 'support', 'help'] },
  { route: '/help', title: 'Help & FAQ – 3YESES', description: 'Find answers to frequently asked questions about 3YESES.', keywords: ['help', 'FAQ', 'support'] },
  { route: '/resources', title: 'Resources – 3YESES', description: 'Resources, tips, and guides for talent on 3YESES.', keywords: ['resources', 'guides', 'talent tips'] },
  { route: '/success-stories', title: 'Success Stories – 3YESES', description: 'Read how talent have found success on 3YESES.', keywords: ['success', 'stories', 'testimonials'] },
  { route: '/categories', title: 'Categories – 3YESES', description: 'Browse talent by category – actors, musicians, models, dancers, voice artists, and more.', keywords: ['categories', 'talent types', 'browse'] },
  { route: '/hub', title: 'Creative Hub – 3YESES', description: 'Explore portfolios and creative work from talented performers.', keywords: ['creative hub', 'portfolios', 'showcase'] },
  { route: '/search', title: 'Search – 3YESES', description: 'Search for talent by name, category, location, and skills.', keywords: ['search', 'find talent', 'discover'] },
  { route: '/dashboard', title: 'Dashboard – 3YESES', description: 'Manage your profile, portfolio, and account settings.', keywords: ['dashboard', 'account', 'settings'] },
  { route: '/login', title: 'Login – 3YESES', description: 'Sign in to your 3YESES account.', keywords: ['login', 'sign in'] },
  { route: '/signup', title: 'Sign Up – 3YESES', description: 'Create your 3YESES account and start showcasing your talent.', keywords: ['signup', 'register', 'create account'] },
];

// GET /api/admin/cms/seo - List all SEO metadata
export async function GET(request: NextRequest) {
  const authResult = await verifyAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    // Auto-populate with defaults if no SEO entries exist
    const count = await prisma.seoMetadata.count();
    if (count === 0) {
      for (const seo of DEFAULT_SEO) {
        try {
          await prisma.seoMetadata.create({ data: seo });
        } catch {
          // Skip duplicates
          continue;
        }
      }
    }

    const metadata = await prisma.seoMetadata.findMany({
      orderBy: { route: 'asc' },
    });

    return NextResponse.json(metadata);
  } catch (error) {
    console.error('Error fetching SEO metadata:', error);
    return NextResponse.json(
      { error: 'Failed to fetch SEO metadata' },
      { status: 500 }
    );
  }
}

// POST /api/admin/cms/seo - Create or update SEO metadata for a route
export async function POST(request: NextRequest) {
  const authResult = await verifyAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await request.json();
    const { route, title, description, keywords, ogImage } = body;

    const metadata = await prisma.seoMetadata.upsert({
      where: { route },
      update: {
        title,
        description,
        keywords: keywords || [],
        ogImage,
      },
      create: {
        route,
        title,
        description,
        keywords: keywords || [],
        ogImage,
      },
    });

    return NextResponse.json(metadata);
  } catch (error) {
    console.error('Error saving SEO metadata:', error);
    return NextResponse.json(
      { error: 'Failed to save SEO metadata' },
      { status: 500 }
    );
  }
}
