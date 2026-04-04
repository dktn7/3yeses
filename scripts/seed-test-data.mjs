import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { promisify } from 'util';
import { exec as _exec } from 'child_process';
const exec = promisify(_exec);

const prisma = new PrismaClient();

const LOCATIONS = ['London, UK', 'New York, USA', 'Los Angeles, USA', 'Paris, France', 'Berlin, Germany', 'Toronto, Canada', 'Sydney, Australia', 'Tokyo, Japan', 'Mumbai, India', 'São Paulo, Brazil'];
const FIRST_NAMES = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen'];
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
const SKILLS_POOL = ['Improvisation', 'Singing', 'Dancing', 'Voice Acting', 'Stunt Work', 'Piano', 'Guitar', 'Public Speaking', 'Modeling', 'Video Editing', 'Photography', 'Writing', 'Directing', 'Producing'];
const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Italian', 'Mandarin', 'Japanese', 'Arabic', 'Hindi', 'Portuguese'];
const ETHNICITIES = ['WHITE_CAUCASIAN', 'BLACK_AFRICAN', 'ASIAN', 'HISPANIC_LATINO', 'MIDDLE_EASTERN', 'MIXED_MULTIRACIAL', 'NATIVE_AMERICAN', 'PACIFIC_ISLANDER', 'OTHER'];
const BODY_TYPES = ['SLIM', 'ATHLETIC', 'CURVY', 'PLUS_SIZE', 'MUSCULAR', 'AVERAGE'];
const EYE_COLORS = ['Blue', 'Brown', 'Green', 'Hazel', 'Gray', 'Amber'];
const HAIR_COLORS = ['Black', 'Brown', 'Blonde', 'Red', 'Gray', 'White', 'Bald'];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomItems(arr, count) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function ensureUser(email, name, password, role = 'TALENT') {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return existing;
  const hash = await bcrypt.hash(password, 10);
  return prisma.user.create({ data: { email, name, password: hash, role, emailVerified: new Date() } });
}

