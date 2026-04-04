import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

// Load env
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '..', '.env') });

const prisma = new PrismaClient();
const TOTAL_PROFILES = parseInt(process.env.TOTAL_PROFILES || '0', 10); // 0 = all
const PER_PROFILE_IMAGES = parseInt(process.env.PER_PROFILE_IMAGES || '3', 10);
const PER_PROFILE_VIDEOS = parseInt(process.env.PER_PROFILE_VIDEOS || '1', 10);

const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY || '';
const YOUTUBE_KEY = process.env.YOUTUBE_API_KEY || '';
const FREESOUND_KEY = process.env.FREESOUND_API_KEY || '';

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function pick(arr) { return arr[Math.floor(Math.random()*arr.length)]; }

async function fetchUnsplashImages(keyword, count=3) {
  if (!UNSPLASH_KEY) return [];
  try {
    const res = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(keyword)}&per_page=${count}`, {
      headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` }
    });
    if (!res.ok) return [];
    const json = await res.json();
    return (json.results || []).map(r => ({ url: r.urls.raw + '&w=1200&q=80', thumbnail: r.urls.small, source: 'unsplash' }));
  } catch (e) { return []; }
}

async function fetchYouTubeVideos(keyword, count=1) {
  if (!YOUTUBE_KEY) return [];
  try {
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(keyword)}&maxResults=${count}&key=${YOUTUBE_KEY}`);
    if (!res.ok) return [];
    const json = await res.json();
    return (json.items || []).map(it => ({ url: `https://www.youtube.com/watch?v=${it.id.videoId}`, thumbnail: it.snippet.thumbnails?.high?.url || it.snippet.thumbnails?.default?.url, source: 'youtube' }));
  } catch (e) { return []; }
}

async function fetchAudioDemoFallback() {
  // Use SoundHelix sample MP3 as fallback
  return [{ title: 'Instrumental Demo', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', description: 'Instrumental demo from SoundHelix', source: 'soundhelix' }];
}

const CATEGORY_KEYWORDS = {
  'Music & Audio': ['music', 'musician', 'concert', 'studio'],
  'Acting & Performance': ['actor', 'on stage', 'theatre', 'film'],
  'Video Production': ['filmmaking', 'cinematography', 'camera'],
  'Voice Over & Dubbing': ['voice over', 'recording studio', 'microphone'],
  'Modeling': ['model', 'fashion', 'photoshoot'],
  'Dancing & Choreography': ['dance', 'choreography', 'dancer'],
  'Sports & Fitness': ['fitness', 'sports', 'gym']
};

async function createIfMissing(profile, item) {
  // avoid duplicates by URL
  const exists = await prisma.portfolioItem.findFirst({ where: { talentProfileId: profile.userId, mediaUrl: item.url } });
  if (exists) return null;
  const data = {
    title: item.title || (item.type === 'IMAGE' ? 'Image' : item.type === 'VIDEO' ? 'Video' : 'Audio'),
    mediaUrl: item.url,
    type: item.type,
    thumbnail: item.thumbnail || undefined,
    description: item.description || undefined,
    talentProfileId: profile.userId
  };
  return prisma.portfolioItem.create({ data });
}

async function enrichProfile(profile) {
  const catName = profile.category?.name || profile.categoryId || 'Other';
  const keywords = CATEGORY_KEYWORDS[catName] || [catName];
  const keyword = pick(keywords);

  // Images
  let images = [];
  if (UNSPLASH_KEY) images = await fetchUnsplashImages(keyword, PER_PROFILE_IMAGES);
  if (images.length < PER_PROFILE_IMAGES) {
    // fill with picsum placeholders
    for (let i = images.length; i < PER_PROFILE_IMAGES; i++) {
      images.push({ url: `https://picsum.photos/seed/${profile.userId}-${i}/1200/800`, thumbnail: `https://picsum.photos/seed/${profile.userId}-${i}/400/300`, source: 'picsum' });
    }
  }

  for (const img of images) {
    await createIfMissing(profile, { url: img.url, thumbnail: img.thumbnail, type: 'IMAGE', title: `Portfolio Image - ${keyword}`, description: `A ${keyword} sample (${img.source})` });
  }

  // Videos
  let videos = [];
  if (YOUTUBE_KEY) videos = await fetchYouTubeVideos(keyword, PER_PROFILE_VIDEOS);
  if (videos.length < PER_PROFILE_VIDEOS) {
    // fallback to sample mp4 from sample-videos
    for (let i = videos.length; i < PER_PROFILE_VIDEOS; i++) {
      videos.push({ url: `https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_${(i%5)+1}.mp4`, thumbnail: `https://picsum.photos/seed/${profile.userId}-vid-${i}/640/360`, source: 'sample' });
    }
  }
  for (const vid of videos) {
    await createIfMissing(profile, { url: vid.url, thumbnail: vid.thumbnail, type: 'VIDEO', title: `Performance Video - ${keyword}`, description: `Video sample (${vid.source})` });
  }

  // Audio (only for music categories)
  if (catName.includes('Music') || catName.includes('Audio') || catName.includes('Voice')) {
    let audioDemos = [];
    if (FREESOUND_KEY) {
      // skip heavy implementation; fallback if no API implemented
      audioDemos = await fetchAudioDemoFallback();
    } else {
      audioDemos = await fetchAudioDemoFallback();
    }
    for (const a of audioDemos) {
      await createIfMissing(profile, { url: a.url, thumbnail: undefined, type: 'AUDIO', title: a.title, description: a.description });
    }
  }
}

async function main() {
  console.log('🔍 Scanning talent profiles to enrich with portfolio items...');
  let profiles = await prisma.talentProfile.findMany({ include: { category: true }, take: TOTAL_PROFILES > 0 ? TOTAL_PROFILES : undefined });
  console.log(`Found ${profiles.length} profiles to process`);

  let processed = 0;
  for (const p of profiles) {
    try {
      await enrichProfile(p);
      processed++;
      process.stdout.write(`\rProcessed: ${processed}/${profiles.length}`);
      await sleep(50);
    } catch (e) {
      console.error('\nError enriching profile', p.userId, e.message || e);
    }
  }

  console.log('\n✅ Done.');
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); });
