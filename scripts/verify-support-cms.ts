
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Verifying Support & Operations Implementation ---');

  // 1. Verify SupportTicket Model
  console.log('\n1. Testing SupportTicket...');
  try {
    const ticket = await prisma.supportTicket.create({
      data: {
        subject: 'Test Ticket',
        message: 'This is a test ticket.',
        priority: 'MEDIUM',
        status: 'OPEN',
        guestEmail: 'test@example.com',
      },
    });
    console.log('✅ Created Ticket:', ticket.id);

    const updatedTicket = await prisma.supportTicket.update({
        where: { id: ticket.id },
        data: { status: 'IN_PROGRESS' }
    });
    console.log('✅ Updated Ticket Status:', updatedTicket.status);

    await prisma.supportTicket.delete({ where: { id: ticket.id } });
    console.log('✅ Deleted Ticket');
  } catch (e) {
    console.error('❌ SupportTicket Error:', e);
  }

  // 2. Verify KnowledgeBaseArticle Model
  console.log('\n2. Testing KnowledgeBaseArticle...');
  try {
    // Need an author (user)
    const user = await prisma.user.findFirst();
    if (user) {
        const article = await prisma.knowledgeBaseArticle.create({
        data: {
            title: 'How to use verify script',
            slug: 'verify-script-guide-' + Date.now(),
            content: 'Just run it.',
            category: 'Dev',
            authorId: user.id,
        },
        });
        console.log('✅ Created KB Article:', article.slug);
        
        await prisma.knowledgeBaseArticle.delete({ where: { id: article.id } });
        console.log('✅ Deleted KB Article');
    } else {
        console.log('⚠️ No user found to be author of KB Article. Skipping.');
    }
  } catch (e) {
    console.error('❌ KnowledgeBaseArticle Error:', e);
  }

  // 3. Verify MediaAsset Model
  console.log('\n3. Testing MediaAsset...');
  try {
    const asset = await prisma.mediaAsset.create({
      data: {
        filename: 'test.png',
        url: 'https://example.com/test.png',
        type: 'IMAGE',
        size: 1234,
      },
    });
    console.log('✅ Created MediaAsset:', asset.id);

    await prisma.mediaAsset.delete({ where: { id: asset.id } });
    console.log('✅ Deleted MediaAsset');
  } catch (e) {
    console.error('❌ MediaAsset Error:', e);
  }

  // 4. Verify SeoMetadata Model
  console.log('\n4. Testing SeoMetadata...');
  try {
    const seo = await prisma.seoMetadata.create({
      data: {
        route: '/test-route-' + Date.now(),
        title: 'Test Page',
        description: 'Test Description',
      },
    });
    console.log('✅ Created SeoMetadata:', seo.route);

    await prisma.seoMetadata.delete({ where: { id: seo.id } });
    console.log('✅ Deleted SeoMetadata');
  } catch (e) {
    console.error('❌ SeoMetadata Error:', e);
  }

  console.log('\n--- Verification Complete ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
