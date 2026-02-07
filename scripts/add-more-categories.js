const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addMoreCategories() {
  try {
    console.log('🎯 Adding additional comprehensive categories...\n');

    // Additional categories to make it even more comprehensive
    const additionalCategories = [
      {
        name: 'Actors',
        description: 'Professional talent for film, theater, TV, and commercial productions',
        icon: 'Clapperboard',
        subcategories: [
          { name: 'Film Actors', description: 'Lead and supporting actors for feature and short films' },
          { name: 'TV Actors', description: 'Actors for television series and productions' },
          { name: 'Theater Actors', description: 'Stage performers for plays, musicals, and live theater' },
          { name: 'Voice Actors', description: 'Voice-over talent for animation, commercials, and narration' },
          { name: 'Commercial Actors', description: 'Talent for TV commercials and advertising campaigns' },
          { name: 'Musical Theater', description: 'Performers skilled in acting, singing, and dancing' },
          { name: 'Improv Performers', description: 'Artists specializing in improvisational comedy and theater' },
          { name: 'Extras/Background', description: 'Background talent for film and TV productions' },
          { name: 'Stunt Performers', description: 'Specialized performers for stunts and action scenes' }
        ]
      },
      {
        name: 'Musicians',
        description: 'Professional musicians, bands, vocalists, and musical talent',
        icon: 'Music',
        subcategories: [
          { name: 'Vocalists', description: 'Singers and vocal performers across all genres' },
          { name: 'Solo Artists', description: 'Individual musical artists and performers' },
          { name: 'Bands', description: 'Musical groups, bands, and ensembles' },
          { name: 'Instrumentalists', description: 'Musicians playing various instruments (Guitar, Piano, Drums, etc.)' },
          { name: 'DJs', description: 'Disc jockeys for events, clubs, and parties' },
          { name: 'Songwriters', description: 'Lyricists and composers creating original music' },
          { name: 'Music Producers', description: 'Professionals overseeing music recording and production' },
          { name: 'Session Musicians', description: 'Musicians for recording sessions and live backing' },
          { name: 'Orchestral Musicians', description: 'Classical musicians for orchestras and ensembles' }
        ]
      },
      {
        name: 'Sports & Fitness',
        description: 'Athletes, fitness models, trainers, and sports professionals',
        icon: 'Trophy',
        subcategories: [
          { name: 'Fitness Models', description: 'Models for fitness brands, magazines, and commercials' },
          { name: 'Personal Trainers', description: 'Certified fitness trainers and workout specialists' },
          { name: 'Professional Athletes', description: 'Competitors in professional sports leagues and events' },
          { name: 'Yoga Instructors', description: 'Teachers of yoga and mindfulness practices' },
          { name: 'Sports Coaches', description: 'Coaches for team and individual sports' },
          { name: 'Bodybuilders', description: 'Competitive bodybuilders and physique athletes' },
          { name: 'Extreme Sports', description: 'Athletes in skateboarding, BMX, surfing, and other action sports' },
          { name: 'Dance Fitness', description: 'Instructors for Zumba, aerobics, and dance-based fitness' }
        ]
      },
      {
        name: 'Photography & Videography',
        description: 'Professional photographers and videographers',
        icon: 'Camera',
        subcategories: [
          { name: 'Portrait Photographers', description: 'Individual and family portrait specialists' },
          { name: 'Wedding Photographers', description: 'Wedding and engagement photography' },
          { name: 'Event Photographers', description: 'Corporate and social event photography' },
          { name: 'Fashion Photographers', description: 'Fashion, beauty, and commercial photography' },
          { name: 'Product Photographers', description: 'Commercial product and e-commerce photography' },
          { name: 'Videographers', description: 'Professional video production and filming' },
          { name: 'Drone Operators', description: 'Aerial photography and videography specialists' },
          { name: 'Photo Editors', description: 'Post-production and photo retouching specialists' }
        ]
      },
      {
        name: 'Event Services',
        description: 'Professional event and hospitality services',
        icon: 'Calendar',
        subcategories: [
          { name: 'Event Hosts', description: 'Professional MCs and event hosting' },
          { name: 'Wedding Planners', description: 'Wedding coordination and planning specialists' },
          { name: 'Bartenders', description: 'Professional beverage service and mixology' },
          { name: 'Servers', description: 'Event serving and hospitality professionals' },
          { name: 'Event Coordinators', description: 'Event planning and management specialists' },
          { name: 'Security Personnel', description: 'Event security and crowd management' },
          { name: 'Translators', description: 'Live interpretation and translation services' }
        ]
      },
      {
        name: 'Beauty & Wellness',
        description: 'Beauty, wellness, and personal care professionals',
        icon: 'Heart',
        subcategories: [
          { name: 'Makeup Artists', description: 'Professional makeup for events and media' },
          { name: 'Hair Stylists', description: 'Professional hair styling and design' },
          { name: 'Nail Artists', description: 'Nail art and manicure specialists' },
          { name: 'Massage Therapists', description: 'Therapeutic and relaxation massage' },
          { name: 'Aestheticians', description: 'Skincare and facial treatment specialists' },
          { name: 'Wellness Coaches', description: 'Holistic health and lifestyle coaching' }
        ]
      },
      {
        name: 'Technical Services',
        description: 'Technical and production support professionals',
        icon: 'Settings',
        subcategories: [
          { name: 'Sound Engineers', description: 'Audio mixing and sound system operators' },
          { name: 'Lighting Technicians', description: 'Stage and event lighting specialists' },
          { name: 'Stage Managers', description: 'Production coordination and stage management' },
          { name: 'Equipment Operators', description: 'Technical equipment and machinery operators' },
          { name: 'Set Designers', description: 'Stage and set construction specialists' },
          { name: 'Riggers', description: 'Equipment rigging and safety specialists' }
        ]
      }
    ];

    // Create the additional categories
    for (const categoryData of additionalCategories) {
      console.log(`\n📁 Processing category: ${categoryData.name}`);
      
      // Check if category exists
      let category = await prisma.category.findUnique({
        where: { name: categoryData.name }
      });

      if (!category) {
        // Create new category
        category = await prisma.category.create({
          data: {
            name: categoryData.name,
            description: categoryData.description,
            icon: categoryData.icon
          }
        });
        console.log(`   ✅ Created new category: ${category.name}`);
      } else {
        // Update existing category icon and description
        category = await prisma.category.update({
          where: { id: category.id },
          data: { 
            icon: categoryData.icon,
            description: categoryData.description 
          }
        });
        console.log(`   🔄 Updated category details: ${category.name}`);
      }

      // Create subcategories
      for (const subcat of categoryData.subcategories) {
        const existingSubcat = await prisma.subcategory.findFirst({
          where: {
            name: subcat.name,
            categoryId: category.id
          }
        });

        if (!existingSubcat) {
          await prisma.subcategory.create({
            data: {
              name: subcat.name,
              description: subcat.description,
              categoryId: category.id
            }
          });
          console.log(`      ➕ Added subcategory: ${subcat.name}`);
        } else {
          console.log(`      ⚡ Subcategory exists: ${subcat.name}`);
        }
      }
    }

    // Show final summary
    console.log('\n🎉 Additional categories expansion complete!\n');
    
    const finalCategories = await prisma.category.findMany({
      include: {
        subcategories: true
      }
    });

    console.log('📊 Final comprehensive categories summary:');
    finalCategories.forEach(cat => {
      console.log(`- ${cat.name}: ${cat.subcategories.length} subcategories`);
    });

    const totalSubcats = finalCategories.reduce((sum, cat) => sum + cat.subcategories.length, 0);
    console.log(`\n🎯 Grand Total: ${finalCategories.length} categories, ${totalSubcats} subcategories`);

  } catch (error) {
    console.error('❌ Error adding categories:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addMoreCategories();
