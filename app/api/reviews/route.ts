import { NextRequest, NextResponse } from 'next/server';
import { Prisma, PrismaClient, Review } from '@prisma/client';
import { withAuth } from '@/lib/auth/middleware';
import type { AuthenticatedUser, ApiResponse } from '@/types/api';

const prisma = new PrismaClient();

// POST - Create a new review
export const POST = withAuth(
  async (
    request: NextRequest,
    user: AuthenticatedUser
  ): Promise<NextResponse<ApiResponse<Review>>> => {
    try {
      if (user.role !== 'CLIENT') {
        return NextResponse.json(
          { success: false, message: 'Only clients can post reviews.' },
          { status: 403 }
        );
      }

      const body = await request.json();
      const { bookingId, rating, comment } = body;

      if (!bookingId || !rating) {
        return NextResponse.json(
          { success: false, message: 'Missing required fields: bookingId, rating.' },
          { status: 400 }
        );
      }

      const booking = await prisma.booking.findFirst({
        where: { id: bookingId, clientId: user.userId, status: 'COMPLETED' },
      });

      if (!booking) {
        return NextResponse.json(
          { success: false, message: 'You can only review talent from a completed booking.' },
          { status: 403 }
        );
      }

      const talentProfile = await prisma.talentProfile.findUnique({
        where: { userId: booking.talentId },
      });

      if (!talentProfile) {
        return NextResponse.json(
          { success: false, message: 'Talent profile not found for this booking.' },
          { status: 404 }
        );
      }

      const existingReview = await prisma.review.findFirst({
        where: { reviewerId: user.userId, talentProfileId: talentProfile.id },
      });

      if (existingReview) {
        return NextResponse.json(
          { success: false, message: 'You have already submitted a review for this talent.' },
          { status: 409 }
        );
      }

      const newReview = await prisma.$transaction(async (tx) => {
        const review = await tx.review.create({
          data: {
            rating: rating,
            comment: comment,
            reviewer: { connect: { id: user.userId } },
            talentProfile: { connect: { id: talentProfile.id } },
          },
        });

        const aggregate = await tx.review.aggregate({
          _avg: { rating: true },
          where: { talentProfileId: talentProfile.id },
        });

        const newAverageRating = aggregate._avg.rating || 0;

        await tx.talentProfile.update({
          where: { id: talentProfile.id },
          data: { rating: newAverageRating },
        });

        return review;
      });

      return NextResponse.json(
        { success: true, message: 'Review submitted successfully.', data: newReview },
        { status: 201 }
      );
    } catch (error) {
      console.error('Error creating review:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      return NextResponse.json(
        { success: false, message: 'Failed to create review.', error: errorMessage },
        { status: 500 }
      );
    }
  }
);

// GET - Fetch reviews for a talent
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const talentProfileId = searchParams.get('talentProfileId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    if (!talentProfileId) {
      return NextResponse.json(
        { success: false, message: 'Missing required query parameter: talentProfileId' },
        { status: 400 }
      );
    }

    const whereClause: Prisma.ReviewWhereInput = { talentProfileId };

    const [reviews, totalCount] = await prisma.$transaction([
      prisma.review.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
        include: {
          reviewer: {
            select: {
              id: true,
              name: true,
              talentProfile: { select: { avatarUrl: true } },
            },
          },
        },
      }),
      prisma.review.count({ where: whereClause }),
    ]);

    const formattedReviews = reviews.map(r => ({
        ...r,
        reviewer: {
            id: r.reviewer.id,
            name: r.reviewer.name,
            avatarUrl: r.reviewer.talentProfile?.avatarUrl
        }
    }));

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      data: {
        reviews: formattedReviews,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNext: page < totalPages,
          hasPrev: page > 1,
          limit,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json(
      { success: false, message: 'Failed to fetch reviews.', error: errorMessage },
      { status: 500 }
    );
  }
}
