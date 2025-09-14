import { NextRequest, NextResponse } from 'next/server';

import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { like } = await request.json();
    const talentProfileId = params.id;

    // TODO: Add authentication check here
    // For now, use a mock user ID - in production this would come from the session
    const mockUserId = 'user_demo_12345'; // Replace with actual user ID from session


    const client = await pool.connect();
    try {
      if (like) {
        // Add like if not exists
        await client.query(
          `INSERT INTO "Like" ("userId", "talentProfileId", "createdAt")
           VALUES ($1, $2, NOW())
           ON CONFLICT ("userId", "talentProfileId") DO NOTHING`,
          [mockUserId, talentProfileId]
        );
        // Increment like count
        await client.query(
          `UPDATE "TalentProfile" SET "likeCount" = "likeCount" + 1 WHERE id = $1`,
          [talentProfileId]
        );
      } else {
        // Remove like
        await client.query(
          `DELETE FROM "Like" WHERE "userId" = $1 AND "talentProfileId" = $2`,
          [mockUserId, talentProfileId]
        );
        // Decrement like count
        await client.query(
          `UPDATE "TalentProfile" SET "likeCount" = GREATEST("likeCount" - 1, 0) WHERE id = $1`,
          [talentProfileId]
        );
      }
    } finally {
      client.release();
    }

    return NextResponse.json({ 
      success: true, 
      liked: like,
      message: like ? 'Talent liked successfully' : 'Talent unliked successfully'
    });

  } catch (error) {
    console.error('Error handling like request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    // No disconnect needed for pg Pool
  }
}
