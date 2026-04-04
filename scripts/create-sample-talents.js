const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createSampleTalents() {
  try {
    console.log('🎯 Creating sample talent profiles...\n');

    // First, get some categories and subcategories
    const musicians = await prisma.category.findFirst({
      where: { name: 'Musicians' },
      include: { subcategories: true }
    });

    const actors = await prisma.category.findFirst({
      where: { name: 'Acting' },
      include: { subcategories: true }
    });

    const dancers = await prisma.category.findFirst({
      where: { name: 'Dancers' },
      include: { subcategories: true }
    });

    if (!musicians || !actors || !dancers) {
      console.log('❌ Required categories not found');
      return;
    }

    // Sample talent data
    const sampleTalents = [
      {
        // User data
        email: 'sarah.johnson@example.com',
        password: 'hashedpassword123',
        name: 'Sarah Johnson',
        role: 'TALENT',
        // Talent profile data
        roleDescription: 'Professional Jazz Singer',
        bio: 'Experienced jazz vocalist with over 8 years of performance experience. I specialize in classic jazz standards, blues, and contemporary jazz fusion. My smooth, soulful voice has graced stages from intimate jazz clubs to major festivals.',
        location: 'New York, NY',
        experience: 8,
        gender: 'FEMALE',
        ethnicity: 'African American',
        age: 29,
        height: 165,
        bodyType: 'SLIM',
        eyeColor: 'Brown',
        hairColor: 'Black',
        languages: ['English', 'French'],
        skills: ['Jazz Vocals', 'Blues', 'Improvisation', 'Stage Performance', 'Studio Recording'],
        availability: 'AVAILABLE',
        isBeginner: false,
        categoryId: musicians.id,
        subcategoryId: musicians.subcategories.find(s => s.name === 'Jazz Singers')?.id,
        avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=400&h=400&fit=crop&crop=face',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        socialMedia: [
          { platform: 'Instagram', url: 'https://instagram.com/sarahjazzmusic' },
          { platform: 'YouTube', url: 'https://youtube.com/sarahjohnsonmusic' }
        ]
      },
      {
        email: 'marcus.williams@example.com',
        password: 'hashedpassword123',
        name: 'Marcus Williams',
        role: 'TALENT',
        roleDescription: 'Professional Actor & Voice Artist',
        bio: 'Versatile actor with extensive experience in commercial work, film, and voice acting. Known for my authentic delivery and ability to connect with audiences across various demographics.',
        location: 'Los Angeles, CA',
        experience: 6,
        gender: 'MALE',
        ethnicity: 'Caucasian',
        age: 32,
        height: 180,
        bodyType: 'ATHLETIC',
        eyeColor: 'Blue',
        hairColor: 'Brown',
        languages: ['English', 'Spanish'],
        skills: ['Commercial Acting', 'Voice Over', 'Character Development', 'Improvisation', 'Method Acting'],
        availability: 'AVAILABLE',
        isBeginner: false,
        categoryId: actors.id,
        subcategoryId: actors.subcategories.find(s => s.name === 'Commercial Acting')?.id,
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      },
      {
        email: 'elena.rodriguez@example.com',
        password: 'hashedpassword123',
        name: 'Elena Rodriguez',
        role: 'TALENT',
        roleDescription: 'Contemporary Dance Choreographer',
        bio: 'Award-winning contemporary dancer and choreographer with a passion for storytelling through movement. I create emotionally driven pieces that blend modern dance with classical techniques.',
        location: 'Miami, FL',
        experience: 10,
        gender: 'FEMALE',
        ethnicity: 'Hispanic',
        age: 27,
        height: 170,
        bodyType: 'ATHLETIC',
        eyeColor: 'Hazel',
        hairColor: 'Brown',
        languages: ['English', 'Spanish', 'Portuguese'],
        skills: ['Contemporary Dance', 'Choreography', 'Ballet', 'Modern Dance', 'Teaching'],
        availability: 'LIMITED',
        isBeginner: false,
        categoryId: dancers.id,
        subcategoryId: dancers.subcategories.find(s => s.name === 'Contemporary Dancers')?.id,
        avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face'
      },
      {
        email: 'david.chen@example.com',
        password: 'hashedpassword123',
        name: 'David Chen',
        role: 'TALENT',
        roleDescription: 'Professional Guitarist & Music Producer',
        bio: 'Multi-genre guitarist with expertise in rock, blues, and jazz. Also experienced in music production and session work. Available for live performances, studio sessions, and music lessons.',
        location: 'Nashville, TN',
        experience: 12,
        gender: 'MALE',
        ethnicity: 'Asian',
        age: 35,
        height: 175,
        bodyType: 'AVERAGE',
        eyeColor: 'Brown',
        hairColor: 'Black',
        languages: ['English', 'Mandarin'],
        skills: ['Electric Guitar', 'Acoustic Guitar', 'Music Production', 'Song Arrangement', 'Blues', 'Rock', 'Jazz'],
        availability: 'AVAILABLE',
        isBeginner: false,
        categoryId: musicians.id,
        subcategoryId: musicians.subcategories.find(s => s.name === 'Guitarists')?.id,
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face'
      }
    ];

    // Create users and talent profiles
    for (const talentData of sampleTalents) {
      console.log(`Creating talent profile for ${talentData.name}...`);

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: talentData.email }
      });

      if (existingUser) {
        console.log(`   ⚡ User ${talentData.name} already exists`);
        continue;
      }

      // Create user first
      const user = await prisma.user.create({
        data: {
          email: talentData.email,
          password: talentData.password,
          name: talentData.name,
          role: talentData.role
        }
      });

      // Create talent profile
      const talentProfile = await prisma.talentProfile.create({
        data: {
          userId: user.id,
          roleDescription: talentData.roleDescription,
          bio: talentData.bio,
          location: talentData.location,
          experience: talentData.experience,
          gender: talentData.gender,
          ethnicity: talentData.ethnicity,
          age: talentData.age,
          height: talentData.height,
          bodyType: talentData.bodyType,
          eyeColor: talentData.eyeColor,
          hairColor: talentData.hairColor,
          languages: talentData.languages,
          skills: talentData.skills,
          availability: talentData.availability,
          isBeginner: talentData.isBeginner,
          categoryId: talentData.categoryId,
          subcategoryId: talentData.subcategoryId,
          avatarUrl: talentData.avatarUrl,
          videoUrl: talentData.videoUrl,
          socialMedia: talentData.socialMedia || {},
          viewCount: Math.floor(Math.random() * 1000) + 50 // Random view count
        }
      });

      // Create some portfolio items
      await prisma.portfolioItem.create({
        data: {
          title: `${talentData.name} - Professional Demo Reel`,
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          type: 'VIDEO',
          talentProfileId: talentProfile.userId ?? talentProfile.id
        }
      });

      console.log(`   ✅ Created ${talentData.name} with portfolio`);
    }

    console.log('\n🎉 Sample talent profiles created successfully!');

    // Show summary
    const totalTalents = await prisma.talentProfile.count();
    console.log(`📊 Total talent profiles in database: ${totalTalents}`);

  } catch (error) {
    console.error('❌ Error creating sample talents:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleTalents();
