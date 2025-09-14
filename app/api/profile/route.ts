// User Profile API
// GET /api/profile - Get current user's profile (authenticated)
// PUT /api/profile - Update current user's profile (authenticated)

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { withAuth } from '@/lib/auth/middleware';
import type { AuthenticatedUser, ApiResponse } from '@/types/api';

const prisma = new PrismaClient();

// GET - Get current user's full profile
export const GET = withAuth(
  async (
    request: NextRequest,
    user: AuthenticatedUser
  ): Promise<NextResponse<ApiResponse<any>>> => {
    try {
      const userProfile = await prisma.user.findUnique({
        where: { id: user.userId },
        include: {
          talentProfile: {
            include: {
              category: true,
              subcategory: true,
              portfolio: true,
              reviewsReceived: {
                include: {
                  reviewer: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
                orderBy: {
                  createdAt: 'desc',
                },
              },
            },
          },
          clientProfile: true,
        },
      });

      if (!userProfile) {
        return NextResponse.json(
          { success: false, message: 'User not found' },
          { status: 404 }
        );
      }

      // Remove sensitive data
      const { password, ...safeProfile } = userProfile;

      return NextResponse.json({
        success: true,
        data: safeProfile,
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'An unexpected error occurred';
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to fetch profile',
          error: errorMessage,
        },
        { status: 500 }
      );
    }
  }
);

// PUT - Update user profile
export const PUT = withAuth(
  async (
    request: NextRequest,
    user: AuthenticatedUser
  ): Promise<NextResponse<ApiResponse<any>>> => {
    try {
      const body = await request.json();
      const { userInfo, talentProfile, clientProfile } = body;

      // Start transaction
      const result = await prisma.$transaction(async (tx) => {
        // Update basic user info if provided
        if (userInfo) {
          await tx.user.update({
            where: { id: user.userId },
            data: {
              name: userInfo.name,
              // Add other updatable user fields here
            },
          });
        }

        // Update talent profile if user is talent and data provided
        if (user.role === 'TALENT' && talentProfile) {
          await tx.talentProfile.upsert({
            where: { userId: user.userId },
            update: talentProfile,
            create: {
              ...talentProfile,
              userId: user.userId,
            },
          });
        }

        // Update client profile if user is client and data provided
        if (user.role === 'CLIENT' && clientProfile) {
          await tx.clientProfile.upsert({
            where: { userId: user.userId },
            update: clientProfile,
            create: {
              ...clientProfile,
              userId: user.userId,
            },
          });
        }

        // Return updated profile
        return await tx.user.findUnique({
          where: { id: user.userId },
          include: {
            talentProfile: {
              include: {
                category: true,
                subcategory: true,
              },
            },
            clientProfile: true,
          },
        });
      });

      if (!result) {
        return NextResponse.json(
          { success: false, message: 'Failed to update profile' },
          { status: 500 }
        );
      }

      // Remove sensitive data
      const { password, ...safeProfile } = result;

      return NextResponse.json({
        success: true,
        data: safeProfile,
        message: 'Profile updated successfully',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'An unexpected error occurred';
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to update profile',
          error: errorMessage,
        },
        { status: 500 }
      );
    }
  }
);
