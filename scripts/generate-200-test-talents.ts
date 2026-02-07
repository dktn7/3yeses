import { PrismaClient, Gender, Ethnicity, BodyType, Role } from '@prisma/client';
import * as bcryptjs from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

const firstNames = [
  'James', 'Emma', 'Oliver', 'Sophia', 'Noah', 'Ava', 'Liam', 'Isabella', 'Mason', 'Mia',
  'Ethan', 'Charlotte', 'Lucas', 'Amelia', 'Logan', 'Harper', 'Alexander', 'Evelyn', 'Michael', 'Abigail',
  'Daniel', 'Emily', 'Henry', 'Elizabeth', 'Jackson', 'Sofia', 'Sebastian', 'Avery', 'Aiden', 'Ella',
  'Matthew', 'Scarlett', 'Samuel', 'Grace', 'David', 'Chloe', 'Joseph', 'Victoria', 'Carter', 'Madison',
  'Owen', 'Lily', 'Wyatt', 'Aria', 'John', 'Eleanor', 'Jack', 'Hannah', 'Luke', 'Zoe'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'
];

const locations = [
  'London, UK', 'Manchester, UK', 'Birmingham, UK', 'Leeds, UK', 'Glasgow, UK',
  'Liverpool, UK', 'Newcastle, UK', 'Sheffield, UK', 'Bristol, UK', 'Edinburgh, UK',
  'Cardiff, UK', 'Belfast, UK', 'Nottingham, UK', 'Leicester, UK', 'Coventry, UK',
  'New York, USA', 'Los Angeles, USA', 'Chicago, USA', 'Houston, USA', 'Phoenix, USA',
  'Paris, France', 'Berlin, Germany', 'Madrid, Spain', 'Rome, Italy', 'Amsterdam, Netherlands'
];

const skills = [
  'Acting', 'Singing', 'Dancing', 'Voice Acting', 'Modeling', 'Comedy', 'Drama',
  'Theatre', 'Film', 'Television', 'Commercial', 'Music Video', 'Stunt Work',
  'Stage Combat', 'Improvisation', 'Stand-up', 'Character Acting', 'Method Acting',
  'Physical Theatre', 'Musical Theatre', 'Classical Acting', 'Contemporary Dance',
  'Hip Hop', 'Ballet', 'Jazz Dance', 'Tap Dance', 'Choreography', 'Acrobatics'
];

const bioTemplates = [
  'Passionate performer with {years} years of experience in {field}. Dedicated to bringing characters to life.',
  'Professional {field} artist specializing in {specialty}. Always seeking new creative challenges.',
  'Versatile talent with expertise in {field} and {specialty}. Available for projects worldwide.',
  'Award-winning {field} professional with a passion for storytelling and creative expression.',
  'Dynamic performer experienced in {field}, {specialty}, and collaborative projects.'
];

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomElements<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function generateBio(): string {
  const template = randomElement(bioTemplates);
  const years = Math.floor(Math.random() * 15) + 1;
  const field = randomElement(['Acting', 'Performing', 'Entertainment', 'Creative Arts']);
  const specialty = randomElement(['Film', 'Television', 'Theatre', 'Commercial Work']);
  
  return template
    .replace('{years}', years.toString())
    .replace('{field}', field)
    .replace('{specialty}', specialty);
}

async function copyProfileImage() {
  const sourcePath = 'C:\\Users\\dktk\\OneDrive\\Pictures\\IMG_5086.jpg';
  const targetDir = path.join(process.cwd(), 'public', 'uploads', 'profiles');
  const targetPath = path.join(targetDir, 'test-profile.jpg');
  
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, targetPath);
    console.log('✅ Profile image copied');
    return '/uploads/profiles/test-profile.jpg';
  } else {
    console.log('⚠️  Source image not found, using placeholder');
    return null;
  }
}

async function main() {
  console.log('Starting generation of 200 test talents...\n');
  
  // Copy profile image
  const profileImageUrl = await copyProfileImage();
  
  // Get categories for assignment
  const categories = await prisma.category.findMany({
    include: { subcategories: true }
  });
  
  if (categories.length === 0) {
    throw new Error('No categories found. Please run seed first.');
  }
  
  const hashedPassword = await bcryptjs.hash('Test123!', 10);
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 1; i <= 200; i++) {
    try {
      const firstName = randomElement(firstNames);
      const lastName = randomElement(lastNames);
      const name = `${firstName} ${lastName}`;
      const email = `talent${i}@test.com`;
      
      const category = randomElement(categories);
      const subcategory = category.subcategories.length > 0 
        ? randomElement(category.subcategories)
        : null;
      
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: Role.TALENT,
          emailVerified: new Date(),
          talentProfile: {
            create: {
              roleDescription: randomElement(['Actor', 'Model', 'Performer', 'Voice Artist', 'Dancer']),
              bio: generateBio(),
              location: randomElement(locations),
              experience: randomElement(['0-2', '2-5', '5-10', '10+']),
              rating: parseFloat((Math.random() * 2 + 3).toFixed(1)), // 3.0 - 5.0
              gender: randomElement([Gender.MALE, Gender.FEMALE, Gender.NON_BINARY]),
              ethnicity: randomElement([
                Ethnicity.ASIAN,
                Ethnicity.BLACK_AFRICAN,
                Ethnicity.HISPANIC_LATINO,
                Ethnicity.WHITE_CAUCASIAN,
                Ethnicity.MIXED_MULTIRACIAL,
                Ethnicity.OTHER
              ]),
              age: Math.floor(Math.random() * 40) + 18, // 18-58
              height: Math.floor(Math.random() * 40) + 150, // 150-190 cm
              bodyType: randomElement([
                BodyType.SLIM,
                BodyType.ATHLETIC,
                BodyType.AVERAGE,
                BodyType.MUSCULAR,
                BodyType.CURVY
              ]),
              avatarUrl: i <= 10 && profileImageUrl ? profileImageUrl : null,
              skills: randomElements(skills, Math.floor(Math.random() * 6) + 3),
              featuredSkills: randomElements(skills, 4),
              viewCount: Math.floor(Math.random() * 1000),
              likeCount: Math.floor(Math.random() * 100),
              profileComplete: true,
              categoryId: category.id,
              subcategoryId: subcategory?.id,
            }
          }
        }
      });
      
      successCount++;
      
      if (i % 10 === 0) {
        console.log(`✅ Created ${i} talents...`);
      }
      
    } catch (error) {
      errorCount++;
      console.error(`❌ Error creating talent ${i}:`, error instanceof Error ? error.message : String(error));
    }
  }
  
  console.log(`\n✅ Generation complete!`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Errors: ${errorCount}`);
  console.log(`\nTest credentials:`);
  console.log(`   Email: talent1@test.com to talent200@test.com`);
  console.log(`   Password: Test123!`);
  
  // Get first talent ID for testing
  const firstTalent = await prisma.user.findFirst({
    where: { email: 'talent1@test.com' },
    include: { talentProfile: true }
  });
  
  if (firstTalent?.talentProfile) {
    console.log(`\nFirst talent ID: ${firstTalent.talentProfile.id}`);
    console.log(`Test API: GET /api/talent/${firstTalent.talentProfile.id}`);
  }
}

main()
  .catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
