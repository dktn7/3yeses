const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  // Clear existing data
  await prisma.portfolioItem.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.talentProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.subcategory.deleteMany();
  await prisma.category.deleteMany();

  // Create a default admin user
  console.log('Creating admin user...');
  const adminPassword = 'AdminPassword123!';
  const adminHashedPassword = await bcrypt.hash(adminPassword, 12);
  
  await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: adminHashedPassword,
      role: 'ADMIN',
      emailVerified: new Date(), // Pre-verify the admin user
    },
  });

  console.log(`Admin user created with email: admin@example.com and password: ${adminPassword}`);
  console.log('Please change this password in a production environment!');

  // Create categories and subcategories
  const categories = [
    { 
      name: 'Voice Over & Dubbing', 
      icon: '🎙️',
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
      icon: '🌍',
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
      icon: '✍️',
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
      icon: '🎵',
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
      icon: '🎬',
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
      icon: '🎭',
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
      icon: '📸',
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
      icon: '💃',
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
      icon: '💄',
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
      icon: '🏃',
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
    }
  ];

  for (const category of categories) {
    const createdCategory = await prisma.category.create({
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

  // Create sample users
  const sampleUserPassword = await bcrypt.hash('password123', 10);

  // Create admin user
  await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@3yeses.online',
      password: sampleUserPassword,
      role: 'ADMIN',
      emailVerified: new Date()
    }
  });

  // Create sample talent users
  const voiceOverCategory = await prisma.category.findFirst({ where: { name: 'Voice Over & Dubbing' } });
  const commercialsSubcat = await prisma.subcategory.findFirst({ where: { name: 'Commercials' } });

  const talentUser1 = await prisma.user.create({
    data: {
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      password: sampleUserPassword,
      role: 'TALENT',
      emailVerified: new Date(),
      talentProfile: {
        create: {
          roleDescription: 'Professional Voice Over Artist',
          bio: 'Experienced voice over artist with 8+ years in commercials and e-learning. Warm, friendly tone perfect for brands targeting millennials.',
          location: 'Los Angeles, CA',
          experience: 8,
          // rating removed per platform decision
          languages: ['English', 'Spanish'],
          skills: ['Commercial Voice Over', 'E-learning Narration', 'Character Voices', 'IVR Systems'],
          categoryId: voiceOverCategory?.id,
          subcategoryId: commercialsSubcat?.id,
          avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=400&h=400&fit=crop&crop=face',
          viewCount: 247
        }
      }
    }
  });

  const translationCategory = await prisma.category.findFirst({ where: { name: 'Translation & Localization' } });
  const documentSubcat = await prisma.subcategory.findFirst({ where: { name: 'Document Translation' } });

  const talentUser2 = await prisma.user.create({
    data: {
      name: 'Carlos Rodriguez',
      email: 'carlos@example.com',
      password: sampleUserPassword,
      role: 'TALENT',
      emailVerified: new Date(),
      talentProfile: {
        create: {
          roleDescription: 'Certified Spanish-English Translator',
          bio: 'Native bilingual translator specializing in legal and medical documents. 10+ years experience with perfect accuracy record.',
          location: 'Madrid, Spain',
          experience: 10,
          // rating removed per platform decision
          languages: ['Spanish', 'English', 'Portuguese'],
          skills: ['Legal Translation', 'Medical Translation', 'Technical Documentation', 'Certified Translation'],
          categoryId: translationCategory?.id,
          subcategoryId: documentSubcat?.id,
          avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
          viewCount: 189
        }
      }
    }
  });

  // Skipping client users and bookings since clientProfile and clientId are removed from schema

  // Reviews and ratings removed from seeding per platform decision
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
