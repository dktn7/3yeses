const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function expandCategories() {
  try {
    console.log('🎯 Expanding categories and subcategories...\n');

    // First, let's see what we currently have
    const currentCategories = await prisma.category.findMany({
      include: {
        subcategories: true
      }
    });

    console.log('Current categories:');
    currentCategories.forEach(cat => {
      console.log(`- ${cat.name} (${cat.subcategories.length} subcategories)`);
    });

    // Define comprehensive categories and subcategories
    const categoriesData = [
      {
        name: 'Musicians',
        description: 'Professional musicians across all genres and instruments',
        icon: '🎵',
        subcategories: [
          // Vocalists by Genre
          { name: 'Pop Singers', description: 'Contemporary pop and mainstream vocalists' },
          { name: 'Rock Singers', description: 'Rock, alternative, and metal vocalists' },
          { name: 'Jazz Singers', description: 'Jazz, blues, and swing vocalists' },
          { name: 'Classical Singers', description: 'Opera, classical, and art song performers' },
          { name: 'Country Singers', description: 'Country, folk, and americana vocalists' },
          { name: 'R&B Singers', description: 'R&B, soul, and neo-soul vocalists' },
          { name: 'Hip-Hop Artists', description: 'Rappers, hip-hop, and spoken word artists' },
          { name: 'Electronic Music Artists', description: 'Electronic, EDM, and synth-pop artists' },
          { name: 'World Music Singers', description: 'Traditional and world music vocalists' },
          
          // Instrumentalists
          { name: 'Guitarists', description: 'Acoustic, electric, and classical guitarists' },
          { name: 'Pianists', description: 'Piano, keyboard, and synthesizer players' },
          { name: 'Drummers', description: 'Drum kit, percussion, and rhythm section' },
          { name: 'Bass Players', description: 'Electric and upright bass musicians' },
          { name: 'Violinists', description: 'Violin, viola, and string instrument players' },
          { name: 'Brass Players', description: 'Trumpet, trombone, horn, and brass section' },
          { name: 'Woodwind Players', description: 'Saxophone, clarinet, flute, and woodwinds' },
          { name: 'DJs', description: 'Club DJs, wedding DJs, and event music specialists' },
          
          // Specialized Musicians
          { name: 'Session Musicians', description: 'Studio recording and backing musicians' },
          { name: 'Orchestra Musicians', description: 'Symphony and chamber orchestra players' },
          { name: 'Band Members', description: 'Looking for band mates and collaborators' },
          { name: 'Music Producers', description: 'Music production and beat makers' },
          { name: 'Songwriters', description: 'Lyricists and music composers' }
        ]
      },
      {
        name: 'Dancers',
        description: 'Professional dancers across all styles and disciplines',
        icon: '💃',
        subcategories: [
          { name: 'Ballet Dancers', description: 'Classical ballet and pointe work' },
          { name: 'Contemporary Dancers', description: 'Modern and contemporary dance styles' },
          { name: 'Hip-Hop Dancers', description: 'Street dance, breaking, and urban styles' },
          { name: 'Jazz Dancers', description: 'Jazz, musical theater, and commercial dance' },
          { name: 'Ballroom Dancers', description: 'Standard and Latin ballroom dancing' },
          { name: 'Tap Dancers', description: 'Traditional and contemporary tap dance' },
          { name: 'Cultural Dancers', description: 'Traditional and ethnic dance forms' },
          { name: 'Choreographers', description: 'Dance creators and movement directors' },
          { name: 'Dance Instructors', description: 'Professional dance teachers and coaches' }
        ]
      },
      {
        name: 'Entertainers',
        description: 'Live performers and entertainment specialists',
        icon: '🎭',
        subcategories: [
          { name: 'Stand-up Comedians', description: 'Comedy performers and humor specialists' },
          { name: 'Magicians', description: 'Close-up, stage, and specialty magic performers' },
          { name: 'Circus Performers', description: 'Acrobats, aerialists, and circus arts' },
          { name: 'Impersonators', description: 'Celebrity and character impersonators' },
          { name: 'Street Performers', description: 'Buskers and public entertainment artists' },
          { name: 'Party Entertainers', description: 'Event hosts and party specialists' },
          { name: 'Storytellers', description: 'Narrative performers and spoken word artists' }
        ]
      },
      {
        name: 'Sports & Fitness',
        description: 'Athletic performers and fitness professionals',
        icon: '⚽',
        subcategories: [
          { name: 'Personal Trainers', description: 'Fitness coaching and workout specialists' },
          { name: 'Yoga Instructors', description: 'Yoga, meditation, and mindfulness teachers' },
          { name: 'Martial Arts Instructors', description: 'Combat sports and self-defense teachers' },
          { name: 'Sports Coaches', description: 'Team and individual sports coaching' },
          { name: 'Fitness Models', description: 'Athletic and fitness modeling specialists' },
          { name: 'Stunt Performers', description: 'Action sequences and stunt coordination' },
          { name: 'Athletic Performers', description: 'Sports demonstrations and athletic shows' }
        ]
      },
      {
        name: 'Voice Professionals',
        description: 'Voice acting and narration specialists',
        icon: '🎙️',
        subcategories: [
          { name: 'Voice Over Artists', description: 'Commercial and promotional voice work' },
          { name: 'Audiobook Narrators', description: 'Book narration and literary voice work' },
          { name: 'Animation Voice Actors', description: 'Cartoon and animated character voices' },
          { name: 'Documentary Narrators', description: 'Educational and documentary voice work' },
          { name: 'Radio Personalities', description: 'Radio hosting and broadcast professionals' },
          { name: 'Podcast Hosts', description: 'Podcast creation and audio content hosts' }
        ]
      },
      {
        name: 'Creative Arts',
        description: 'Visual and creative art professionals',
        icon: '🎨',
        subcategories: [
          { name: 'Live Painters', description: 'Performance artists and live painting events' },
          { name: 'Muralists', description: 'Large-scale wall art and mural creation' },
          { name: 'Caricature Artists', description: 'Portrait and caricature drawing specialists' },
          { name: 'Face Painters', description: 'Event face painting and body art' },
          { name: 'Sculptors', description: 'Live sculpting and 3D art demonstrations' },
          { name: 'Digital Artists', description: 'Live digital art and design creation' }
        ]
      },
      {
        name: 'Specialty Performers',
        description: 'Unique and specialized performance artists',
        icon: '✨',
        subcategories: [
          { name: 'Fire Performers', description: 'Fire dancing, breathing, and pyrotechnics' },
          { name: 'LED Performers', description: 'LED and light-based performance art' },
          { name: 'Balloon Artists', description: 'Balloon twisting and sculpture specialists' },
          { name: 'Mime Artists', description: 'Silent performance and physical comedy' },
          { name: 'Puppeteers', description: 'Puppet shows and marionette performances' },
          { name: 'Cosplay Performers', description: 'Character portrayal and costume performance' },
          { name: 'Living Statues', description: 'Human statue and freeze performance art' }
        ]
      }
    ];

    // Create or update categories
    for (const categoryData of categoriesData) {
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
    console.log('\n🎉 Categories expansion complete!\n');
    
    const finalCategories = await prisma.category.findMany({
      include: {
        subcategories: true
      }
    });

    console.log('📊 Final categories summary:');
    finalCategories.forEach(cat => {
      console.log(`- ${cat.name}: ${cat.subcategories.length} subcategories`);
    });

    const totalSubcats = finalCategories.reduce((sum, cat) => sum + cat.subcategories.length, 0);
    console.log(`\n🎯 Total: ${finalCategories.length} categories, ${totalSubcats} subcategories`);

  } catch (error) {
    console.error('❌ Error expanding categories:', error);
  } finally {
    await prisma.$disconnect();
  }
}

expandCategories();
