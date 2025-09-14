const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addMoreCategories() {
  try {
    console.log('🎯 Adding additional comprehensive categories...\n');

    // Additional categories to make it even more comprehensive
    const additionalCategories = [
      {
        name: 'Photography & Videography',
        description: 'Professional photographers and videographers',
        icon: '📸',
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
        icon: '🎪',
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
        icon: '💄',
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
        icon: '🔧',
        subcategories: [
          { name: 'Sound Engineers', description: 'Audio mixing and sound system operators' },
          { name: 'Lighting Technicians', description: 'Stage and event lighting specialists' },
          { name: 'Stage Managers', description: 'Production coordination and stage management' },
          { name: 'Equipment Operators', description: 'Technical equipment and machinery operators' },
          { name: 'Set Designers', description: 'Stage and set construction specialists' },
          { name: 'Riggers', description: 'Equipment rigging and safety specialists' }
        ]
      },
      {
        name: 'Education & Workshops',
        description: 'Educational and instructional professionals',
        icon: '📚',
        subcategories: [
          { name: 'Workshop Leaders', description: 'Educational workshop and seminar leaders' },
          { name: 'Art Instructors', description: 'Creative arts and crafts teaching' },
          { name: 'Music Teachers', description: 'Individual and group music instruction' },
          { name: 'Language Tutors', description: 'Foreign language instruction and tutoring' },
          { name: 'Public Speakers', description: 'Motivational and educational speaking' },
          { name: 'Corporate Trainers', description: 'Business and professional development training' }
        ]
      },
      {
        name: 'Digital Content',
        description: 'Digital media and online content creators',
        icon: '💻',
        subcategories: [
          { name: 'Social Media Influencers', description: 'Brand promotion and social media marketing' },
          { name: 'Content Creators', description: 'Digital content production and creation' },
          { name: 'Livestream Hosts', description: 'Live streaming and online event hosting' },
          { name: 'Video Editors', description: 'Post-production video editing specialists' },
          { name: 'Graphic Designers', description: 'Visual design and branding specialists' },
          { name: 'Web Developers', description: 'Website design and development services' }
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
        console.log(`   ⚡ Category already exists: ${category.name}`);
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
