
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const LOCATIONS = ['London, UK', 'New York, USA', 'Los Angeles, USA', 'Paris, France', 'Berlin, Germany', 'Toronto, Canada', 'Sydney, Australia', 'Tokyo, Japan', 'Mumbai, India', 'São Paulo, Brazil', 'Chicago, USA', 'Miami, USA', 'Madrid, Spain', 'Rome, Italy', 'Seoul, South Korea'];
const FIRST_NAMES = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa', 'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra'];
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'];
const SKILLS_POOL = ['Improvisation', 'Singing', 'Dancing', 'Voice Acting', 'Stunt Work', 'Piano', 'Guitar', 'Public Speaking', 'Modeling', 'Video Editing', 'Photography', 'Writing', 'Directing', 'Producing', 'Makeup', 'Styling', 'Coaching', 'Teaching', 'Design', 'Coding'];
const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Italian', 'Mandarin', 'Japanese', 'Arabic', 'Hindi', 'Portuguese', 'Russian', 'Korean', 'Dutch', 'Turkish', 'Vietnamese'];
const ETHNICITIES = ['WHITE_CAUCASIAN', 'BLACK_AFRICAN', 'ASIAN', 'HISPANIC_LATINO', 'MIDDLE_EASTERN', 'MIXED_MULTIRACIAL', 'NATIVE_AMERICAN', 'PACIFIC_ISLANDER', 'OTHER'];
const BODY_TYPES = ['SLIM', 'ATHLETIC', 'CURVY', 'PLUS_SIZE', 'MUSCULAR', 'AVERAGE'];
const EYE_COLORS = ['Blue', 'Brown', 'Green', 'Hazel', 'Gray', 'Amber'];
const HAIR_COLORS = ['Black', 'Brown', 'Blonde', 'Red', 'Gray', 'White', 'Bald', 'Dyed'];

