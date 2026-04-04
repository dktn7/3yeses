import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
// Use numeric TN ids (e.g. TN23, TN237)
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '..', '.env') });

const prisma = new PrismaClient();

const TOTAL_TALENTS = parseInt(process.env.TOTAL_TALENTS || '150', 10);
const DEFAULT_PASSWORD = process.env.SEED_DEFAULT_PASSWORD || 'ChangeMe!234';

// IDs will be random TN-prefixed values (e.g. TN3A9F2B1)

// Minimal realistic pools (kept small to avoid huge file)
const LOCATIONS = ['London, UK','Manchester, UK','New York, USA','Los Angeles, USA','Toronto, Canada','Sydney, Australia','Paris, France','Berlin, Germany'];
const FIRST_NAMES_MALE = ['James','Oliver','Liam','Noah','Ethan','Lucas','Mason','Logan','Max','Hugo'];
const FIRST_NAMES_FEMALE = ['Olivia','Amelia','Isla','Ava','Mia','Sophia','Zoe','Ella','Grace','Chloe'];
const LAST_NAMES = ['Smith','Johnson','Brown','Taylor','Wilson','Martin','Lee','Walker','Robinson','Clark'];

const LANGUAGES_POOL = [
  { name: 'English', proficiency: 'NATIVE' },
  { name: 'Spanish', proficiency: 'FLUENT' },
  { name: 'French', proficiency: 'FLUENT' },
  { name: 'Portuguese', proficiency: 'BASIC' },
  { name: 'German', proficiency: 'BASIC' }
];

const BODY_TYPES = ['SLIM','ATHLETIC','AVERAGE','CURVY','MUSCULAR'];
const EXPERIENCE_LEVELS = ['Beginner (0-2 years)','Intermediate (3-5 years)','Advanced (6-10 years)','Expert (10+ years)'];

// Preferred distribution (will only apply to categories that exist)
const PREFERRED_DISTRIBUTION = {
  'Music & Audio': 0.30,
  'Acting & Performance': 0.20,
  'Video Production': 0.15,
  'Voice Over & Dubbing': 0.10,
  'Modeling & Fashion': 0.08,
  'Stunts & Action': 0.05,
  'Sports & Fitness': 0.05,
  'Comedy': 0.03,
  'Other': 0.04
};

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Simple string hash for deterministic seeding
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32-bit integer
  }
  return hash;
}

