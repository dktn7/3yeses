import { NextRequest, NextResponse } from 'next/server';

// GET - Fetch user notifications
export async function GET() {
  try {
    // For demo purposes, return mock notifications
    // In a real app, you'd authenticate the user and fetch from database
    const mockNotifications = [
      {
        id: '1',
        type: 'profile_view',
        title: 'Profile View',
        message: 'Sarah Johnson viewed your profile',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        read: false,
      },
      {
        id: '2',
        type: 'profile_save',
        title: 'Profile Saved',
        message: 'Alex Thompson saved your profile',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        read: false,
      },
      {
        id: '3',
        type: 'booking_request',
        title: 'Booking Request',
        message: 'New booking request from Creative Agency',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        read: true,
      },
    ];

    return NextResponse.json({ notifications: mockNotifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Mark notifications as read
export async function POST(request: NextRequest) {
  try {
    const { notificationIds, markAllAsRead } = await request.json();

    // In a real app, you'd update the notifications in the database
    // For now, just return success
    if (markAllAsRead) {
      return NextResponse.json({ message: 'All notifications marked as read' });
    } else if (notificationIds && Array.isArray(notificationIds)) {
      return NextResponse.json({ message: `${notificationIds.length} notifications marked as read` });
    }

    return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