// Extended Media Mapping for all categories
const MEDIA_MAPPING = {
  'Voice Over & Dubbing': {
    images: ['microphone', 'recording studio', 'headphones', 'audio equipment'],
    videos: ['https://www.youtube.com/watch?v=Jz6M4tqjKVI', 'https://www.youtube.com/watch?v=XbGs_qK2PQA'],
    audio: ['https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3']
  },
  'Translation & Localization': {
    images: ['books', 'dictionary', 'writing', 'library', 'translator'],
    videos: ['https://www.youtube.com/watch?v=1xx652D4h40', 'https://www.youtube.com/watch?v=UkZt7tZl2AE'],
    audio: []
  },
  'Content Creation': {
    images: ['laptop', 'workspace', 'writing', 'camera', 'blogging'],
    videos: ['https://www.youtube.com/watch?v=9bZkp7q19f0', 'https://www.youtube.com/watch?v=jNQXAC9IVRw'],
    audio: []
  },
  'Music & Audio': {
    images: ['guitar', 'piano', 'concert', 'singer', 'drums', 'music studio', 'dj'],
    videos: ['https://www.youtube.com/watch?v=5qap5aO4i9A', 'https://www.youtube.com/watch?v=jfKfPfyJRdk', 'https://www.youtube.com/watch?v=Start0gM92Y'],
    audio: ['https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3']
  },
  'Video Production': {
    images: ['film camera', 'video editing', 'film set', 'clapperboard', 'director'],
    videos: ['https://www.youtube.com/watch?v=LXb3EKWsInQ', 'https://www.youtube.com/watch?v=ysz5S6P_z-U'],
    audio: []
  },
  'Acting & Performance': {
    images: ['theater stage', 'drama mask', 'actor portrait', 'spotlight', 'film set'],
    videos: ['https://www.youtube.com/watch?v=3yX_7jG8X0I', 'https://www.youtube.com/watch?v=lY2H2ZP56K4'],
    audio: ['https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3']
  },
  'Modeling': {
    images: ['fashion model', 'portrait', 'photoshoot', 'runway', 'fashion'],
    videos: ['https://www.youtube.com/watch?v=Vw7UHK5KoGU', 'https://www.youtube.com/watch?v=C0DPdy98e4c'],
    audio: []
  },
  'Dancing & Choreography': {
    images: ['ballet dancer', 'hip hop dance', 'contemporary dance', 'dance studio', 'dancer'],
    videos: ['https://www.youtube.com/watch?v=jDRTghGZ7XU', 'https://www.youtube.com/watch?v=4m1EFMoRFvY'],
    audio: []
  },
  'Beauty & Wellness': {
    images: ['makeup', 'spa', 'yoga', 'fitness', 'salon'],
    videos: ['https://www.youtube.com/watch?v=3tmd-ClpJxA', 'https://www.youtube.com/watch?v=v7AYKMP6rOE'],
    audio: []
  },
  'Sports & Fitness': {
    images: ['gym', 'athlete', 'running', 'sports', 'training'],
    videos: ['https://www.youtube.com/watch?v=v7AYKMP6rOE', 'https://www.youtube.com/watch?v=3tmd-ClpJxA'],
    audio: []
  },
  'Stunts': {
    images: ['stunt', 'action', 'parkour', 'martial arts'],
    videos: ['https://www.youtube.com/watch?v=2S83pXlDqC8', 'https://www.youtube.com/watch?v=1Zgtdb5f9hE'],
    audio: []
  },
  'Magic & Illusion': {
    images: ['magician', 'cards', 'illusion', 'magic show'],
    videos: ['https://www.youtube.com/watch?v=jM27fujbiog', 'https://www.youtube.com/watch?v=1Zgtdb5f9hE'],
    audio: []
  },
  'Circus Arts': {
    images: ['circus', 'acrobat', 'juggler', 'aerial silk'],
    videos: ['https://www.youtube.com/watch?v=1Zgtdb5f9hE', 'https://www.youtube.com/watch?v=jM27fujbiog'],
    audio: []
  },
  'Comedy': {
    images: ['microphone', 'comedy club', 'stand up', 'laughing'],
    videos: ['https://www.youtube.com/watch?v=3yX_7jG8X0I', 'https://www.youtube.com/watch?v=lY2H2ZP56K4'],
    audio: ['https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3']
  },
  'Photography (Commercial)': {
    images: ['camera', 'photographer', 'studio', 'lens'],
    videos: ['https://www.youtube.com/watch?v=LXb3EKWsInQ', 'https://www.youtube.com/watch?v=ysz5S6P_z-U'],
    audio: []
  },
  'Graphic Design': {
    images: ['design', 'computer', 'art', 'sketch'],
    videos: ['https://www.youtube.com/watch?v=LXb3EKWsInQ', 'https://www.youtube.com/watch?v=ysz5S6P_z-U'],
    audio: []
  },
  'Music Production': {
    images: ['mixing console', 'studio', 'producer', 'audio'],
    videos: ['https://www.youtube.com/watch?v=5qap5aO4i9A', 'https://www.youtube.com/watch?v=jfKfPfyJRdk'],
    audio: ['https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3']
  },
  'Influencer/Content Creator': {
    images: ['selfie', 'phone', 'social media', 'vlog'],
    videos: ['https://www.youtube.com/watch?v=9bZkp7q19f0', 'https://www.youtube.com/watch?v=jNQXAC9IVRw'],
    audio: []
  },
  'Hair & Makeup (Professional)': {
    images: ['makeup artist', 'hair salon', 'beauty', 'cosmetics'],
    videos: ['https://www.youtube.com/watch?v=3tmd-ClpJxA', 'https://www.youtube.com/watch?v=v7AYKMP6rOE'],
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
  console.log('🚀 Starting generation of 500 additional profiles...');

  // 1. Fetch all categories and subcategories
  const categories = await prisma.talentCategory.findMany({
    include: { 
      subcategories: {
        include: {
          _count: {
            select: { talentProfiles: true }
          }
        }
      } 
    }
  });

  if (categories.length === 0) {
    console.error('❌ No categories found.');
    return;
  }

  // 2. Identify empty subcategories
  let emptySubcategories = [];
  categories.forEach(cat => {
    cat.subcategories.forEach(sub => {
      if (sub._count.talentProfiles === 0) {
        emptySubcategories.push({
          ...sub,
          categoryName: cat.name,
          categoryId: cat.id
        });
      }
    });
  });

  console.log(`Found ${emptySubcategories.length} empty subcategories.`);
  
  // If no empty subcategories, use all subcategories
  let targetSubcategories = emptySubcategories.length > 0 ? emptySubcategories : [];
  if (targetSubcategories.length === 0) {
    console.log('No empty subcategories found. Distributing across all subcategories.');
    categories.forEach(cat => {
      cat.subcategories.forEach(sub => {
        targetSubcategories.push({
          ...sub,
          categoryName: cat.name,
          categoryId: cat.id
        });
      });
    });
  }

  const passwordHash = await bcrypt.hash('password123', 10);
  const profilesToCreate = 500;
  
  console.log(`✨ Generating ${profilesToCreate} profiles distributed across ${targetSubcategories.length} subcategories...`);

  for (let i = 0; i < profilesToCreate; i++) {
    const firstName = getRandomItem(FIRST_NAMES);
    const lastName = getRandomItem(LAST_NAMES);
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Date.now()}${i}@example.com`;
    
    // Round robin distribution or random
    const targetSub = targetSubcategories[i % targetSubcategories.length];
    
    const gender = Math.random() > 0.5 ? 'MALE' : 'FEMALE';
    const location = getRandomItem(LOCATIONS);
    
    // Get media based on category
    const categoryMedia = MEDIA_MAPPING[targetSub.categoryName] || {
      images: ['abstract', 'art', 'creative'],
      videos: ['https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
      audio: []
    };
    
    const videoUrl = getRandomItem(categoryMedia.videos);
    const imageKeywords = categoryMedia.images;
    
    // Prepare Portfolio Items
    const portfolioItems = [];
    
    // 1. Add Images (2-4 images)
    const numImages = getRandomInt(2, 4);
    for (let j = 1; j <= numImages; j++) {
      portfolioItems.push({
        title: `Portfolio Image ${j}`,
        mediaUrl: `https://picsum.photos/seed/${i}${j}/800/600`,
        type: 'IMAGE',
        thumbnail: `https://picsum.photos/seed/${i}${j}/800/600`,
        description: 'A highlight from my recent work.'
      });
    }
    
    // 2. Add Video (if category has videos)
    if (categoryMedia.videos.length > 0) {
      portfolioItems.push({
        title: 'Featured Video',
        mediaUrl: videoUrl,
        type: 'VIDEO',
        thumbnail: `https://img.youtube.com/vi/${videoUrl.split('v=')[1]}/0.jpg`,
        description: 'My featured performance/reel.'
      });
    }
    
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
        categoryId: targetSub.categoryId,
        subcategoryId: targetSub.id,
        performerTitle: targetSub.name,
        bio: `I am a passionate ${targetSub.name} professional based in ${location}. I specialize in ${targetSub.categoryName} and have been working in the industry for several years.`,
        location: location,
        experienceLevel: `${getRandomInt(1, 20)} years`,
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
              title: 'Professional Role',
              company: 'Industry Leader Inc',
              startDate: new Date('2021-01-01'),
              isCurrent: true,
              description: `Working as a ${targetSub.name}.`
            }
          ]
        },
        
        // Create Portfolio Items
        portfolio: {
          create: portfolioItems
        }
      }
    });
    
    if (i % 50 === 0) {
      process.stdout.write('.');
    }
  }

  console.log('\n✅ Successfully generated 500 additional profiles!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
