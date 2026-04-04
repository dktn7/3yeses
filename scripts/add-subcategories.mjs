import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SUBS = {
  'Acting & Performance': [
    'Film/TV Acting',
    'Theatre',
    'Commercials',
    'Extras / Background',
    'Voice Acting'
  ],
  'Comedy': [
    'Stand-up',
    'Sketch Comedy',
    'Improv',
    'Comedy Writing'
  ],
  'Dancing & Choreography': [
    'Ballet / Classical',
    'Hip-Hop / Street',
    'Contemporary / Modern',
    'Commercial / Music Video',
    'Choreographers'
  ],
  'Modeling': [
    'Fashion / Runway',
    'Commercial / Catalogue',
    'Portrait / Editorial',
    'Fitness / Sports Modeling',
    'Plus Size'
  ],
  'Music & Audio': [
    'Musicians (Instrumental)',
    'Vocalists / Singers',
    'Music Production',
    'DJs',
    'Session Musicians',
    'Composers / Arrangers'
  ],
  'Sports & Fitness': [
    'Personal Trainers',
    'Dancers (fitness)',
    'Sports Models / Athletes'
  ],
  // Add detailed stunt-related subcategories per request
  'Stunts': [
    'Fight / Combat',
    'High-fall / Aerial',
    'Driving / Vehicle',
    'Precision / Specialty Stunts',
    'Wirework / Aerial Rigging'
  ],
  'Video Production': [
    'Directors / Producers',
    'Camera / Cinematography',
    'Editors / Post-production',
    'Motion Graphics / VFX'
  ],
  'Voice Over & Dubbing': [
    'Commercial VO',
    'Narration / Audiobooks',
    'Character Voices (animation/games)',
    'Dubbing / ADR'
  ]
};

async function ensureSubcategory(categoryName, subName) {
  const cat = await prisma.talentCategory.findUnique({ where: { name: categoryName } });
  if (!cat) {
    console.warn(`Category not found, skipping: ${categoryName}`);
    return;
  }

  const exists = await prisma.talentSubcategory.findFirst({ where: { categoryId: cat.id, name: subName } });
  if (exists) {
    console.log(`Subcategory exists: ${categoryName} -> ${subName}`);
    return;
  }

  await prisma.talentSubcategory.create({ data: { name: subName, categoryId: cat.id, description: `${subName} (seeded)` } });
  console.log(`Created subcategory: ${categoryName} -> ${subName}`);
}

async function main() {
  try {
    for (const [cat, subs] of Object.entries(SUBS)) {
      if (!subs || subs.length === 0) {
        console.log(`Skipping extra subcategories for ${cat}`);
        continue;
      }
      for (const s of subs) {
        await ensureSubcategory(cat, s);
      }
    }
    console.log('Subcategory creation complete.');
  } catch (err) {
    console.error('Error creating subcategories:', err);
    process.exitCode = 2;
  } finally {
    await prisma.$disconnect();
  }
}

main();
