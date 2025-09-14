// Bookings API
// GET /api/bookings - Get user's bookings (authenticated)
// POST /api/bookings - Create new booking (authenticated)

import { NextRequest, NextResponse } from 'next/server';
import { Prisma, PrismaClient, BookingStatus } from '@prisma/client';
import { withAuth } from '@/lib/auth/middleware';
import type { AuthenticatedUser, ApiResponse } from '@/types/api';

const prisma = new PrismaClient();

// GET - Fetch user's bookings
export const GET = withAuth(
  async (
    request: NextRequest,
    user: AuthenticatedUser
  ): Promise<NextResponse<ApiResponse<any>>> => {
    try {
      const { searchParams } = new URL(request.url);
      const statusParam = searchParams.get('status');
      const page = parseInt(searchParams.get('page') || '1', 10);
      const limit = parseInt(searchParams.get('limit') || '10', 10);
      const offset = (page - 1) * limit;

      const whereClause: Prisma.BookingWhereInput = {};

      if (user.role === 'CLIENT') {
        whereClause.clientId = user.userId;
      } else if (user.role === 'TALENT') {
        whereClause.talentId = user.userId;
      } else {
        return NextResponse.json(
          { success: false, message: 'Invalid user role' },
          { status: 403 }
        );
      }

      if (statusParam && Object.values(BookingStatus).includes(statusParam as BookingStatus)) {
        whereClause.status = statusParam as BookingStatus;
      }

      const [bookings, totalCount] = await prisma.$transaction([
        prisma.booking.findMany({
          where: whereClause,
          orderBy: { createdAt: 'desc' },
          skip: offset,
          take: limit,
          include: {
            client: {
              select: {
                id: true,
                name: true,
                email: true,
                clientProfile: {
                  select: { companyName: true },
                },
              },
            },
          },
        }),
        prisma.booking.count({ where: whereClause }),
      ]);

      // Get all unique talent IDs from the bookings
      const talentUserIds = [...new Set(bookings.map(b => b.talentId))];

      // Fetch all related talent profiles in a single query
      const talentProfiles = await prisma.talentProfile.findMany({
        where: {
          userId: { in: talentUserIds },
        },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      // Create a map for easy lookup
      const talentProfileMap = new Map(talentProfiles.map(p => [p.userId, p]));

      const enrichedBookings = bookings.map(booking => {
        const talentProfile = talentProfileMap.get(booking.talentId);
        return {
          ...booking,
          talent: talentProfile ? {
            id: talentProfile.id,
            userId: talentProfile.userId,
            name: talentProfile.user.name,
            roleDescription: talentProfile.roleDescription,
            avatarUrl: talentProfile.avatarUrl,
          } : null,
        };
      });

      const totalPages = Math.ceil(totalCount / limit);

      return NextResponse.json({
        success: true,
        data: {
          bookings: enrichedBookings,
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
      console.error('Error fetching bookings:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'An unexpected error occurred';
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to fetch bookings.',
          error: errorMessage,
        },
        { status: 500 }
      );
    }
  }
);

// POST - Create new booking
export const POST = withAuth(
  async (
    request: NextRequest,
    user: AuthenticatedUser
  ): Promise<NextResponse<ApiResponse<any>>> => {
    try {
      if (user.role !== 'CLIENT') {
        return NextResponse.json(
          { success: false, message: 'Only clients can create bookings.' },
          { status: 403 }
        );
      }

      const body = await request.json();
      const { talentId, bookingDate, details } = body;

      if (!talentId || !bookingDate) {
        return NextResponse.json(
          {
            success: false,
            message: 'Missing required fields: talentId, bookingDate.',
          },
          { status: 400 }
        );
      }

      const talentProfile = await prisma.talentProfile.findUnique({
        where: { id: talentId },
      });

      if (!talentProfile) {
        return NextResponse.json(
          { success: false, message: 'Talent not found.' },
          { status: 404 }
        );
      }

  // NOTE: availability field was removed from the data model.
  // We no longer block bookings based on an availability enum here.

      const newBooking = await prisma.booking.create({
        data: {
          clientId: user.userId,
          talentId: talentProfile.userId, // Ensure we use the user ID associated with the talent profile
          bookingDate: new Date(bookingDate),
          details: details || null,
          status: 'PENDING',
        },
      });

      return NextResponse.json(
        {
          success: true,
          message: 'Booking request sent successfully.',
          data: newBooking,
        },
        { status: 201 }
      );
    } catch (error) {
      console.error('Error creating booking:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'An unexpected error occurred';
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to create booking.',
          error: errorMessage,
        },
        { status: 500 }
      );
    }
  }
);

