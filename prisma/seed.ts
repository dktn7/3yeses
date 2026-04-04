import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log(`Start seeding ...`);

    // Clear existing data
    console.log('Clearing existing data...');
    await prisma.portfolioItem.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.subscription.deleteMany();
    await prisma.talentProfile.deleteMany();
    await prisma.user.deleteMany();
    await prisma.talentSubcategory.deleteMany();
    await prisma.talentCategory.deleteMany();
    console.log('Existing data cleared.');

    // Create a default admin user
    console.log('Creating admin user...');
    const adminPassword = 'AdminPassword123!';
  const adminHashedPassword = await bcryptjs.hash(adminPassword, 12);
    await prisma.user.create({
      data: {
        id: 'TN1',
        email: 'admin@example.com',
        name: 'Admin User',
        password: adminHashedPassword,
        role: 'ADMIN',
        emailVerified: new Date(), // Pre-verify the admin user
      },
    });
    console.log('Admin user created with email: admin@example.com and password: ${adminPassword}');
    console.log('Please change this password in a production environment!');

    // Create categories and subcategories
    console.log('Creating categories and subcategories...');
    const categories = [
      { 
        name: 'Voice Over & Dubbing', 
        icon: 'Mic',
        description: 'Professional voice acting and dubbing services',
        subcategories: [
          'Commercials', 
          'E-learning', 
          'Audiobooks', 
          'Animation', 
          'Video Games',
          'Narration',
          'IVR & Phone Systems'
        ] 
      },
      { 
        name: 'Translation & Localization', 
        icon: 'Globe',
        description: 'Professional translation and localization services',
        subcategories: [
          'Document Translation', 
          'Website Localization', 
          'Software Localization', 
          'Subtitling & Captioning',
          'Technical Translation',
          'Legal Translation',
          'Medical Translation'
        ] 
      },
      { 
        name: 'Content Creation', 
        icon: 'PenTool',
        description: 'Creative writing and content development',
        subcategories: [
          'Blog & Article Writing', 
          'Copywriting', 
          'Social Media Content', 
          'Video Scripting',
          'Product Descriptions',
          'Email Marketing',
          'SEO Content'
        ] 
      },
      { 
        name: 'Music & Audio', 
        icon: 'Music',
        description: 'Music composition and audio production',
        subcategories: [
          'Pop Music', 
          'Rock Music', 
          'Jazz Music', 
          'Classical Music',
          'Hip Hop Music',
          'Country Music',
          'Electronic Music',
          'R&B Music',
          'Folk Music',
          'Audio Production',
          'Sound Design'
        ] 
      },
      { 
        name: 'Video Production', 
        icon: 'Clapperboard',
        description: 'Video creation and editing services',
        subcategories: [
          'Video Editing', 
          'Motion Graphics', 
          'Animation', 
          'Promotional Videos',
          'Explainer Videos',
          'Social Media Videos',
          'Documentary Production'
        ] 
      },
      { 
        name: 'Acting & Performance', 
        icon: 'Drama',
        description: 'Professional acting and performance talent',
        subcategories: [
          'Theatre Acting',
          'Film Acting',
          'TV Acting',
          'Voice Acting',
          'Commercial Acting',
          'Background Acting',
          'Character Acting'
        ] 
      },
      { 
        name: 'Modeling', 
        icon: 'Camera',
        description: 'Professional modeling services',
        subcategories: [
          'Fashion Modeling', 
          'Commercial Modeling', 
          'Hand Modeling', 
          'Fitness Modeling',
          'Product Modeling',
          'Lifestyle Modeling',
          'Plus Size Modeling'
        ] 
      },
      { 
        name: 'Dancing & Choreography', 
        icon: 'Users',
        description: 'Professional dance and choreography services',
        subcategories: [
          'Contemporary Dance', 
          'Hip Hop', 
          'Ballet', 
          'Jazz Dance',
          'Latin Dance',
          'Choreography',
          'Dance Instruction'
        ] 
      },
      { 
        name: 'Beauty & Wellness', 
        icon: 'Heart',
        description: 'Beauty, wellness and lifestyle services',
        subcategories: [
          'Makeup Artist', 
          'Hair Styling', 
          'Beauty Consulting', 
          'Wellness Coaching',
          'Fitness Training',
          'Nutrition Consulting',
          'Spa Services'
        ] 
      },
      { 
        name: 'Sports & Fitness', 
        icon: 'Trophy',
        description: 'Sports and fitness talent services',
        subcategories: [
          'Personal Training', 
          'Sports Coaching', 
          'Fitness Modeling', 
          'Athletic Performance',
          'Sports Commentary',
          'Fitness Instruction',
          'Sports Demonstration'
        ] 
      },
      { 
        name: 'Stunts', 
        icon: 'Flame',
        description: 'Professional stunt performers and coordinators',
        subcategories: [
          'Film Stunts', 
          'TV Stunts', 
          'Action Sequences', 
          'Fight Choreography',
          'Vehicle Stunts',
          'High Falls',
          'Wire Work'
        ] 
      },
      { 
        name: 'Magic & Illusion', 
        icon: 'Sparkles',
        description: 'Professional magicians and illusionists',
        subcategories: [
          'Stage Magic', 
          'Close-Up Magic', 
          'Mentalism', 
          'Grand Illusions',
          'Comedy Magic',
          'Children\'s Magic',
          'Corporate Magic'
        ] 
      },
      { 
        name: 'Circus Arts', 
        icon: 'Tent',
        description: 'Circus performers and acrobats',
        subcategories: [
          'Acrobatics', 
          'Aerial Arts', 
          'Juggling', 
          'Clowning',
          'Contortion',
          'Fire Performance',
          'Trapeze'
        ] 
      },
      { 
        name: 'Comedy', 
        icon: 'Smile',
        description: 'Stand-up comedians and comedy performers',
        subcategories: [
          'Stand-Up Comedy', 
          'Improv Comedy', 
          'Sketch Comedy', 
          'Comedy Writing',
          'Physical Comedy',
          'Character Comedy',
          'Corporate Comedy'
        ] 
      },
      { 
        name: 'Photography (Commercial)', 
        icon: 'Aperture',
        description: 'Professional commercial photography services',
        subcategories: [
          'Product Photography', 
          'Fashion Photography', 
          'Food Photography', 
          'Event Photography',
          'Portrait Photography',
          'Real Estate Photography',
          'Corporate Photography'
        ] 
      },
      { 
        name: 'Graphic Design', 
        icon: 'Palette',
        description: 'Professional graphic design and visual communication',
        subcategories: [
          'Logo Design', 
          'Brand Identity', 
          'Print Design', 
          'Digital Design',
          'Packaging Design',
          'Illustration',
          'UI/UX Design'
        ] 
      },
      { 
        name: 'Music Production', 
        icon: 'Sliders',
        description: 'Music production and sound engineering',
        subcategories: [
          'Music Production', 
          'Mixing & Mastering', 
          'Beat Making', 
          'Sound Engineering',
          'Audio Post-Production',
          'Podcast Production',
          'Music Arrangement'
        ] 
      },
      { 
        name: 'Influencer/Content Creator', 
        icon: 'Smartphone',
        description: 'Social media influencers and content creators',
        subcategories: [
          'YouTube Creator', 
          'Instagram Influencer', 
          'TikTok Creator', 
          'Twitch Streamer',
          'Podcast Host',
          'Lifestyle Blogger',
          'Brand Ambassador'
        ] 
      },
      { 
        name: 'Hair & Makeup (Professional)', 
        icon: 'Scissors',
        description: 'Professional hair and makeup artists for media',
        subcategories: [
          'Film & TV Makeup', 
          'Special Effects Makeup', 
          'Bridal Hair & Makeup', 
          'Editorial Makeup',
          'Theatrical Makeup',
          'Hair Styling',
          'Wig Styling'
        ] 
      },
      { 
        name: 'Stage Crew/Technician', 
        icon: 'Wrench',
        description: 'Technical crew for live events and productions',
        subcategories: [
          'Lighting Technician', 
          'Sound Technician', 
          'Stage Manager', 
          'Rigging',
          'Set Construction',
          'Props Master',
          'Video Technician'
        ] 
      },
      { 
        name: 'Animation', 
        icon: 'Film',
        description: 'Animation and motion graphics specialists',
        subcategories: [
          '2D Animation', 
          '3D Animation', 
          'Motion Graphics', 
          'Character Animation',
          'Stop Motion',
          'VFX Animation',
          'Whiteboard Animation'
        ] 
      }
    ];

    for (const category of categories) {
      const createdCategory = await prisma.talentCategory.create({
        data: {
          name: category.name,
          icon: category.icon,
          description: category.description,
          subcategories: {
            create: category.subcategories.map(name => ({ name })),
          },
        },
      });
      console.log(`Created category: ${createdCategory.name}`);
    }

    console.log('Categories and subcategories created.');

    // Create sample users
    console.log('Creating sample users...');
  const sampleUserPassword = await bcryptjs.hash('password123', 10);

    // Create admin user
    await prisma.user.create({
      data: {
        id: 'TN2',
        name: 'Admin User',
        email: 'admin@3yeses.online',
        password: sampleUserPassword,
        role: 'ADMIN',
        emailVerified: new Date()
      }
    });

    // Create sample talent users
    const voiceOverCategory = await prisma.talentCategory.findFirst({ where: { name: 'Voice Over & Dubbing' } });
    const commercialsSubcat = await prisma.talentSubcategory.findFirst({ where: { name: 'Commercials' } });

    const talentUser1 = await prisma.user.create({
      data: {
        id: 'TN3',
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        password: sampleUserPassword,
        role: 'TALENT',
        emailVerified: new Date(),
        talentProfile: {
          create: {
            performerTitle: 'Professional Voice Over Artist',
            bio: 'Experienced voice over artist with 8+ years in commercials and e-learning. Warm, friendly tone perfect for brands targeting millennials.',
            location: 'Los Angeles, CA',
            experienceLevel: 'Advanced (6-10 years)',
            // rating removed per platform decision
            skills: ['Commercial Voice Over', 'E-learning Narration', 'Character Voices', 'IVR Systems'],
            categoryId: voiceOverCategory?.id,
            subcategoryId: commercialsSubcat?.id,
            avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=400&h=400&fit=crop&crop=face',
            viewCount: 247
          }
        }
      }
    });

    const translationCategory = await prisma.talentCategory.findFirst({ where: { name: 'Translation & Localization' } });
    const documentSubcat = await prisma.talentSubcategory.findFirst({ where: { name: 'Document Translation' } });

    const talentUser2 = await prisma.user.create({
      data: {
        id: 'TN4',
        name: 'Carlos Rodriguez',
        email: 'carlos@example.com',
        password: sampleUserPassword,
        role: 'TALENT',
        emailVerified: new Date(),
        talentProfile: {
          create: {
            performerTitle: 'Certified Spanish-English Translator',
            bio: 'Native bilingual translator specializing in legal and medical documents. 10+ years experience with perfect accuracy record.',
            location: 'Madrid, Spain',
            experienceLevel: 'Expert (10+ years)',
            // rating removed per platform decision
            skills: ['Legal Translation', 'Medical Translation', 'Technical Documentation', 'Certified Translation'],
            categoryId: translationCategory?.id,
            subcategoryId: documentSubcat?.id,
            avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
            viewCount: 189
          }
        }
      }
    });

    console.log('Sample users created.');

    // Skipping client users and bookings since clientProfile and clientId are removed from schema

    // Reviews and ratings removed from seeding per platform decision

    console.log('Database seeding completed successfully.');
  } catch (error) {
    console.error('Error during database seeding:', error);
  } finally {
    await prisma.$disconnect();
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
