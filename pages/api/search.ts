import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { query, filters } = req.body;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ success: false, message: 'Invalid query' });
  }

  try {
    // Search categories
    const categories = await prisma.category.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        subcategories: true,
      },
    });

    // Search subcategories
    const subcategories = await prisma.subcategory.findMany({
      where: {
        name: { contains: query, mode: 'insensitive' },
      },
    });

    // Search talent profiles with advanced filters
    const talentProfiles = await prisma.talentProfile.findMany({
      where: {
        AND: [
          {
            OR: [
              { roleDescription: { contains: query, mode: 'insensitive' } },
              { bio: { contains: query, mode: 'insensitive' } },
              { skills: { has: query } },
              { user: { name: { contains: query, mode: 'insensitive' } } },
            ],
          },
          filters?.availability ? { availability: filters.availability } : {},
          filters?.eyeColor ? { eyeColor: filters.eyeColor } : {},
          filters?.hairColor ? { hairColor: filters.hairColor } : {},
        ],
      },
      include: {
        user: true,
      },
    });

    return res.status(200).json({
      success: true,
      categories,
      subcategories,
      talentProfiles,
    });
  } catch (error) {
    console.error('Error during search:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}
