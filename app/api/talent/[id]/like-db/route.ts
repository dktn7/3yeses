import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const client = await pool.connect();
  
  try {
    const { id: talentProfileId } = await params;
    
    // TODO: Get actual user ID from session
    const mockUserId = 'user_demo_12345';

    // Begin transaction
    await client.query('BEGIN');

    // Check if user already liked this talent
    const existingLike = await client.query(
      'SELECT id FROM "Like" WHERE "userId" = $1 AND "talentProfileId" = $2',
      [mockUserId, talentProfileId]
    );

    let isLiked: boolean;
    let likeCount: number;

    if (existingLike.rows.length > 0) {
      // Remove like
      await client.query(
        'DELETE FROM "Like" WHERE "userId" = $1 AND "talentProfileId" = $2',
        [mockUserId, talentProfileId]
      );
      
      // Decrement like count
      const result = await client.query(
        'UPDATE "TalentProfile" SET "likeCount" = GREATEST("likeCount" - 1, 0) WHERE id = $1 RETURNING "likeCount"',
        [talentProfileId]
      );
      
      isLiked = false;
      likeCount = result.rows[0]?.likeCount || 0;
    } else {
      // Add like
      await client.query(
        'INSERT INTO "Like" ("userId", "talentProfileId", "createdAt") VALUES ($1, $2, NOW())',
        [mockUserId, talentProfileId]
      );
      
      // Increment like count
      const result = await client.query(
        'UPDATE "TalentProfile" SET "likeCount" = "likeCount" + 1 WHERE id = $1 RETURNING "likeCount"',
        [talentProfileId]
      );
      
      isLiked = true;
      likeCount = result.rows[0]?.likeCount || 1;
    }

    // Commit transaction
    await client.query('COMMIT');

    return NextResponse.json({
      success: true,
      isLiked,
      likeCount,
      message: isLiked ? 'Like added' : 'Like removed',
    });

  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    console.error('Error toggling like:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const client = await pool.connect();
  
  try {
    const { id: talentProfileId } = await params;
    
    // TODO: Get actual user ID from session
    const mockUserId = 'user_demo_12345';

    // Get talent profile with like status
    const talentResult = await client.query(
      'SELECT "likeCount" FROM "TalentProfile" WHERE id = $1',
      [talentProfileId]
    );

    if (talentResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Talent profile not found' },
        { status: 404 }
      );
    }

    // Check if user liked this talent
    const likeResult = await client.query(
      'SELECT id FROM "Like" WHERE "userId" = $1 AND "talentProfileId" = $2',
      [mockUserId, talentProfileId]
    );

    return NextResponse.json({
      success: true,
      likeCount: talentResult.rows[0].likeCount || 0,
      isLiked: likeResult.rows.length > 0,
    });

  } catch (error) {
    console.error('Error fetching like status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