async function main() {
  console.log('Seeding test data...');

  const TOTAL_PROFILES = parseInt(process.env.TOTAL_PROFILES || '150', 10);

  // create admin and test accounts
  const admin = await ensureUser(process.env.TEST_ADMIN_EMAIL || 'admin@example.com', process.env.TEST_ADMIN_NAME || 'Admin', process.env.TEST_ADMIN_PASSWORD || 'adminpass', 'ADMIN');
  const tester = await ensureUser(process.env.TEST_USER_EMAIL || 'tester@example.com', process.env.TEST_USER_NAME || 'Test User', process.env.TEST_USER_PASSWORD || 'testpass', 'TALENT');

  // create a basic talent profile for tester if not exists
  const existingTesterProfile = await prisma.talentProfile.findUnique({ where: { userId: tester.id } });
  if (!existingTesterProfile) {
    await prisma.talentProfile.create({
      data: {
        userId: tester.id,
        performerTitle: 'Tester',
        bio: 'Automated test account',
        location: 'Test City',
        experienceLevel: '1 year',
        viewCount: 0,
        likeCount: 0,
        profileComplete: true,
        age: 30,
        gender: 'PREFER_NOT_TO_SAY',
      }
    });
  }

  const categories = await prisma.talentCategory.findMany({ include: { subcategories: true } });
  if (categories.length === 0) {
    console.error('No categories found. Run existing seed for categories first.');
    process.exit(1);
  }

  console.log(`Found ${categories.length} categories — creating ${TOTAL_PROFILES} profiles total`);

  const passwordHash = await bcrypt.hash(process.env.DEFAULT_PROFILE_PASSWORD || 'password123', 10);

  // distribute TOTAL_PROFILES across categories as evenly as possible
  const perCategoryBase = Math.floor(TOTAL_PROFILES / categories.length);
  let remainder = TOTAL_PROFILES % categories.length;

  for (const category of categories) {
    const count = perCategoryBase + (remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder--;
    for (let i = 0; i < count; i++) {
      const firstName = getRandomItem(FIRST_NAMES);
      const lastName = getRandomItem(LAST_NAMES);
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${category.id.slice(0,6)}.${i+1}@example.com`;

      const user = await prisma.user.create({
        data: {
          name: `${firstName} ${lastName}`,
          email,
          password: passwordHash,
          role: 'TALENT',
          emailVerified: new Date(),
        }
      });

      const subcategory = category.subcategories.length > 0 ? getRandomItem(category.subcategories) : null;
      const location = getRandomItem(LOCATIONS);

      // create unique media items per profile
      const portfolioItems = [];
      // images: mix of LoremFlickr, Picsum and Unsplash source URLs using unique lock/sig
      const img1 = `https://loremflickr.com/800/600/${encodeURIComponent(category.name)}?lock=${user.id}-1`;
      const img2 = `https://picsum.photos/seed/${user.id}-2/800/600`;
      const img3 = `https://source.unsplash.com/800x600/?${encodeURIComponent(category.name)}&sig=${user.id}-3`;
      portfolioItems.push({ title: 'Image 1', mediaUrl: img1, type: 'IMAGE' });
      portfolioItems.push({ title: 'Image 2', mediaUrl: img2, type: 'IMAGE' });
      portfolioItems.push({ title: 'Image 3', mediaUrl: img3, type: 'IMAGE' });

      // video: choose from a rotating list and append a unique query to avoid duplicates
      const videos = [
        'https://www.youtube.com/watch?v=Jz6M4tqjKVI',
        'https://www.youtube.com/watch?v=XbGs_qK2PQA',
        'https://www.youtube.com/watch?v=3yX_7jG8X0I',
        'https://www.youtube.com/watch?v=lY2H2ZP56K4',
        'https://www.youtube.com/watch?v=Vw7UHK5KoGU'
      ];
      const videoUrl = videos[(i + category.id.charCodeAt(0)) % videos.length] + `&unique=${user.id}`;
      portfolioItems.push({ title: 'Featured Video', mediaUrl: videoUrl, type: 'VIDEO' });

      // audio: sample SoundHelix tracks with unique query
      const audios = [
        'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'
      ];
      const audioUrl = audios[(i + category.id.length) % audios.length];
      portfolioItems.push({ title: 'Audio Demo', mediaUrl: audioUrl, type: 'AUDIO' });

      // create profile with related records
      await prisma.talentProfile.create({
        data: {
          userId: user.id,
          categoryId: category.id,
          subcategoryId: subcategory?.id,
          performerTitle: subcategory ? subcategory.name : category.name,
          bio: `Automated profile for ${firstName} ${lastName} in ${location}`,
          location,
          experienceLevel: `${getRandomInt(1, 10)} years`,
          viewCount: getRandomInt(0, 1000),
          likeCount: getRandomInt(0, 200),
          isBeginner: Math.random() > 0.8,
          profileComplete: true,
          age: getRandomInt(18, 60),
          dateOfBirth: new Date(new Date().setFullYear(new Date().getFullYear() - getRandomInt(18, 60))),
          gender: 'PREFER_NOT_TO_SAY',
          ethnicity: getRandomItem(ETHNICITIES),
          height: getRandomInt(150, 200),
          bodyType: getRandomItem(BODY_TYPES),
          eyeColor: getRandomItem(EYE_COLORS),
          hairColor: getRandomItem(HAIR_COLORS),
          skills: getRandomItems(SKILLS_POOL, getRandomInt(2, 6)),

          languages: {
            create: getRandomItems(LANGUAGES, getRandomInt(1,3)).map(lang => ({ name: lang, proficiency: 'FLUENT' }))
          },

          workHistory: {
            create: [
              { title: 'Role', company: 'Studio', startDate: new Date('2021-01-01'), isCurrent: true }
            ]
          },

          portfolio: {
            create: [
              { title: 'Image 1', mediaUrl: `https://loremflickr.com/800/600/${category.name}?lock=${i}1`, type: 'IMAGE' },
              { title: 'Image 2', mediaUrl: `https://loremflickr.com/800/600/${category.name}?lock=${i}2`, type: 'IMAGE' },
              { title: 'Video', mediaUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', type: 'VIDEO' }
            ]
          }
        }
      });

      if ((i + 1) % 25 === 0) process.stdout.write('.');
    }
    process.stdout.write(`\nCategory ${category.name} complete\n`);
  }

  console.log('\nSeeding complete.');

  // Attempt to create a DB backup of test data
  const pgDumpPath = process.env.PG_DUMP_PATH || 'C:\\Program Files\\PostgreSQL\\18\\bin\\pg_dump.exe';
  const dbName = process.env.PGDATABASE || process.env.DB_NAME || 'talentdb';
  const dbUser = process.env.PGUSER || process.env.DB_USER || 'user';
  const dbHost = process.env.PGHOST || 'localhost';
  const dbPort = process.env.PGPORT || '5432';
  const dbPassword = process.env.PGPASSWORD || process.env.DB_PASSWORD || '';

  if (!dbPassword) {
    console.warn('DB password not provided in environment; skipping automatic pg_dump. To generate a backup, run pg_dump locally.');
    return;
  }

  const outFile = process.env.TEST_DATA_BACKUP_FILE || 'test_data_backup.dump';
  const cmd = `"${pgDumpPath}" -h ${dbHost} -p ${dbPort} -U ${dbUser} -F c -f ${outFile} ${dbName}`;

  try {
    console.log(`Creating DB backup to ${outFile}...`);
    await exec(cmd, { env: { ...process.env, PGPASSWORD: dbPassword } });
    console.log('Backup created:', outFile);
  } catch (e) {
    console.error('Failed to run pg_dump automatically. You can create the backup manually with:');
    console.error(cmd);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
