
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

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

const MEDIA_MAPPING = {
  'Voice Over & Dubbing': {
    images: ['microphone', 'recording studio', 'headphones', 'audio equipment'],
    videos: [
      'https://www.youtube.com/watch?v=Jz6M4tqjKVI', // Voice over demo
      'https://www.youtube.com/watch?v=XbGs_qK2PQA', // Studio session
    ],
    audio: [
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
    ]
  },
  'Translation & Localization': {
    images: ['books', 'dictionary', 'writing', 'library'],
    videos: [
      'https://www.youtube.com/watch?v=1xx652D4h40', // Language related
      'https://www.youtube.com/watch?v=UkZt7tZl2AE', // Translation
    ],
    audio: []
  },
  'Content Creation': {
    images: ['laptop', 'workspace', 'writing', 'camera'],
    videos: [
      'https://www.youtube.com/watch?v=9bZkp7q19f0', // Gangnam Style (Viral content placeholder)
      'https://www.youtube.com/watch?v=jNQXAC9IVRw', // Me at the zoo
    ],
    audio: []
  },
  'Music & Audio': {
    images: ['guitar', 'piano', 'concert', 'singer', 'drums', 'music studio'],
    videos: [
      'https://www.youtube.com/watch?v=5qap5aO4i9A', // Lofi Girl
      'https://www.youtube.com/watch?v=jfKfPfyJRdk', // Lofi Girl
      'https://www.youtube.com/watch?v=Start0gM92Y', // Classical
    ],
    audio: [
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3'
    ]
  },
  'Video Production': {
    images: ['film camera', 'video editing', 'film set', 'clapperboard'],
    videos: [
      'https://www.youtube.com/watch?v=LXb3EKWsInQ', // 4K Nature
      'https://www.youtube.com/watch?v=ysz5S6P_z-U', // 4K Nature
    ],
    audio: []
  },
  'Acting & Performance': {
    images: ['theater stage', 'drama mask', 'actor portrait', 'spotlight'],
    videos: [
      'https://www.youtube.com/watch?v=3yX_7jG8X0I', // Monologue
      'https://www.youtube.com/watch?v=lY2H2ZP56K4', // Acting reel
    ],
    audio: [
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' // Voice reel
    ]
  },
  'Modeling': {
    images: ['fashion model', 'portrait', 'photoshoot', 'runway'],
    videos: [
      'https://www.youtube.com/watch?v=Vw7UHK5KoGU', // Fashion
      'https://www.youtube.com/watch?v=C0DPdy98e4c', // Fashion
    ],
    audio: []
  },
  'Dancing & Choreography': {
    images: ['ballet dancer', 'hip hop dance', 'contemporary dance', 'dance studio'],
    videos: [
      'https://www.youtube.com/watch?v=jDRTghGZ7XU', // Dance
      'https://www.youtube.com/watch?v=4m1EFMoRFvY', // Beyonce
    ],
    audio: []
  }
};

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

