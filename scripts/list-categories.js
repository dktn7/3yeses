const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const cats = await prisma.talentCategory.findMany({
      include: { subcategories: { orderBy: { name: 'asc' } } },
      orderBy: { name: 'asc' },
    });

    const out = cats.map(c => ({
      id: c.id,
      name: c.name,
      description: c.description || null,
      icon: c.icon || null,
      subcategories: (c.subcategories || []).map(s => ({ id: s.id, name: s.name, description: s.description || null })),
    }));

    console.log(JSON.stringify({ success: true, data: out }, null, 2));
  } catch (err) {
    console.error('Error listing categories:', err);
    process.exitCode = 2;
  } finally {
    await prisma.$disconnect();
  }
})();
