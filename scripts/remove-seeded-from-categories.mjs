import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function stripSeeded(text) {
  if (!text) return text;
  // remove literal "(seeded)", the word 'seeded', and extra whitespace
  return text.replace(/\(seeded\)/gi, '')
    .replace(/\bseeded\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

async function main() {
  try {
    // Update categories where name or description contains 'seeded'
    const catsByName = await prisma.talentCategory.findMany({
      where: { name: { contains: 'seeded', mode: 'insensitive' } },
    });
    const catsByDesc = await prisma.talentCategory.findMany({
      where: { description: { contains: 'seeded', mode: 'insensitive' } },
    });

    const catMap = new Map();
    for (const c of catsByName.concat(catsByDesc)) catMap.set(c.id, c);

    for (const c of catMap.values()) {
      const newName = stripSeeded(c.name);
      const newDesc = stripSeeded(c.description);
      const data = {};
      if (newName !== c.name) data.name = newName;
      if (newDesc !== c.description) data.description = newDesc;
      if (Object.keys(data).length > 0) {
        await prisma.talentCategory.update({ where: { id: c.id }, data });
        console.log(`Updated category: "${c.name}" -> "${newName}"; desc updated: ${c.description ? 'yes' : 'no'}`);
      }
    }

    // Update subcategories where name or description contains 'seeded'
    const subsByName = await prisma.talentSubcategory.findMany({
      where: { name: { contains: 'seeded', mode: 'insensitive' } },
    });
    const subsByDesc = await prisma.talentSubcategory.findMany({
      where: { description: { contains: 'seeded', mode: 'insensitive' } },
    });

    const subMap = new Map();
    for (const s of subsByName.concat(subsByDesc)) subMap.set(s.id, s);

    for (const s of subMap.values()) {
      const newName = stripSeeded(s.name);
      const newDesc = stripSeeded(s.description);
      const data = {};
      if (newName !== s.name) data.name = newName;
      if (newDesc !== s.description) data.description = newDesc;
      if (Object.keys(data).length > 0) {
        await prisma.talentSubcategory.update({ where: { id: s.id }, data });
        console.log(`Updated subcategory: "${s.name}" -> "${newName}"; desc updated: ${s.description ? 'yes' : 'no'}`);
      }
    }

    console.log('Seeded text removal complete.');
  } catch (err) {
    console.error('Error removing seeded text:', err);
    process.exitCode = 2;
  } finally {
    await prisma.$disconnect();
  }
}

import { fileURLToPath } from 'url';

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
