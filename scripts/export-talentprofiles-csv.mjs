import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();
const outDir = path.join(process.cwd(),'backups');
const outFile = path.join(outDir,'talentprofiles_export.csv');

function esc(v){
  if(v===null||v===undefined) return '';
  if(typeof v==='object') v = JSON.stringify(v);
  return '"'+String(v).replace(/"/g,'""')+'"';
}

async function main(){
  await fs.mkdir(outDir,{recursive:true});
  const rows = await prisma.talentProfile.findMany({
    include: { profileSettings: true },
  });

  const headers = [
    'userId','performerTitle','bio','location','experienceLevel','gender','age','dateOfBirth','height','bodyType','eyeColor','hairColor','skills','featuredSkills','avatarUrl','avatarSource','bannerUrl','bannerSource','contentBackground','videoUrls','portfolioImages','socialMedia','ethnicity','ethnicityOther','genderOther','disabilities','disabilityOther','profileComplete','categoryId','subcategoryId','viewCount','likeCount','createdAt','updatedAt'
  ];

  const lines = [headers.join(',')];

  for(const r of rows){
    const line = [
      esc(r.userId),
      esc(r.performerTitle),
      esc(r.bio),
      esc(r.location),
      esc(r.experienceLevel),
      esc(r.gender),
      esc(r.age),
      esc(r.dateOfBirth),
      esc(r.height),
      esc(r.bodyType),
      esc(r.eyeColor),
      esc(r.hairColor),
      esc(r.skills),
      esc(r.featuredSkills),
      esc(r.avatarUrl),
      esc(r.avatarSource),
      esc(r.bannerUrl),
      esc(r.bannerSource),
      esc(r.contentBackground),
      esc(r.videoUrls),
      esc(r.portfolioImages),
      esc(r.socialMedia),
      esc(r.ethnicity),
      esc(r.ethnicityOther),
      esc(r.genderOther),
      esc(r.disabilities),
      esc(r.disabilityOther),
      esc(r.profileComplete),
      esc(r.categoryId),
      esc(r.subcategoryId),
      esc(r.viewCount),
      esc(r.likeCount),
      esc(r.createdAt),
      esc(r.updatedAt),
    ].join(',');
    lines.push(line);
  }

  await fs.writeFile(outFile, lines.join('\n'));
  console.log('Wrote', outFile, 'with', rows.length, 'rows');
}

main().catch((e)=>{ console.error(e); process.exit(1); }).finally(()=>prisma.$disconnect());
