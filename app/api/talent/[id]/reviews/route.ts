import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// GET - Fetch reviews for a talent
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const talentId = params.id;

    // In a real app, fetch from database
    // For now, return sample data
    const sampleReviews = [
      {
        id: '1',
        author: 'Sarah Mitchell',
        authorRole: 'Director',
        rating: 5,
        comment: 'Outstanding performance in our short film. Brought incredible depth to the character and was a joy to work with on set. Highly professional and talented.',
        project: 'Summer Dreams Production',
        date: '2 weeks ago',
        verified: true,
      },
      {
        id: '2',
        author: 'Michael Roberts',
        authorRole: 'Producer',
        rating: 4,
        comment: 'Professional approach and excellent screen presence. Delivered exactly what our brand needed for the campaign. Would work with again!',
        project: 'Spring Commercial Campaign',
        date: '1 month ago',
        verified: true,
      },
      {
        id: '3',
        author: 'Lisa Kim',
        authorRole: 'Casting Director',
        rating: 5,
        comment: 'Incredible stage presence and vocal range. The audience was captivated throughout the entire performance. A true professional.',
        project: 'Broadway Theater Production',
        date: '2 months ago',
        verified: true,
      },
      {
        id: '4',
        author: 'David Chen',
        authorRole: 'Creative Director',
        rating: 5,
        comment: 'Exceeded all expectations. Very easy to direct and brought fresh ideas to the table. The final product was better than we imagined.',
        project: 'Corporate Video Series',
        date: '3 months ago',
        verified: false,
      },
      {
        id: '5',
        author: 'Emma Thompson',
        authorRole: 'Event Coordinator',
        rating: 4,
        comment: 'Great performance at our gala event. Guests were thoroughly entertained and the energy was perfect for the occasion.',
        project: 'Annual Charity Gala',
        date: '4 months ago',
        verified: true,
      },
    ];

    return NextResponse.json({
      success: true,
      reviews: sampleReviews,
      averageRating: 4.6,
      totalReviews: sampleReviews.length,
    });
  } catch (error) {
    console.error('Reviews fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// POST - Add a new review
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.cookies.get('accessToken')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const talentId = params.id;
    const body = await req.json();

    const { rating, comment, project } = body;

    // Validation
    if (!rating || !comment || !project) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // In a real app, save to database
    // For now, return success
    const newReview = {
      id: Date.now().toString(),
      userId: decoded.userId,
      talentId,
      rating,
      comment,
      project,
      createdAt: new Date(),
      verified: false,
    };

    return NextResponse.json({
      success: true,
      review: newReview,
      message: 'Review submitted successfully',
    });
  } catch (error) {
    console.error('Review submission error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit review' },
      { status: 500 }
    );
  }
}
