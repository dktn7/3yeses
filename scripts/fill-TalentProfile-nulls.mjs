import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import { pipeline } from 'stream/promises';

const prisma = new PrismaClient();

function randChoice(arr) { return arr[Math.floor(Math.random()*arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random()*(max-min+1))+min; }
function shuffle(a){ for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a; }

const GENDERS = ['MALE','FEMALE','NON_BINARY','PREFER_NOT_TO_SAY'];
const BODY_TYPES = ['SLIM','ATHLETIC','CURVY','PLUS_SIZE','MUSCULAR','AVERAGE','PREFER_NOT_TO_SAY'];
const ETHNICITIES = ['WHITE_CAUCASIAN','BLACK_AFRICAN','ASIAN','HISPANIC_LATINO','MIDDLE_EASTERN','MIXED_MULTIRACIAL','NATIVE_AMERICAN','PACIFIC_ISLANDER','PREFER_NOT_TO_SAY'];
const EYE_COLORS = ['Brown','Blue','Green','Hazel','Grey','Amber'];
const HAIR_COLORS = ['Black','Brown','Blonde','Red','Grey','Bald','Dyed'];
const SKILLS_POOL = ['Acting','Singing','Dancing','Voice Over','Modeling','Stunts','Choreography','Guitar','Piano','Drums','Editing','Cinematography','Audio Engineering','Comedy','Presentation','Fitness Coaching'];
const YT_VIDEOS = [
  'https://www.youtube.com/watch?v=3JZ_D3ELwOQ',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://www.youtube.com/watch?v=V-_O7nl0Ii0',
  'https://www.youtube.com/watch?v=kXYiU_JCYtU'
];

const AVATAR_DIR = path.join(process.cwd(),'public','uploads','avatars');
const BANNER_DIR = path.join(process.cwd(),'public','uploads','banners');

async function ensureDirs(){
  await fsp.mkdir(AVATAR_DIR,{recursive:true});
  await fsp.mkdir(BANNER_DIR,{recursive:true});
}

async function downloadImage(url,destPath){
  try{
    const res = await fetch(url, { redirect: 'follow' });
    if(!res.ok) throw new Error(`fetch failed ${res.status}`);
    await pipeline(res.body, fs.createWriteStream(destPath));
    return true;
  }catch(e){
    console.error('downloadImage error',e.message);
    return false;
  }
}

function sampleUnsplashAvatar(){
  // Use picsum.photos with a seed for reliable, rate-limit-free images
  return `https://picsum.photos/400/400`;
}
function sampleUnsplashBanner(){
  return `https://picsum.photos/1200/400`;
}

async function main(){
  console.log('Starting filler script: filling null TalentProfile fields and downloading media.');
  await ensureDirs();

  const profiles = await prisma.talentProfile.findMany({ select: {
    userId:true, gender:true, age:true, dateOfBirth:true, height:true, bodyType:true, eyeColor:true, hairColor:true, skills:true, avatarUrl:true, bannerUrl:true, videoUrl:true, socialMedia:true, ethnicity:true, contentBackground:true
  }});

  let i=0;
  for(const p of profiles){
    i++;
    const updates = {};
    // Gender
    if(p.gender==null){ updates.gender = randChoice(GENDERS); }
    // Age & dateOfBirth
    if(p.age==null){ const age = randInt(18,55); updates.age = age; const year = (new Date()).getFullYear() - age; const month = randInt(0,11); const day = randInt(1,28); updates.dateOfBirth = new Date(year,month,day); }
    // Height
    if(p.height==null){ updates.height = randInt(155,195); }
    // Body type
    if(p.bodyType==null){ updates.bodyType = randChoice(BODY_TYPES); }
    // Eye/hair
    if(p.eyeColor==null){ updates.eyeColor = randChoice(EYE_COLORS); }
    if(p.hairColor==null){ updates.hairColor = randChoice(HAIR_COLORS); }
    // Skills (string[])
    if(!p.skills || p.skills.length===0){ const s = shuffle(SKILLS_POOL.slice()); const pick = s.slice(0, Math.max(3, randInt(3,6))); updates.skills = { set: pick } }
    // VideoUrl
    if(!p.videoUrl){ updates.videoUrl = randChoice(YT_VIDEOS); updates.videoUrls = { set: [randChoice(YT_VIDEOS)] }; }
    // Social media JSON
    if(!p.socialMedia){ const handle = `${p.userId.toLowerCase().replace(/[^a-z0-9]/g,'')}`; updates.socialMedia = [{ platform: 'Instagram', url: `https://instagram.com/${handle}` }]; }
    // Ethnicity
    if(!p.ethnicity){ updates.ethnicity = randChoice(ETHNICITIES); }
    // contentBackground: use a subtle pastel hex
    if(!p.contentBackground){ const hex = '#'+(Math.floor(Math.random()*0x888888)+0x444444).toString(16).padStart(6,'0'); updates.contentBackground = hex; }

    // Avatar/banner: download if missing
    if(!p.avatarUrl){ const dest = path.join(AVATAR_DIR, `${p.userId}.jpg`); const success = await downloadImage(sampleUnsplashAvatar(), dest); if(success){ updates.avatarUrl = `/uploads/avatars/${p.userId}.jpg`; updates.avatarSource = 'upload'; }}
    if(!p.bannerUrl){ const destB = path.join(BANNER_DIR, `${p.userId}.jpg`); const successB = await downloadImage(sampleUnsplashBanner(), destB); if(successB){ updates.bannerUrl = `/uploads/banners/${p.userId}.jpg`; updates.bannerSource = 'upload'; }}

    // Profile complete heuristic
    updates.profileComplete = true;

    // Apply update if there are meaningful keys
    const keys = Object.keys(updates);
    if(keys.length>0){
      // For array fields Prisma expects: skills: { set: [...] } already handled
      try{
        await prisma.talentProfile.update({ where: { userId: p.userId }, data: updates });
      }catch(e){ console.error('Update failed for', p.userId, e.message); }
    }

    if(i%10===0) console.log(`Processed ${i}/${profiles.length}`);
  }

  console.log('Filler run complete.');
}

main()
  .catch((e)=>{ console.error(e); process.exit(1); })
  .finally(async()=>{ await prisma.$disconnect(); });
