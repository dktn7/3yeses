export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

// Recommendations endpoint
// Scoring: 50% views, 30% recency (newer boosted), 20% creator engagement (profile viewCount/likeCount)

function normalize(values: number[]) {
  if (!values || values.length === 0) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max === min) return values.map(() => 0.5);
  return values.map((v) => (v - min) / (max - min));
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const searchParams = url.searchParams;
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '12')));
    const candidateLimit = Math.max(50, Math.min(1000, parseInt(searchParams.get('candidates') || '500')));

    const prisma = getPrisma();

    // Fetch candidate items (recent items as a base set)
    const candidates = await prisma.portfolioItem.findMany({
      orderBy: { createdAt: 'desc' },
      take: candidateLimit,
      include: {
        talentProfile: {
          include: { user: { select: { id: true, name: true } } },
        },
        _count: { select: { views: true } },
      },
    });

    if (!candidates || candidates.length === 0) {
      return NextResponse.json({ items: [] });
    }

    const now = new Date();
    const MAX_RECENCY_DAYS = 90; // recency window for scoring

    // Build arrays for normalization
    const viewsArr = candidates.map((c) => (c as any)._count?.views ?? 0);
    const creatorArr = candidates.map((c) => {
      const tp: any = c.talentProfile as any;
      return (tp?.viewCount ?? tp?.likeCount ?? 0) as number;
    });
    const recencyArr = candidates.map((c) => {
      const days = Math.max(0, (now.getTime() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      const clipped = Math.min(days, MAX_RECENCY_DAYS);
      return Math.max(0, (MAX_RECENCY_DAYS - clipped) / MAX_RECENCY_DAYS);
    });

    const normViews = normalize(viewsArr);
    const normCreator = normalize(creatorArr);

    const scored = candidates.map((item, idx) => {
      const score = 0.5 * (normViews[idx] ?? 0) + 0.3 * (recencyArr[idx] ?? 0) + 0.2 * (normCreator[idx] ?? 0);
      return { item, score, views: viewsArr[idx] ?? 0, creatorEngagement: creatorArr[idx] ?? 0 };
    });

    scored.sort((a, b) => b.score - a.score);

    const results = scored.slice(0, limit).map((s) => {
      const item: any = s.item as any;
      const tp: any = item.talentProfile as any;
      return {
        id: item.id,
        title: item.title,
        mediaUrl: item.mediaUrl,
        thumbnail: item.thumbnail || null,
        type: item.type,
        createdAt: item.createdAt,
        score: Number(s.score.toFixed(6)),
        views: s.views,
        creatorEngagement: s.creatorEngagement,
        talentProfile: {
          id: tp?.userId ?? tp?.id,
          name: tp?.user?.name || null,
          avatarUrl: tp?.avatarUrl || null,
          likeCount: tp?.likeCount ?? 0,
          viewCount: tp?.viewCount ?? 0,
        },
      };
    });

    return NextResponse.json({ items: results, total: results.length }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
    });
  } catch (err) {
    console.error('Failed to compute recommendations', err);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}