function generateTNId() {
  // 2-4 digit random number (10..9999)
  const num = getRandomInt(10, 9999);
  return `TN${num}`;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function uniqEmail(base, i) {
  // deterministic-ish unique email for idempotency
  return `seed+${base.replace(/[^a-z0-9]/gi,'').toLowerCase()}+${i}@example.com`;
}

async function main() {
  console.log(`\n✨ Non-destructive generator starting — will create up to ${TOTAL_TALENTS} talents (idempotent/upsert).`);

  const categories = await prisma.talentCategory.findMany({ include: { subcategories: true } });
  if (!categories || categories.length === 0) {
    console.error('❌ No categories found. Run `scripts/ensure-categories.mjs` first.');
    process.exit(1);
  }

  // Map categories by name for distribution
  const categoryMap = new Map(categories.map(c => [c.name, c]));

  // Build target counts per category using only existing categories
  const existingNames = Array.from(categoryMap.keys());
  const weights = existingNames.map(name => PREFERRED_DISTRIBUTION[name] || 0);
  const totalWeight = weights.reduce((a,b) => a+b, 0) || 1;

  const targetCounts = {};
  existingNames.forEach((name, idx) => {
    const w = (PREFERRED_DISTRIBUTION[name] || 0);
    // scale so sum is TOTAL_TALENTS, but allow small rounding
    targetCounts[name] = Math.max(1, Math.round((w / totalWeight) * TOTAL_TALENTS));
  });

  // If rounding produced fewer/more than TOTAL_TALENTS, fix by adjusting 'Other' or first category
  let sum = Object.values(targetCounts).reduce((a,b) => a+b, 0);
  if (sum !== TOTAL_TALENTS) {
    const diff = TOTAL_TALENTS - sum;
    const key = existingNames[0];
    targetCounts[key] = Math.max(1, targetCounts[key] + diff);
  }

  console.log('Category distribution preview:');
  for (const name of existingNames) console.log(` - ${name}: ${targetCounts[name]}`);

  let created = 0;
  for (const [categoryName, count] of Object.entries(targetCounts)) {
    const category = categoryMap.get(categoryName);
    if (!category) continue;

    // choose subcategories list (if none, allow null)
    const subs = category.subcategories && category.subcategories.length > 0 ? category.subcategories : [null];

    for (let i = 0; i < count; i++) {
      const idx = created + i;
      const gender = Math.random() < 0.5 ? 'MALE' : 'FEMALE';
      const first = gender === 'MALE' ? pick(FIRST_NAMES_MALE) : pick(FIRST_NAMES_FEMALE);
      const last = pick(LAST_NAMES);
      const fullName = `${first} ${last}`;
      const email = uniqEmail(fullName, idx);
      const passwordHash = bcrypt.hashSync(DEFAULT_PASSWORD, 10);
      const location = pick(LOCATIONS);
      const years = getRandomInt(0, 12);
      const experienceLevel = pick(EXPERIENCE_LEVELS);
      const bio = `${fullName} is a ${experienceLevel} ${categoryName} professional based in ${location}. Available for bookings. `;

      try {
        // Upsert user (idempotent) — supply random numeric TN id on create
        let newUserId = generateTNId();
        // avoid collisions
        while (await prisma.user.findUnique({ where: { id: newUserId } })) {
          newUserId = generateTNId();
        }
        const user = await prisma.user.upsert({
          where: { email },
          update: { name: fullName, password: passwordHash, role: 'TALENT', emailVerified: new Date() },
          create: { id: newUserId, name: fullName, email, password: passwordHash, role: 'TALENT', emailVerified: new Date() }
        });

        // pick a subcategory for this user
        const sub = pick(subs);

        // Upsert talent profile
        await prisma.talentProfile.upsert({
          where: { userId: user.id },
          update: {
            performerTitle: sub?.name || category.name,
            bio,
            location,
            experienceLevel,
            categoryId: category.id,
            subcategoryId: sub?.id || null,
            isBeginner: experienceLevel.startsWith('Beginner')
          },
          create: {
            userId: user.id,
            performerTitle: sub?.name || category.name,
            bio,
            location,
            experienceLevel,
            categoryId: category.id,
            subcategoryId: sub?.id || null,
            isBeginner: experienceLevel.startsWith('Beginner')
          }
        });

        // Replace languages for idempotency
        await prisma.language.deleteMany({ where: { talentProfileId: user.id } });
        const langsToCreate = [];
        // always include English native/fluent
        langsToCreate.push({ name: 'English', proficiency: 'NATIVE', talentProfileId: user.id });
        if (Math.random() < 0.4) langsToCreate.push({ name: pick(['Spanish','French','German']), proficiency: 'FLUENT', talentProfileId: user.id });
        for (const l of langsToCreate) await prisma.language.create({ data: l });

        // Minimal portfolio: 1 image, optionally 1 video/audio if category supports it
        const portfolioCount = 1 + (Math.random() < 0.25 ? 1 : 0);
        // remove existing portfolio items to avoid duplicates
        await prisma.portfolioItem.deleteMany({ where: { talentProfileId: user.id } });

        // Sample YouTube video IDs for VIDEO type items
        const sampleYouTubeIds = [
          'dQw4w9WgXcQ', 'jNQXAC9IVRw', '9bZkp7q19f0', 'kJQP7kiw5Fk',
          'JGwWNGJdvx8', 'RgKAFK5djSk', 'OPf0YbXqDm0', 'fJ9rUzIMcZQ',
          '60ItHLz5WEA', 'YQHsXMglC9A', 'hT_nvWreIhg', 'CevxZvSJLk8',
          'pRpeEdMmmQ0', 'lp-EO5I60KA', 'e-ORhEE9VVg'
        ];

        for (let p = 0; p < portfolioCount; p++) {
          const type = Math.random() < 0.7 ? 'IMAGE' : 'VIDEO';
          // Use a unique numeric seed based on the user ID and portfolio index
          const numericSeed = Math.abs(hashCode(`${user.id}-${p}`));
          let url, thumbnail;

          if (type === 'IMAGE') {
            // Use picsum.photos for real, high-quality images
            url = `https://picsum.photos/seed/${user.id}-${p}/800/600`;
            thumbnail = `https://picsum.photos/seed/${user.id}-${p}/400/300`;
          } else {
            // Use real YouTube embed URLs for video items
            const ytId = sampleYouTubeIds[numericSeed % sampleYouTubeIds.length];
            url = `https://www.youtube.com/embed/${ytId}`;
            thumbnail = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
          }

          await prisma.portfolioItem.create({
            data: {
              title: `${categoryName} sample ${p+1}`,
              url,
              type,
              thumbnail,
              description: `${fullName} ${type.toLowerCase()} sample for ${categoryName}`,
              talentProfileId: user.id
            }
          });
        }

        // Minimal work history
        await prisma.workHistory.deleteMany({ where: { talentProfileId: user.id } });
        if (years > 0) {
          await prisma.workHistory.create({
            data: {
              title: `${sub?.name || category.name} Performer`,
              company: 'Freelance',
              startDate: new Date(new Date().getFullYear() - Math.min(years,5), 0, 1),
              endDate: null,
              isCurrent: true,
              description: `Worked across several projects in ${categoryName}`,
              talentProfileId: user.id
            }
          });
        }

        // Ensure profile settings exist
        await prisma.profileSettings.upsert({
          where: { talentProfileId: user.id },
          update: {},
          create: { talentProfileId: user.id }
        });

        // Increment subcategory counter if we assigned one
        if (sub) {
          try {
            await prisma.talentSubcategory.update({ where: { id: sub.id }, data: { talentCount: { increment: 1 } } });
          } catch (e) { /* non-fatal */ }
        }

        created++;
        process.stdout.write(`\r   Progress: ${created}/${TOTAL_TALENTS}`);
      } catch (err) {
        console.error('\nError seeding profile', email, err.message || err);
      }
    }
    // small delay to reduce DB spike
    await new Promise(res => setTimeout(res, 50));
  }

  console.log('\n\n✅ Generation complete.');
  const totalUsers = await prisma.user.count();
  const totalProfiles = await prisma.talentProfile.count();
  console.log(`Total Users: ${totalUsers}, Total TalentProfiles: ${totalProfiles}`);

  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  prisma.$disconnect();
  process.exit(1);
});