async function main() {
  console.log('🚀 Starting generation of 200 profiles...');

  // 1. Clean up existing talents (but keep Admin if possible, though this deletes all users with TALENT role)
  console.log('🧹 Cleaning up existing talent profiles...');
  await prisma.workHistory.deleteMany();
  await prisma.portfolioItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.talentProfile.deleteMany();
  // Delete users who are NOT admins
  await prisma.user.deleteMany({
    where: {
      role: 'TALENT'
    }
  });
  console.log('✅ Cleanup complete.');

  // 2. Fetch Categories
  const categories = await prisma.talentCategory.findMany({
    include: { subcategories: true }
  });

  if (categories.length === 0) {
    console.error('❌ No categories found. Please run seed.ts first.');
    return;
  }

  const passwordHash = await bcrypt.hash('password123', 10);
  const profilesToCreate = 200;
  
  console.log(`✨ Generating ${profilesToCreate} profiles...`);

  for (let i = 0; i < profilesToCreate; i++) {
    const firstName = getRandomItem(FIRST_NAMES);
    const lastName = getRandomItem(LAST_NAMES);
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i + 1}@example.com`;
    
    const category = getRandomItem(categories);
    const subcategory = category.subcategories.length > 0 ? getRandomItem(category.subcategories) : null;
    
    const gender = Math.random() > 0.5 ? 'MALE' : 'FEMALE';
    const location = getRandomItem(LOCATIONS);
    
    // Get media based on category
    const categoryMedia = MEDIA_MAPPING[category.name] || {
      images: ['abstract', 'art', 'creative'],
      videos: ['https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
      audio: []
    };
    
    const videoUrl = getRandomItem(categoryMedia.videos);
    const imageKeywords = categoryMedia.images;
    
    // Prepare Portfolio Items
    const portfolioItems = [];
    
    // 1. Add Images
    for (let j = 1; j <= 3; j++) {
      portfolioItems.push({
        title: `Portfolio Image ${j}`,
        mediaUrl: `https://loremflickr.com/800/600/${getRandomItem(imageKeywords)}?lock=${i}${j}`,
        type: 'IMAGE',
        thumbnail: `https://loremflickr.com/800/600/${getRandomItem(imageKeywords)}?lock=${i}${j}`,
        description: 'A highlight from my recent work.'
      });
    }
    
    // 2. Add Video (as portfolio item too)
    portfolioItems.push({
      title: 'Featured Video',
      mediaUrl: videoUrl,
      type: 'VIDEO',
      thumbnail: `https://img.youtube.com/vi/${videoUrl.split('v=')[1]}/0.jpg`,
      description: 'My featured performance/reel.'
    });
    
    // 3. Add Audio (if available for category)
    if (categoryMedia.audio && categoryMedia.audio.length > 0) {
      const audioUrl = getRandomItem(categoryMedia.audio);
      portfolioItems.push({
        title: 'Audio Demo',
        mediaUrl: audioUrl,
        type: 'AUDIO',
        description: 'Listen to my demo reel.'
      });
    }

    // Create User
    const user = await prisma.user.create({
      data: {
        name: `${firstName} ${lastName}`,
        email: email,
        password: passwordHash,
        role: 'TALENT',
        emailVerified: new Date(),
      }
    });

    // Create Talent Profile
    await prisma.talentProfile.create({
      data: {
        userId: user.id,
        categoryId: category.id,
        subcategoryId: subcategory?.id,
        performerTitle: subcategory ? subcategory.name : category.name,
        bio: `I am a passionate ${subcategory ? subcategory.name : category.name} based in ${location}. I have been working in the industry for several years and I am always looking for new challenges.`,
        location: location,
        experienceLevel: `${getRandomInt(1, 20)} years`, // String format as per schema
        // rating removed per platform decision
        viewCount: getRandomInt(10, 5000),
        likeCount: getRandomInt(0, 500),
        isBeginner: Math.random() > 0.8,
        profileComplete: true,
        
        // Personal Details
        age: getRandomInt(18, 60),
        dateOfBirth: new Date(new Date().setFullYear(new Date().getFullYear() - getRandomInt(18, 60))),
        gender: gender,
        ethnicity: getRandomItem(ETHNICITIES),
        height: getRandomInt(150, 200),
        bodyType: getRandomItem(BODY_TYPES),
        eyeColor: getRandomItem(EYE_COLORS),
        hairColor: getRandomItem(HAIR_COLORS),
        
        // Skills & Languages
        skills: getRandomItems(SKILLS_POOL, getRandomInt(3, 8)),
        
        // Media
        avatarUrl: `https://i.pravatar.cc/400?u=${user.id}`,
        videoUrl: videoUrl,
        portfolioImages: portfolioItems.filter(p => p.type === 'IMAGE').map(p => p.mediaUrl),
        videoUrls: [videoUrl],
        
        // Create related records
        languages: {
          create: getRandomItems(LANGUAGES, getRandomInt(1, 3)).map(lang => ({
            name: lang,
            proficiency: 'FLUENT'
          }))
        },
        
        workHistory: {
          create: [
            {
              title: 'Senior Role',
              company: 'Big Production Co',
              startDate: new Date('2020-01-01'),
              isCurrent: true,
              description: 'Leading major projects.'
            },
            {
              title: 'Junior Role',
              company: 'StartUp Studio',
              startDate: new Date('2018-01-01'),
              endDate: new Date('2019-12-31'),
              isCurrent: false,
              description: 'Learned the ropes.'
            }
          ]
        },
        
        // Create Portfolio Items
        portfolio: {
          create: portfolioItems
        }
      }
    });
    
    if (i % 20 === 0) {
      process.stdout.write('.');
    }
  }

  console.log('\n✅ Successfully generated 200 profiles!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
