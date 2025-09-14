// Script to set up a complete talent profile for testing
// Run this with: node setup-talent-profile.mjs

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setupTalentProfile() {
  console.log('🎭 Setting up talent profile...');

  try {
    // Find our test user
    const user = await prisma.user.findUnique({
      where: { email: 'test@3yeses.com' },
      include: { talentProfile: true }
    });

    if (!user) {
      console.log('❌ Test user not found');
      return;
    }

    console.log('✅ Found user:', user.name);

    let talentProfile;

    if (user.talentProfile) {
      // Update existing profile
      talentProfile = await prisma.talentProfile.update({
        where: { id: user.talentProfile.id },
        data: {
          roleDescription: 'Versatile Actor & Performer',
          bio: 'Passionate actor with experience in theater, film, and commercial work. Known for bringing authentic emotion and professionalism to every role.',
          location: 'London, UK',
          experience: 5,
          rating: 4.8,
          ratePerHour: 75.0,
          gender: 'MALE',
          ethnicity: 'Mixed',
          age: 28,
          height: 180,
          bodyType: 'ATHLETIC',
          eyeColor: 'Brown',
          hairColor: 'Dark Brown',
          languages: ['English', 'Spanish', 'French'],
          skills: ['Acting', 'Voice Acting', 'Improvisation', 'Stage Combat', 'Dancing'],
          availability: 'AVAILABLE',
          avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          socialMedia: [
            { platform: 'Instagram', url: 'https://instagram.com/johndoe_actor' },
            { platform: 'Twitter', url: 'https://twitter.com/johndoe_actor' }
          ],
          viewCount: 1247,
          isBeginner: false
        }
      });

      console.log('✅ Updated existing talent profile');
    } else {
      // Create new profile
      talentProfile = await prisma.talentProfile.create({
        data: {
          userId: user.id,
          roleDescription: 'Versatile Actor & Performer',
          bio: 'Passionate actor with experience in theater, film, and commercial work. Known for bringing authentic emotion and professionalism to every role.',
          location: 'London, UK',
          experience: 5,
          rating: 4.8,
          ratePerHour: 75.0,
          gender: 'MALE',
          ethnicity: 'Mixed',
          age: 28,
          height: 180,
          bodyType: 'ATHLETIC',
          eyeColor: 'Brown',
          hairColor: 'Dark Brown',
          languages: ['English', 'Spanish', 'French'],
          skills: ['Acting', 'Voice Acting', 'Improvisation', 'Stage Combat', 'Dancing'],
          availability: 'AVAILABLE',
          avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          socialMedia: [
            { platform: 'Instagram', url: 'https://instagram.com/johndoe_actor' },
            { platform: 'Twitter', url: 'https://twitter.com/johndoe_actor' }
          ],
          viewCount: 1247,
          isBeginner: false
        }
      });

      console.log('✅ Created new talent profile');
    }

    // Create profile settings if they don't exist
    const existingSettings = await prisma.profileSettings.findUnique({
      where: { talentProfileId: talentProfile.id }
    });

    if (!existingSettings) {
      await prisma.profileSettings.create({
        data: {
          talentProfileId: talentProfile.id,
          showViewCount: true,
          showExperienceLevel: true,
          showLocation: true,
          showLanguages: true,
          showAvailability: true,
          showRating: true,
          showReviewCount: true,
          showWorkHistory: true,
          showSocialMedia: true,
          showContactInfo: true,
          profileVisibility: 'PUBLIC',
          searchable: true,
          allowDirectContact: true,
          showOnlineStatus: false
        }
      });

      console.log('✅ Created profile settings');
    }

    // Add some portfolio items
    const existingPortfolio = await prisma.portfolioItem.findFirst({
      where: { talentProfileId: talentProfile.id }
    });

    if (!existingPortfolio) {
      await prisma.portfolioItem.createMany({
        data: [
          {
            title: 'Commercial Reel 2024',
            url: 'https://www.youtube.com/watch?v=example1',
            type: 'VIDEO',
            talentProfileId: talentProfile.id
          },
          {
            title: 'Headshot Portfolio',
            url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
            type: 'IMAGE',
            talentProfileId: talentProfile.id
          },
          {
            title: 'Voice Acting Demo',
            url: 'https://soundcloud.com/example/voice-demo',
            type: 'AUDIO',
            talentProfileId: talentProfile.id
          }
        ]
      });

      console.log('✅ Added portfolio items');
    }

    // Add some reviews
    const existingReviews = await prisma.review.findFirst({
      where: { talentProfileId: talentProfile.id }
    });

    if (!existingReviews) {
      // Create a test client user for reviews
      let clientUser = await prisma.user.findFirst({
        where: { role: 'CLIENT' }
      });

      if (!clientUser) {
        clientUser = await prisma.user.create({
          data: {
            email: 'client@3yeses.com',
            password: '$2a$12$test.hash.here',
            name: 'Sarah Director',
            role: 'CLIENT'
          }
        });
      }

      await prisma.review.createMany({
        data: [
          {
            rating: 5,
            comment: 'John was absolutely fantastic to work with. Professional, punctual, and brought incredible energy to the role. Highly recommended!',
            reviewerId: clientUser.id,
            talentProfileId: talentProfile.id
          },
          {
            rating: 5,
            comment: 'Outstanding performance and very easy to direct. John understood the character immediately and delivered exactly what we needed.',
            reviewerId: clientUser.id,
            talentProfileId: talentProfile.id
          },
          {
            rating: 4,
            comment: 'Great actor with excellent improvisation skills. Would definitely work with again.',
            reviewerId: clientUser.id,
            talentProfileId: talentProfile.id
          }
        ]
      });

      console.log('✅ Added reviews');
    }

    console.log(`🎉 Talent profile setup complete!`);
    console.log(`Profile ID: ${talentProfile.id}`);
    console.log(`You can now test the API at: /api/talent/${talentProfile.id}`);

  } catch (error) {
    console.error('❌ Error setting up talent profile:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupTalentProfile();
