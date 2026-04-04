/**
 * Generate 500 Talent Profiles with Real Stock Media
 * Uses: Pexels, Unsplash, Pixabay for images/videos
 * Uses: Pixabay Music & Freesound.org for audio
 * 
 * Run with: node scripts/generate-500-talents.mjs
 * 
 * IMPORTANT: Set environment variables in .env file:
 * - PEXELS_API_KEY: Get from https://www.pexels.com/api/
 * - UNSPLASH_ACCESS_KEY: Get from https://unsplash.com/developers
 * - PIXABAY_API_KEY: Get from https://pixabay.com/api/docs/
 * - FREESOUND_API_KEY: Get from https://freesound.org/apiv2/apply/
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Load environment variables from .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '..', '.env') });

const prisma = new PrismaClient();

// API Keys (loaded from .env file)
const PEXELS_API_KEY = process.env.PEXELS_API_KEY || 'YOUR_PEXELS_KEY';
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || 'YOUR_UNSPLASH_KEY';
const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY || 'YOUR_PIXABAY_KEY';
const FREESOUND_API_KEY = process.env.FREESOUND_API_KEY || 'YOUR_FREESOUND_KEY';
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || 'YOUR_YOUTUBE_KEY';
const SERPAPI_KEY = process.env.SERPAPI_KEY || 'YOUR_SERPAPI_KEY';

// Audio cache to avoid repeated API calls
const audioCache = new Map();

// ============================================================================
// DATA POOLS
// ============================================================================

const LOCATIONS = [
  'London, UK', 'Manchester, UK', 'Birmingham, UK', 'Edinburgh, UK', 'Glasgow, UK',
  'New York, USA', 'Los Angeles, USA', 'Chicago, USA', 'Miami, USA', 'Atlanta, USA',
  'Toronto, Canada', 'Vancouver, Canada', 'Montreal, Canada',
  'Paris, France', 'Berlin, Germany', 'Madrid, Spain', 'Rome, Italy', 'Amsterdam, Netherlands',
  'Sydney, Australia', 'Melbourne, Australia',
  'Tokyo, Japan', 'Seoul, South Korea', 'Singapore',
  'Mumbai, India', 'Dubai, UAE',
  'São Paulo, Brazil', 'Mexico City, Mexico'
];

const FIRST_NAMES_MALE = [
  'James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles',
  'Christopher', 'Daniel', 'Matthew', 'Anthony', 'Mark', 'Donald', 'Steven', 'Paul', 'Andrew', 'Joshua',
  'Kevin', 'Brian', 'George', 'Timothy', 'Ronald', 'Edward', 'Jason', 'Jeffrey', 'Ryan', 'Jacob',
  'Marcus', 'Andre', 'Jamal', 'DeShawn', 'Tyrone', 'Carlos', 'Miguel', 'Raj', 'Ahmed', 'Wei',
  'Takeshi', 'Jin', 'Yusuf', 'Omar', 'Alejandro', 'Diego', 'Luis', 'Rafael', 'Dmitri', 'Sergei'
];

const FIRST_NAMES_FEMALE = [
  'Mary', 'Patricia', 'Jennifer', 'Linda', 'Barbara', 'Elizabeth', 'Susan', 'Jessica', 'Sarah', 'Karen',
  'Lisa', 'Nancy', 'Betty', 'Margaret', 'Sandra', 'Ashley', 'Dorothy', 'Kimberly', 'Emily', 'Donna',
  'Michelle', 'Amanda', 'Melissa', 'Deborah', 'Stephanie', 'Rebecca', 'Sharon', 'Laura', 'Rachel', 'Carolyn',
  'Aisha', 'Fatima', 'Priya', 'Sakura', 'Mei', 'Yuki', 'Seo-yeon', 'Aaliyah', 'Zara', 'Nadia',
  'Isabella', 'Valentina', 'Sofia', 'Camila', 'Luna', 'Aria', 'Chloe', 'Mia', 'Ava', 'Olivia'
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts',
  'Patel', 'Kim', 'Chen', 'Wang', 'Singh', 'Ali', 'Khan', 'Ahmad', 'Sato', 'Tanaka',
  'Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker', 'Schulz', 'Hoffmann',
  'Silva', 'Santos', 'Oliveira', 'Costa', 'Fernandes', 'Rossi', 'Romano', 'Esposito', 'Bianchi', 'Colombo'
];

const LANGUAGES_POOL = [
  { name: 'English', proficiency: 'NATIVE' },
  { name: 'English', proficiency: 'FLUENT' },
  { name: 'Spanish', proficiency: 'NATIVE' },
  { name: 'Spanish', proficiency: 'FLUENT' },
  { name: 'French', proficiency: 'NATIVE' },
  { name: 'French', proficiency: 'FLUENT' },
  { name: 'German', proficiency: 'FLUENT' },
  { name: 'Italian', proficiency: 'FLUENT' },
  { name: 'Portuguese', proficiency: 'NATIVE' },
  { name: 'Mandarin', proficiency: 'NATIVE' },
  { name: 'Mandarin', proficiency: 'FLUENT' },
  { name: 'Japanese', proficiency: 'NATIVE' },
  { name: 'Korean', proficiency: 'NATIVE' },
  { name: 'Arabic', proficiency: 'NATIVE' },
  { name: 'Hindi', proficiency: 'NATIVE' },
  { name: 'Russian', proficiency: 'FLUENT' },
  { name: 'Dutch', proficiency: 'FLUENT' },
  { name: 'Swedish', proficiency: 'FLUENT' },
  { name: 'Polish', proficiency: 'FLUENT' },
  { name: 'Turkish', proficiency: 'FLUENT' }
];

const ETHNICITIES = [
  'WHITE_CAUCASIAN', 'BLACK_AFRICAN', 'ASIAN', 'HISPANIC_LATINO', 
  'MIDDLE_EASTERN', 'MIXED_MULTIRACIAL', 'NATIVE_AMERICAN', 'PACIFIC_ISLANDER', 'OTHER'
];

const BODY_TYPES = ['SLIM', 'ATHLETIC', 'CURVY', 'PLUS_SIZE', 'MUSCULAR', 'AVERAGE'];
const EYE_COLORS = ['Blue', 'Brown', 'Green', 'Hazel', 'Gray', 'Amber', 'Black'];
const HAIR_COLORS = ['Black', 'Brown', 'Blonde', 'Red', 'Auburn', 'Gray', 'White', 'Bald', 'Dyed'];

const EXPERIENCE_LEVELS = [
  'Beginner (0-2 years)',
  'Intermediate (3-5 years)', 
  'Advanced (6-10 years)',
  'Expert (10+ years)'
];

const DISABILITIES = [
  'Wheelchair User',
  'Visual Impairment',
  'Hearing Impairment',
  'Mobility Impairment',
  'Prosthetic Limb',
  'Down Syndrome',
  'Autism',
  'Dwarfism',
  'Albinism'
];

// ============================================================================
// CATEGORY-SPECIFIC DATA WITH MEDIA KEYWORDS
// ============================================================================

const CATEGORY_DATA = {
  'Voice Over & Dubbing': {
    skills: ['Commercial Voice Over', 'E-learning Narration', 'Character Voices', 'IVR Systems', 'Audiobook Narration', 'Documentary Narration', 'Animation Voice', 'Radio Spots', 'Podcast Hosting', 'Voice Acting'],
    imageKeywords: ['microphone', 'recording studio', 'audio equipment', 'headphones', 'sound studio', 'voice recording'],
    videoKeywords: ['voice over', 'recording studio', 'audio production'],
    hasAudio: true,
    audioKeywords: ['voice', 'narration', 'speech', 'spoken'],
    pixabayMusicCategory: 'classical', // Instrumental background
    audioDemos: [
      { title: 'Commercial Demo Reel', genre: 'commercial', freesoundQuery: 'voice commercial' },
      { title: 'Narration Sample', genre: 'narration', freesoundQuery: 'narration speech' },
      { title: 'Character Voice Demo', genre: 'character', freesoundQuery: 'voice character' }
    ],
    bioTemplates: [
      'Professional voice over artist with {years} years of experience in {specialty}. Known for {quality} delivery that brings scripts to life.',
      'Versatile voice talent specializing in {specialty}. My {quality} voice has been featured in campaigns for major brands.',
      'Award-winning voice over professional with expertise in {specialty}. Delivering {quality} performances since {startYear}.'
    ],
    qualities: ['warm and engaging', 'authoritative yet approachable', 'dynamic and versatile', 'smooth and professional', 'energetic and youthful'],
    specialties: ['commercials and corporate narration', 'e-learning and educational content', 'audiobooks and documentaries', 'video games and animation', 'IVR and phone systems']
  },
  
  'Translation & Localization': {
    skills: ['Document Translation', 'Website Localization', 'Subtitling', 'Technical Translation', 'Legal Translation', 'Medical Translation', 'Literary Translation', 'Transcreation', 'Quality Assurance', 'CAT Tools'],
    imageKeywords: ['translation', 'languages', 'documents', 'international', 'dictionary', 'writing'],
    videoKeywords: ['translation', 'languages', 'international business'],
    hasAudio: false,
    bioTemplates: [
      'Certified translator with {years} years specializing in {specialty}. Fluent in {languages} with deep cultural understanding.',
      'Professional linguist offering {specialty} services. Committed to accuracy and cultural adaptation in every project.',
      'Expert translator with background in {specialty}. Helping businesses communicate across cultures for {years} years.'
    ],
    qualities: ['meticulous and accurate', 'culturally sensitive', 'deadline-focused', 'detail-oriented', 'professionally certified'],
    specialties: ['legal and financial documents', 'technical and medical content', 'marketing and creative content', 'software and app localization', 'academic and literary works']
  },
  
  'Content Creation': {
    skills: ['Blog Writing', 'Copywriting', 'Social Media Content', 'Video Scripting', 'SEO Writing', 'Email Marketing', 'Content Strategy', 'Brand Storytelling', 'Technical Writing', 'Creative Writing'],
    imageKeywords: ['writing', 'laptop', 'content creation', 'blogging', 'social media', 'creative workspace'],
    videoKeywords: ['content creation', 'writing', 'blogging'],
    hasAudio: false,
    bioTemplates: [
      'Creative content specialist with {years} years crafting compelling {specialty}. Words are my passion, engagement is my goal.',
      'Strategic content creator focused on {specialty}. Helping brands tell their stories and connect with audiences.',
      'Experienced writer and content strategist specializing in {specialty}. Creating content that converts since {startYear}.'
    ],
    qualities: ['creative and engaging', 'strategic and data-driven', 'versatile and adaptable', 'SEO-savvy', 'brand-focused'],
    specialties: ['blog and article writing', 'social media content', 'email marketing campaigns', 'website copy', 'video and podcast scripts']
  },
  
  'Music & Audio': {
    skills: ['Singing', 'Songwriting', 'Music Composition', 'Live Performance', 'Session Musician', 'Backup Vocals', 'Music Theory', 'Sight Reading', 'Improvisation', 'Music Production'],
    imageKeywords: ['musician', 'singer', 'concert', 'guitar', 'piano', 'drums', 'performance', 'music studio'],
    videoKeywords: ['music performance', 'concert', 'singer', 'musician'],
    hasAudio: true,
    audioKeywords: ['music', 'song', 'instrumental', 'melody'],
    pixabayMusicCategory: 'pop', // Will be varied based on specialty
    audioDemos: [
      { title: 'Original Song Demo', genre: 'original', freesoundQuery: 'music song', pixabayCategory: 'pop' },
      { title: 'Live Performance Recording', genre: 'live', freesoundQuery: 'live music', pixabayCategory: 'rock' },
      { title: 'Studio Session Sample', genre: 'studio', freesoundQuery: 'studio recording', pixabayCategory: 'jazz' }
    ],
    bioTemplates: [
      'Professional musician with {years} years performing {specialty}. Passionate about creating memorable musical experiences.',
      'Versatile artist specializing in {specialty}. My {quality} style has graced stages from local venues to international festivals.',
      'Dedicated musician and {specialty} performer. Bringing {quality} energy to every performance since {startYear}.'
    ],
    qualities: ['soulful and emotional', 'energetic and dynamic', 'smooth and refined', 'raw and authentic', 'innovative and fresh'],
    specialties: ['pop and contemporary music', 'rock and alternative', 'jazz and blues', 'classical and orchestral', 'electronic and EDM']
  },
  
  'Video Production': {
    skills: ['Video Editing', 'Cinematography', 'Color Grading', 'Motion Graphics', 'Sound Design', 'Storyboarding', 'Directing', 'Camera Operation', 'Drone Filming', 'Live Streaming'],
    imageKeywords: ['video camera', 'film production', 'cinematography', 'video editing', 'film set', 'camera equipment'],
    videoKeywords: ['filmmaking', 'video production', 'cinematography'],
    hasAudio: false,
    bioTemplates: [
      'Creative video professional with {years} years in {specialty}. Crafting visual stories that captivate and inspire.',
      'Award-winning videographer specializing in {specialty}. Combining technical expertise with artistic vision.',
      'Passionate filmmaker focused on {specialty}. Delivering {quality} content that exceeds expectations since {startYear}.'
    ],
    qualities: ['cinematic and polished', 'creative and innovative', 'technically precise', 'story-driven', 'visually stunning'],
    specialties: ['commercial and corporate video', 'documentary and narrative', 'music videos and creative content', 'event and wedding videography', 'social media and digital content']
  },
  
  'Acting & Performance': {
    skills: ['Method Acting', 'Improvisation', 'Stage Combat', 'Dialect Work', 'Physical Theatre', 'Emotional Range', 'Memorization', 'Scene Study', 'Audition Technique', 'On-Camera Acting'],
    imageKeywords: ['actor', 'theatre', 'performance', 'stage', 'drama', 'acting', 'performer'],
    videoKeywords: ['acting', 'theater performance', 'drama', 'monologue'],
    hasAudio: true,
    audioKeywords: ['monologue', 'speech', 'drama', 'voice'],
    pixabayMusicCategory: 'film',
    audioDemos: [
      { title: 'Dramatic Monologue', genre: 'drama', freesoundQuery: 'dramatic speech', pixabayCategory: 'film' },
      { title: 'Voice Reel', genre: 'voice', freesoundQuery: 'voice acting', pixabayCategory: 'film' }
    ],
    bioTemplates: [
      'Trained actor with {years} years of experience in {specialty}. Bringing authenticity and depth to every role.',
      'Versatile performer specializing in {specialty}. My {quality} approach has led to roles in film, TV, and theatre.',
      'Passionate actor dedicated to {specialty}. Creating memorable characters and compelling performances since {startYear}.'
    ],
    qualities: ['emotionally versatile', 'physically expressive', 'classically trained', 'naturally charismatic', 'intensely focused'],
    specialties: ['film and television', 'theatre and stage', 'commercial and industrial', 'voice and motion capture', 'drama and comedy']
  },
  
  'Modeling': {
    skills: ['Runway Walking', 'Posing', 'Facial Expressions', 'Body Language', 'Photo Shoots', 'Commercial Modeling', 'Editorial Modeling', 'Fitness Modeling', 'Parts Modeling', 'Brand Representation'],
    imageKeywords: ['model', 'fashion', 'photoshoot', 'portrait', 'runway', 'fashion photography'],
    videoKeywords: ['fashion', 'model', 'runway', 'photoshoot'],
    hasAudio: false,
    bioTemplates: [
      'Professional model with {years} years in {specialty}. Bringing {quality} presence to every shoot and runway.',
      'Experienced model specializing in {specialty}. Featured in campaigns for leading brands and publications.',
      'Versatile model known for {specialty} work. Combining professionalism with {quality} aesthetics since {startYear}.'
    ],
    qualities: ['striking and photogenic', 'elegant and sophisticated', 'edgy and contemporary', 'classic and timeless', 'dynamic and versatile'],
    specialties: ['fashion and editorial', 'commercial and lifestyle', 'fitness and athletic', 'plus-size and inclusive', 'glamour and beauty']
  },
  
  'Dancing & Choreography': {
    skills: ['Ballet', 'Hip Hop', 'Contemporary', 'Jazz', 'Latin Dance', 'Ballroom', 'Street Dance', 'Choreography', 'Dance Teaching', 'Performance'],
    imageKeywords: ['dancer', 'ballet', 'dance performance', 'hip hop dance', 'contemporary dance', 'dance studio'],
    videoKeywords: ['dance', 'ballet', 'hip hop', 'contemporary dance'],
    hasAudio: true,
    audioKeywords: ['dance music', 'beat', 'rhythm'],
    pixabayMusicCategory: 'dance',
    audioDemos: [
      { title: 'Choreography Reel Music', genre: 'dance', freesoundQuery: 'dance beat', pixabayCategory: 'dance' },
      { title: 'Performance Track', genre: 'performance', freesoundQuery: 'music performance', pixabayCategory: 'pop' }
    ],
    bioTemplates: [
      'Professional dancer with {years} years mastering {specialty}. Every movement tells a story.',
      'Trained dancer and choreographer specializing in {specialty}. Bringing {quality} artistry to every performance.',
      'Passionate dancer dedicated to {specialty}. Creating and performing innovative choreography since {startYear}.'
    ],
    qualities: ['technically precise', 'emotionally expressive', 'powerfully dynamic', 'gracefully fluid', 'creatively innovative'],
    specialties: ['contemporary and modern', 'ballet and classical', 'hip hop and street', 'Latin and ballroom', 'commercial and music video']
  },
  
  'Beauty & Wellness': {
    skills: ['Makeup Application', 'Skincare', 'Hair Styling', 'Nail Art', 'Beauty Consulting', 'Color Theory', 'Bridal Makeup', 'Special Effects', 'Wellness Coaching', 'Nutrition'],
    imageKeywords: ['makeup artist', 'beauty', 'cosmetics', 'skincare', 'spa', 'wellness'],
    videoKeywords: ['makeup tutorial', 'beauty', 'skincare routine'],
    hasAudio: false,
    bioTemplates: [
      'Beauty professional with {years} years specializing in {specialty}. Enhancing natural beauty with expert techniques.',
      'Certified {specialty} artist bringing out the best in every client. Known for {quality} results.',
      'Passionate beauty expert focused on {specialty}. Helping clients feel confident and beautiful since {startYear}.'
    ],
    qualities: ['naturally enhancing', 'trendsetting', 'client-focused', 'technically skilled', 'creatively inspired'],
    specialties: ['bridal and special occasion', 'film and television', 'editorial and fashion', 'natural and organic', 'special effects and theatrical']
  },
  
  'Sports & Fitness': {
    skills: ['Personal Training', 'Sports Coaching', 'Nutrition Planning', 'Injury Prevention', 'Strength Training', 'Cardio Training', 'Flexibility Training', 'Sports Performance', 'Group Fitness', 'Online Coaching'],
    imageKeywords: ['fitness', 'gym', 'personal trainer', 'exercise', 'sports', 'athlete', 'workout'],
    videoKeywords: ['fitness', 'workout', 'exercise', 'personal training'],
    hasAudio: false,
    bioTemplates: [
      'Certified fitness professional with {years} years in {specialty}. Transforming lives through health and fitness.',
      'Dedicated trainer specializing in {specialty}. Helping clients achieve their goals with {quality} programs.',
      'Experienced coach focused on {specialty}. Building stronger, healthier individuals since {startYear}.'
    ],
    qualities: ['motivating and inspiring', 'results-driven', 'scientifically based', 'personally tailored', 'holistically focused'],
    specialties: ['strength and conditioning', 'weight loss and body transformation', 'sports-specific training', 'rehabilitation and recovery', 'group and corporate fitness']
  },
  
  'Stunts': {
    skills: ['Fight Choreography', 'High Falls', 'Wire Work', 'Vehicle Stunts', 'Fire Burns', 'Weapons Handling', 'Martial Arts', 'Gymnastics', 'Precision Driving', 'Water Stunts'],
    imageKeywords: ['stunt performer', 'action', 'martial arts', 'stuntman', 'action film', 'fight scene'],
    videoKeywords: ['stunt', 'action scene', 'fight choreography', 'martial arts'],
    hasAudio: false,
    bioTemplates: [
      'Professional stunt performer with {years} years in {specialty}. Safety-focused professional bringing action to life.',
      'Trained stunt coordinator specializing in {specialty}. Featured in major {quality} productions.',
      'Experienced stunt professional dedicated to {specialty}. Delivering thrilling, safe action since {startYear}.'
    ],
    qualities: ['film and television', 'blockbuster', 'independent', 'streaming', 'commercial'],
    specialties: ['fight scenes and martial arts', 'high falls and wire work', 'vehicle stunts and driving', 'fire and pyrotechnics', 'water and underwater']
  },
  
  'Magic & Illusion': {
    skills: ['Sleight of Hand', 'Stage Magic', 'Close-up Magic', 'Mentalism', 'Escape Acts', 'Card Magic', 'Illusion Design', 'Comedy Magic', 'Street Magic', 'Corporate Magic'],
    imageKeywords: ['magician', 'magic show', 'illusion', 'cards', 'magic trick', 'performer'],
    videoKeywords: ['magic show', 'illusion', 'magic trick', 'magician'],
    hasAudio: false,
    bioTemplates: [
      'Professional magician with {years} years creating {specialty} experiences. Master of mystery and wonder.',
      'Acclaimed illusionist specializing in {specialty}. Bringing {quality} magic to audiences worldwide.',
      'Award-winning magician focused on {specialty}. Defying reality and delighting audiences since {startYear}.'
    ],
    qualities: ['mind-bending', 'spectacular', 'intimate', 'family-friendly', 'sophisticated'],
    specialties: ['stage illusions', 'close-up magic', 'mentalism and mind reading', 'comedy magic', 'corporate entertainment']
  },
  
  'Circus Arts': {
    skills: ['Acrobatics', 'Aerial Silks', 'Trapeze', 'Juggling', 'Contortion', 'Fire Performance', 'Clowning', 'Tightrope', 'Hula Hooping', 'Stilt Walking'],
    imageKeywords: ['circus', 'acrobat', 'aerial', 'trapeze', 'juggler', 'performer', 'circus arts'],
    videoKeywords: ['circus performance', 'acrobatics', 'aerial arts', 'juggling'],
    hasAudio: false,
    bioTemplates: [
      'Professional circus artist with {years} years in {specialty}. Pushing physical limits while inspiring awe.',
      'Trained performer specializing in {specialty}. Bringing {quality} artistry to stages and events.',
      'Dedicated circus performer focused on {specialty}. Creating spectacular moments since {startYear}.'
    ],
    qualities: ['breathtaking', 'elegant', 'daring', 'mesmerizing', 'joyful'],
    specialties: ['aerial arts and silks', 'acrobatics and tumbling', 'juggling and object manipulation', 'fire and danger acts', 'clowning and physical comedy']
  },
  
  'Comedy': {
    skills: ['Stand-up Comedy', 'Improvisation', 'Sketch Writing', 'Character Comedy', 'Observational Humor', 'Physical Comedy', 'Comedic Timing', 'Crowd Work', 'Comedy Writing', 'Hosting'],
    imageKeywords: ['comedian', 'stand up', 'comedy show', 'microphone', 'stage', 'performer'],
    videoKeywords: ['stand up comedy', 'comedy show', 'comedian', 'funny'],
    hasAudio: true,
    audioKeywords: ['comedy', 'funny', 'standup', 'laugh'],
    pixabayMusicCategory: 'comedy',
    audioDemos: [
      { title: 'Stand-up Set Sample', genre: 'standup', freesoundQuery: 'comedy standup', pixabayCategory: 'comedy' },
      { title: 'Podcast Appearance', genre: 'podcast', freesoundQuery: 'podcast talk', pixabayCategory: 'comedy' }
    ],
    bioTemplates: [
      'Stand-up comedian with {years} years making audiences laugh with {specialty} comedy. Laughter is the best medicine.',
      'Comedy performer specializing in {specialty}. My {quality} style has audiences rolling.',
      'Professional comedian focused on {specialty}. Spreading joy and laughter since {startYear}.'
    ],
    qualities: ['observational', 'absurdist', 'satirical', 'relatable', 'edgy'],
    specialties: ['observational comedy', 'character and sketch', 'improvisation', 'political and social commentary', 'family-friendly entertainment']
  },
  
  'Photography (Commercial)': {
    skills: ['Product Photography', 'Portrait Photography', 'Fashion Photography', 'Event Photography', 'Food Photography', 'Architectural Photography', 'Photo Editing', 'Lighting', 'Composition', 'Post-Processing'],
    imageKeywords: ['photographer', 'camera', 'photography studio', 'photo shoot', 'professional camera'],
    videoKeywords: ['photography', 'photo shoot', 'behind the scenes'],
    hasAudio: false,
    bioTemplates: [
      'Professional photographer with {years} years specializing in {specialty}. Capturing moments that tell stories.',
      'Award-winning photographer focused on {specialty}. Creating {quality} images that stand out.',
      'Experienced photographer dedicated to {specialty}. Crafting visual excellence since {startYear}.'
    ],
    qualities: ['stunning', 'authentic', 'creative', 'polished', 'impactful'],
    specialties: ['product and commercial', 'portrait and headshot', 'fashion and editorial', 'event and wedding', 'food and lifestyle']
  },
  
  'Graphic Design': {
    skills: ['Logo Design', 'Brand Identity', 'Print Design', 'Digital Design', 'UI/UX Design', 'Illustration', 'Typography', 'Packaging Design', 'Motion Graphics', 'Adobe Creative Suite'],
    imageKeywords: ['graphic design', 'designer', 'creative', 'artwork', 'digital art', 'design studio'],
    videoKeywords: ['graphic design', 'design process', 'creative'],
    hasAudio: false,
    bioTemplates: [
      'Creative graphic designer with {years} years in {specialty}. Transforming ideas into visual excellence.',
      'Experienced designer specializing in {specialty}. Creating {quality} designs that communicate and convert.',
      'Passionate designer focused on {specialty}. Building brands and visual identities since {startYear}.'
    ],
    qualities: ['bold', 'minimalist', 'vibrant', 'sophisticated', 'innovative'],
    specialties: ['brand identity and logos', 'print and packaging', 'digital and web', 'illustration and art', 'UI/UX and interactive']
  },
  
  'Music Production': {
    skills: ['Music Production', 'Mixing', 'Mastering', 'Beat Making', 'Sound Design', 'Recording', 'Audio Engineering', 'DAW Proficiency', 'Arrangement', 'Music Theory'],
    imageKeywords: ['music producer', 'recording studio', 'mixing console', 'audio equipment', 'producer'],
    videoKeywords: ['music production', 'studio session', 'beat making'],
    hasAudio: true,
    audioKeywords: ['beats', 'production', 'electronic', 'instrumental'],
    pixabayMusicCategory: 'electronic',
    audioDemos: [
      { title: 'Production Demo Reel', genre: 'production', freesoundQuery: 'beat electronic', pixabayCategory: 'electronic' },
      { title: 'Mixed Track Sample', genre: 'mixing', freesoundQuery: 'music mix', pixabayCategory: 'dance' },
      { title: 'Original Beat', genre: 'beats', freesoundQuery: 'hip hop beat', pixabayCategory: 'hip hop' }
    ],
    bioTemplates: [
      'Music producer with {years} years creating {specialty}. Crafting sounds that move people.',
      'Experienced audio engineer specializing in {specialty}. Delivering {quality} results for artists worldwide.',
      'Creative producer focused on {specialty}. Shaping the sound of tomorrow since {startYear}.'
    ],
    qualities: ['professional', 'chart-ready', 'unique', 'polished', 'cutting-edge'],
    specialties: ['pop and contemporary', 'hip hop and urban', 'electronic and EDM', 'rock and alternative', 'acoustic and organic']
  },
  
  'Influencer/Content Creator': {
    skills: ['Social Media Strategy', 'Content Creation', 'Video Production', 'Photography', 'Brand Partnerships', 'Community Building', 'Trend Analysis', 'Engagement', 'Live Streaming', 'Storytelling'],
    imageKeywords: ['influencer', 'content creator', 'social media', 'blogger', 'vlogger', 'instagram'],
    videoKeywords: ['vlog', 'content creator', 'influencer', 'social media'],
    hasAudio: true,
    audioKeywords: ['podcast', 'vlog', 'speech'],
    pixabayMusicCategory: 'pop',
    audioDemos: [
      { title: 'Podcast Intro', genre: 'podcast', freesoundQuery: 'podcast intro', pixabayCategory: 'pop' },
      { title: 'Vlog Background Music', genre: 'vlog', freesoundQuery: 'vlog music', pixabayCategory: 'electronic' }
    ],
    bioTemplates: [
      'Digital creator with {years} years building audiences around {specialty}. Connecting brands with engaged communities.',
      'Social media influencer specializing in {specialty}. Creating {quality} content that resonates.',
      'Content creator focused on {specialty}. Growing authentic audiences and partnerships since {startYear}.'
    ],
    qualities: ['engaging', 'authentic', 'trend-setting', 'relatable', 'viral'],
    specialties: ['lifestyle and fashion', 'tech and gaming', 'fitness and wellness', 'food and travel', 'beauty and skincare']
  },
  
  'Hair & Makeup (Professional)': {
    skills: ['Film Makeup', 'Special Effects', 'Prosthetics', 'Wig Styling', 'Period Makeup', 'Bridal Makeup', 'Fashion Makeup', 'Hair Styling', 'Color Theory', 'Character Design'],
    imageKeywords: ['makeup artist', 'hair stylist', 'beauty', 'film makeup', 'special effects makeup'],
    videoKeywords: ['makeup tutorial', 'hair styling', 'special effects makeup'],
    hasAudio: false,
    bioTemplates: [
      'Professional makeup artist with {years} years in {specialty}. Creating transformative looks for film and television.',
      'Experienced hair and makeup artist specializing in {specialty}. Bringing characters to life with {quality} artistry.',
      'Dedicated artist focused on {specialty}. Enhancing productions with expert work since {startYear}.'
    ],
    qualities: ['award-winning', 'detail-oriented', 'innovative', 'time-efficient', 'collaborative'],
    specialties: ['film and television', 'special effects and prosthetics', 'bridal and event', 'editorial and fashion', 'theatre and period']
  },
  
  'Stage Crew/Technician': {
    skills: ['Lighting Design', 'Sound Engineering', 'Stage Management', 'Rigging', 'Set Construction', 'Video Operation', 'Audio Mixing', 'Equipment Maintenance', 'Safety Protocols', 'Event Production'],
    imageKeywords: ['stage lighting', 'sound equipment', 'stage crew', 'concert', 'event production'],
    videoKeywords: ['stage setup', 'concert production', 'lighting', 'sound'],
    hasAudio: false,
    bioTemplates: [
      'Technical professional with {years} years in {specialty}. Bringing productions to life behind the scenes.',
      'Experienced technician specializing in {specialty}. Ensuring {quality} technical execution for every event.',
      'Dedicated crew member focused on {specialty}. Supporting world-class productions since {startYear}.'
    ],
    qualities: ['flawless', 'reliable', 'safe', 'efficient', 'professional'],
    specialties: ['lighting design and operation', 'sound engineering and mixing', 'stage management', 'rigging and set construction', 'video and projection']
  },
  
  'Animation': {
    skills: ['2D Animation', '3D Animation', 'Motion Graphics', 'Character Animation', 'Storyboarding', 'Rigging', 'Compositing', 'Visual Effects', 'Stop Motion', 'Digital Art'],
    imageKeywords: ['animation', 'animator', '3d modeling', 'digital art', 'motion graphics'],
    videoKeywords: ['animation', '3d animation', 'motion graphics', 'vfx'],
    hasAudio: false,
    bioTemplates: [
      'Creative animator with {years} years bringing {specialty} to life. Where imagination meets technology.',
      'Experienced motion artist specializing in {specialty}. Creating {quality} animations for diverse clients.',
      'Dedicated animator focused on {specialty}. Crafting visual stories through animation since {startYear}.'
    ],
    qualities: ['captivating', 'fluid', 'detailed', 'expressive', 'cutting-edge'],
    specialties: ['character animation', '2D and traditional', '3D and CGI', 'motion graphics and titles', 'visual effects and compositing']
  }
};

// ============================================================================
// MEDIA FETCHING FUNCTIONS
// ============================================================================

// Global flag to disable YouTube if quota exceeded or blocked
let youtubeDisabled = false;

// YouTube API - Videos
async function fetchYouTubeVideos(query, count = 2) {
  if (youtubeDisabled || !YOUTUBE_API_KEY || YOUTUBE_API_KEY === 'YOUR_YOUTUBE_KEY') return [];
  
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=${count}&key=${YOUTUBE_API_KEY}`
    );
    
    if (!response.ok) {
      if (response.status === 403) {
        console.warn('⚠️ YouTube API 403 Forbidden - Disabling YouTube for this session.');
        youtubeDisabled = true;
      }
      const errorText = await response.text();
      throw new Error(`YouTube API error: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const data = await response.json();
    if (!data.items) return [];
    
    return data.items.map(item => ({
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      thumbnail: item.snippet.thumbnails.high.url,
      source: 'youtube',
      title: item.snippet.title,
      description: item.snippet.description,
      duration: 180 // YouTube API doesn't return duration in search, assume 3 mins
    }));
  } catch (error) {
    if (!youtubeDisabled) {
      console.warn(`YouTube API failed for "${query}":`, error.message);
    }
    return [];
  }
}

// LoremFlickr - Robust Fallback Images
function generateLoremFlickrImages(query, count = 4) {
  const images = [];
  // Clean query for URL (remove spaces, special chars)
  const keywords = query.replace(/[^a-zA-Z0-9 ]/g, '').split(' ').join(',');
  
  for (let i = 0; i < count; i++) {
    const seed = Math.floor(Math.random() * 10000);
    images.push({
      url: `https://loremflickr.com/800/600/${keywords}?lock=${seed + i}`,
      thumbnail: `https://loremflickr.com/400/300/${keywords}?lock=${seed + i}`,
      source: 'loremflickr',
      photographer: 'LoremFlickr'
    });
  }
  return images;
}

// Pexels API - Images
async function fetchPexelsImages(query, count = 5, page = 1) {
  if (!PEXELS_API_KEY || PEXELS_API_KEY === 'YOUR_PEXELS_KEY') {
    return generateFallbackImages(query, count);
  }
  
  try {
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${count}&page=${page}`,
      {
        headers: { Authorization: PEXELS_API_KEY }
      }
    );
    
    if (!response.ok) throw new Error('Pexels API error');
    
    const data = await response.json();
    return data.photos.map(photo => ({
      url: photo.src.large,
      thumbnail: photo.src.medium,
      source: 'pexels',
      photographer: photo.photographer
    }));
  } catch (error) {
    console.warn(`Pexels API failed for "${query}":`, error.message);
    return generateFallbackImages(query, count);
  }
}

// Pexels API - Videos
async function fetchPexelsVideos(query, count = 2) {
  if (!PEXELS_API_KEY || PEXELS_API_KEY === 'YOUR_PEXELS_KEY') {
    return generateFallbackVideos(query, count);
  }
  
  try {
    const response = await fetch(
      `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=${count}`,
      {
        headers: { Authorization: PEXELS_API_KEY }
      }
    );
    
    if (!response.ok) throw new Error('Pexels Video API error');
    
    const data = await response.json();
    return data.videos.map(video => ({
      url: video.video_files.find(f => f.quality === 'hd' || f.quality === 'sd')?.link || video.video_files[0]?.link,
      thumbnail: video.image,
      source: 'pexels',
      duration: video.duration
    }));
  } catch (error) {
    console.warn(`Pexels Video API failed for "${query}":`, error.message);
    return generateFallbackVideos(query, count);
  }
}

// Unsplash API - Images
async function fetchUnsplashImages(query, count = 5) {
  if (!UNSPLASH_ACCESS_KEY || UNSPLASH_ACCESS_KEY === 'YOUR_UNSPLASH_KEY') {
    return [];
  }
  
  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${count}`,
      {
        headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` }
      }
    );
    
    if (!response.ok) throw new Error('Unsplash API error');
    
    const data = await response.json();
    return data.results.map(photo => ({
      url: photo.urls.regular,
      thumbnail: photo.urls.small,
      source: 'unsplash',
      photographer: photo.user.name
    }));
  } catch (error) {
    console.warn(`Unsplash API failed for "${query}":`, error.message);
    return [];
  }
}

// Pixabay API - Images and Videos
async function fetchPixabayMedia(query, type = 'photo', count = 5) {
  if (!PIXABAY_API_KEY || PIXABAY_API_KEY === 'YOUR_PIXABAY_KEY') {
    return [];
  }
  
  try {
    const endpoint = type === 'video' ? 'videos' : '';
    const response = await fetch(
      `https://pixabay.com/api/${endpoint}?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(query)}&per_page=${count}`
    );
    
    if (!response.ok) throw new Error('Pixabay API error');
    
    const data = await response.json();
    
    if (type === 'video') {
      return data.hits.map(hit => ({
        url: hit.videos.medium?.url || hit.videos.small?.url,
        thumbnail: `https://i.vimeocdn.com/video/${hit.picture_id}_640x360.jpg`,
        source: 'pixabay',
        duration: hit.duration
      }));
    }
    
    return data.hits.map(hit => ({
      url: hit.largeImageURL,
      thumbnail: hit.previewURL,
      source: 'pixabay',
      photographer: hit.user
    }));
  } catch (error) {
    console.warn(`Pixabay API failed for "${query}":`, error.message);
    return [];
  }
}

// Fallback image generation using placeholder services
function generateFallbackImages(query, count = 5) {
  const images = [];
  const baseKeyword = query.split(' ')[0];
  
  for (let i = 0; i < count; i++) {
    const seed = Math.random().toString(36).substring(7);
    images.push({
      // Using picsum.photos as it's reliable and doesn't need API key
      url: `https://picsum.photos/seed/${baseKeyword}${seed}/800/600`,
      thumbnail: `https://picsum.photos/seed/${baseKeyword}${seed}/400/300`,
      source: 'picsum',
      photographer: 'Stock Photo'
    });
  }
  
  return images;
}

// Fallback video generation
function generateFallbackVideos(query, count = 2) {
  // Using sample video URLs that work universally
  const sampleVideos = [
    { url: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4', thumbnail: 'https://picsum.photos/seed/video1/640/360' },
    { url: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_2mb.mp4', thumbnail: 'https://picsum.photos/seed/video2/640/360' }
  ];
  
  return sampleVideos.slice(0, count).map(v => ({
    ...v,
    source: 'sample',
    duration: 30
  }));
}

// ============================================================================
// AUDIO API FUNCTIONS - Pixabay Music & Freesound
// ============================================================================

// Pixabay Music API - Free music tracks
// Categories: backgrounds, beats, classical, comedy, country, dance, disco, 
// electronic, film, funk, hip hop, holiday, jazz, pop, reggae, rnb, rock, 
// soul, soundtracks, world
async function fetchPixabayMusic(category = 'pop', count = 3) {
  if (!PIXABAY_API_KEY || PIXABAY_API_KEY === 'YOUR_PIXABAY_KEY') {
    return [];
  }
  
  const cacheKey = `pixabay_music_${category}`;
  if (audioCache.has(cacheKey)) {
    const cached = audioCache.get(cacheKey);
    // Return random subset from cache
    return getRandomItems(cached, count);
  }
  
  try {
    const response = await fetch(
      `https://pixabay.com/api/music/?key=${PIXABAY_API_KEY}&category=${encodeURIComponent(category)}&per_page=50`
    );
    
    if (!response.ok) throw new Error('Pixabay Music API error');
    
    const data = await response.json();
    const tracks = data.hits.map(hit => ({
      url: hit.audio,
      title: hit.title,
      duration: hit.duration,
      source: 'pixabay',
      user: hit.user,
      tags: hit.tags
    }));
    
    // Cache the results
    audioCache.set(cacheKey, tracks);
    
    return getRandomItems(tracks, count);
  } catch (error) {
    console.warn(`Pixabay Music API failed for "${category}":`, error.message);
    return [];
  }
}

// Freesound API - Sound effects and audio samples
// Requires OAuth2 or API key with token
async function fetchFreesoundAudio(query, count = 3) {
  if (!FREESOUND_API_KEY || FREESOUND_API_KEY === 'YOUR_FREESOUND_KEY') {
    return [];
  }
  
  const cacheKey = `freesound_${query}`;
  if (audioCache.has(cacheKey)) {
    const cached = audioCache.get(cacheKey);
    return getRandomItems(cached, count);
  }
  
  try {
    // Search for sounds
    const searchResponse = await fetch(
      `https://freesound.org/apiv2/search/text/?query=${encodeURIComponent(query)}&filter=duration:[5 TO 180]&fields=id,name,duration,previews,username,tags&page_size=30&token=${FREESOUND_API_KEY}`
    );
    
    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      throw new Error(`Freesound API error: ${searchResponse.status} ${searchResponse.statusText} - ${errorText}`);
    }
    
    const data = await searchResponse.json();
    const sounds = data.results.map(sound => ({
      url: sound.previews['preview-hq-mp3'] || sound.previews['preview-lq-mp3'],
      title: sound.name,
      duration: Math.round(sound.duration),
      source: 'freesound',
      user: sound.username,
      tags: sound.tags?.slice(0, 5) || []
    }));
    
    // Cache the results
    audioCache.set(cacheKey, sounds);
    
    return getRandomItems(sounds, count);
  } catch (error) {
    console.warn(`Freesound API failed for "${query}":`, error.message);
    return [];
  }
}

// Fallback audio samples - categorized by genre/type
const FALLBACK_AUDIO = {
  // Voice/Speech samples
  voice: [
    'https://www2.cs.uic.edu/~i101/SoundFiles/gettysburg.wav',
    'https://www2.cs.uic.edu/~i101/SoundFiles/gettysburg10.wav'
  ],
  // Music samples from various free sources
  music: [
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3'
  ],
  // Electronic/beats
  electronic: [
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3'
  ],
  // Comedy/spoken word
  comedy: [
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3'
  ]
};

// SerpApi - Google Images
async function fetchSerpApiImages(query, count = 4) {
  if (!SERPAPI_KEY || SERPAPI_KEY === 'YOUR_SERPAPI_KEY') {
    return [];
  }

  const cacheKey = `serpapi_${query}`;
  // Simple in-memory cache check (if implemented globally)
  // if (imageCache.has(cacheKey)) return getRandomItems(imageCache.get(cacheKey), count);

  try {
    const response = await fetch(
      `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&tbm=isch&api_key=${SERPAPI_KEY}&ijn=0`
    );

    if (!response.ok) throw new Error('SerpApi error');

    const data = await response.json();
    if (!data.images_results) return [];

    const images = data.images_results.map(img => ({
      url: img.original,
      thumbnail: img.thumbnail,
      source: 'google',
      photographer: img.source || 'Google Images',
      width: img.original_width,
      height: img.original_height
    }));

    return getRandomItems(images, count);
  } catch (error) {
    console.warn(`SerpApi failed for "${query}":`, error.message);
    return [];
  }
}

// Main function to fetch audio demos with real APIs
async function fetchAudioDemos(categoryData, talentName, index = 0) {
  if (!categoryData.hasAudio) return [];
  
  const demos = categoryData.audioDemos || [];
  const audioDemos = [];
  
  for (let i = 0; i < demos.length; i++) {
    const demo = demos[i];
    let audioUrl = null;
    let audioSource = 'fallback';
    
    // SKIP Pixabay Music as requested
    /*
    if (demo.pixabayCategory || categoryData.pixabayMusicCategory) {
      const pixabayTracks = await fetchPixabayMusic(
        demo.pixabayCategory || categoryData.pixabayMusicCategory, 
        5
      );
      if (pixabayTracks.length > 0) {
        const track = pixabayTracks[i % pixabayTracks.length];
        audioUrl = track.url;
        audioSource = 'pixabay';
      }
    }
    */
    
    // Try Freesound
    if (!audioUrl && demo.freesoundQuery) {
      console.log(`   Trying Freesound for: ${demo.freesoundQuery}`);
      const freesoundTracks = await fetchFreesoundAudio(demo.freesoundQuery, 5);
      if (freesoundTracks.length > 0) {
        const track = freesoundTracks[i % freesoundTracks.length];
        audioUrl = track.url;
        audioSource = 'freesound';
      } else {
        console.log(`   No Freesound tracks found for: ${demo.freesoundQuery}`);
      }
    }
    
    // Use fallback if no API worked
    if (!audioUrl) {
      const fallbackType = categoryData.audioKeywords?.includes('voice') ? 'voice' : 
                           categoryData.audioKeywords?.includes('electronic') ? 'electronic' :
                           categoryData.audioKeywords?.includes('comedy') ? 'comedy' : 'music';
      const fallbackList = FALLBACK_AUDIO[fallbackType];
      audioUrl = fallbackList[(index + i) % fallbackList.length];
    }
    
    audioDemos.push({
      title: `${talentName} - ${demo.title}`,
      url: audioUrl,
      type: 'AUDIO',
      description: `${demo.genre.charAt(0).toUpperCase() + demo.genre.slice(1)} audio demo (${audioSource})`
    });
  }
  
  return audioDemos;
}

// Legacy function for backward compatibility (synchronous fallback)
function generateAudioDemos(categoryData, talentName) {
  if (!categoryData.hasAudio) return [];
  
  const audioDemos = [];
  const demos = categoryData.audioDemos || [];
  
  // Using free audio samples from SoundHelix and similar services
  const audioSamples = [
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3'
  ];
  
  demos.forEach((demo, index) => {
    audioDemos.push({
      title: `${talentName} - ${demo.title}`,
      url: audioSamples[index % audioSamples.length],
      type: 'AUDIO',
      description: `${demo.genre.charAt(0).toUpperCase() + demo.genre.slice(1)} audio demo`
    });
  });
  
  return audioDemos;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomItems(arr, count) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateBio(categoryData, years, subcategoryName) {
  const template = getRandomItem(categoryData.bioTemplates);
  const quality = getRandomItem(categoryData.qualities);
  const specialty = getRandomItem(categoryData.specialties);
  const startYear = new Date().getFullYear() - years;
  
  return template
    .replace('{years}', years.toString())
    .replace('{specialty}', subcategoryName || specialty)
    .replace('{quality}', quality)
    .replace('{startYear}', startYear.toString());
}

function generateUniqueEmail(firstName, lastName, index) {
  const domains = ['gmail.com', 'outlook.com', 'yahoo.com', 'icloud.com', 'mail.com'];
  const domain = getRandomItem(domains);
  const random = Math.random().toString(36).substring(2, 6);
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${random}${index}@${domain}`;
}

// Avatar generation using various services
function generateAvatar(gender, seed) {
  const services = [
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`,
    `https://i.pravatar.cc/400?u=${seed}`,
    `https://api.dicebear.com/7.x/lorelei/svg?seed=${seed}`,
    `https://api.dicebear.com/7.x/personas/svg?seed=${seed}`
  ];
  
  // Mix between services for variety
  return getRandomItem(services);
}

// Sleep function for rate limiting
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// MAIN GENERATION FUNCTION
// ============================================================================

async function generateTalent(index, category, subcategory, passwordHash) {
  const gender = Math.random() > 0.5 ? 'MALE' : 'FEMALE';
  const firstName = gender === 'MALE' 
    ? getRandomItem(FIRST_NAMES_MALE)
    : getRandomItem(FIRST_NAMES_FEMALE);
  const lastName = getRandomItem(LAST_NAMES);
  const fullName = `${firstName} ${lastName}`;
  const email = generateUniqueEmail(firstName, lastName, index);
  
  const categoryMapping = {
    'Actors': 'Acting & Performance',
    'Musicians': 'Music & Audio',
    'Sports & Fitness': 'Sports & Fitness',
    'Photography & Videography': 'Photography (Commercial)',
    'Event Services': 'Stage Crew/Technician',
    'Beauty & Wellness': 'Beauty & Wellness',
    'Technical Services': 'Stage Crew/Technician'
  };

  let mappedName = categoryMapping[category.name] || category.name;
  let categoryData = CATEGORY_DATA[mappedName];
  
  if (!categoryData) {
    // Try to find a matching key (case-insensitive partial match)
    const key = Object.keys(CATEGORY_DATA).find(k => 
      k.toLowerCase() === mappedName.toLowerCase() || 
      mappedName.toLowerCase().includes(k.toLowerCase()) ||
      k.toLowerCase().includes(mappedName.toLowerCase())
    );
    
    if (key) {
      categoryData = CATEGORY_DATA[key];
    } else {
      // Default fallback
      categoryData = {
        skills: ['Professional', 'Creative', 'Experienced'],
        imageKeywords: [mappedName.toLowerCase(), 'professional'],
        videoKeywords: [mappedName.toLowerCase(), 'professional'],
        hasAudio: false,
        bioTemplates: ['Professional with {years} years in the industry.'],
        qualities: ['skilled'],
        specialties: ['general']
      };
    }
  }
  
  const years = getRandomInt(1, 20);
  const bio = generateBio(categoryData, years, subcategory?.name);
  
  // Determine experience level based on years
  let experienceLevel;
  if (years <= 2) experienceLevel = 'Beginner (0-2 years)';
  else if (years <= 5) experienceLevel = 'Intermediate (3-5 years)';
  else if (years <= 10) experienceLevel = 'Advanced (6-10 years)';
  else experienceLevel = 'Expert (10+ years)';
  
  const location = getRandomItem(LOCATIONS);
  const age = getRandomInt(18, 65);
  const ethnicity = getRandomItem(ETHNICITIES);
  const bodyType = getRandomItem(BODY_TYPES);
  const eyeColor = getRandomItem(EYE_COLORS);
  const hairColor = getRandomItem(HAIR_COLORS);
  
  // Get skills from category data
  const skills = getRandomItems(categoryData.skills, getRandomInt(4, 8));
  const featuredSkills = skills.slice(0, Math.min(4, skills.length));
  
  // Get languages
  const languageData = getRandomItems(LANGUAGES_POOL, getRandomInt(1, 4));
  // Ensure unique language names
  const uniqueLanguages = [];
  const seenLanguages = new Set();
  for (const lang of languageData) {
    if (!seenLanguages.has(lang.name)) {
      seenLanguages.add(lang.name);
      uniqueLanguages.push(lang);
    }
  }
  
  // Maybe add disability (10% chance)
  const hasDisability = Math.random() < 0.1;
  const disabilities = hasDisability ? getRandomItems(DISABILITIES, getRandomInt(1, 2)) : [];
  
  // Generate avatar
  const avatarSeed = `${fullName.replace(/\s/g, '')}-${index}`;
  const avatarUrl = generateAvatar(gender, avatarSeed);
  
  // Fetch media (with caching and rate limiting consideration)
  // Use subcategory name for more relevant results if available, otherwise fallback to category keywords
  const baseQuery = subcategory ? subcategory.name : getRandomItem(categoryData.imageKeywords);
  const imageKeyword = baseQuery;
  const videoKeyword = subcategory ? subcategory.name : getRandomItem(categoryData.videoKeywords);
  
  // Use page offset based on index to get variety
  const pageOffset = Math.floor(index / 20) + 1;
  
  // 1. Try Unsplash first (better for artistic/creative shots)
  let images = await fetchUnsplashImages(imageKeyword, 4);
  
  // 2. Try SerpApi (Google Images) if Unsplash failed or returned few results
  if (images.length < 4) {
    const serpApiImages = await fetchSerpApiImages(imageKeyword, 4 - images.length);
    images = [...images, ...serpApiImages];
  }
  
  // 3. Fallback to broader category search if specific subcategory failed
  if (images.length < 4) {
    const fallbackKeyword = getRandomItem(categoryData.imageKeywords);
    // Try Unsplash with broader keyword
    const fallbackUnsplash = await fetchUnsplashImages(fallbackKeyword, 4 - images.length);
    images = [...images, ...fallbackUnsplash];
    
    // Try SerpApi with broader keyword
    if (images.length < 4) {
      const fallbackSerpApi = await fetchSerpApiImages(fallbackKeyword, 4 - images.length);
      images = [...images, ...fallbackSerpApi];
    }
  }
  
  // 4. Final fallback to placeholders
  if (images.length < 4) {
    const fallbackImages = generateFallbackImages(imageKeyword, 4 - images.length);
    images = [...images, ...fallbackImages];
  }
  
  // Fetch videos - Try YouTube first
  let videos = await fetchYouTubeVideos(videoKeyword, 2);
  
  if (videos.length < 1) {
    // Try broader category keyword
    const fallbackVideoKeyword = getRandomItem(categoryData.videoKeywords);
    const fallbackYouTubeVideos = await fetchYouTubeVideos(fallbackVideoKeyword, 2);
    videos = [...videos, ...fallbackYouTubeVideos];
  }
  
  if (videos.length < 1) {
    videos = generateFallbackVideos(videoKeyword, 1);
  }
  
  // Generate audio demos if applicable - use async API fetch
  const audioDemos = await fetchAudioDemos(categoryData, fullName, index);
  
  // Build portfolio items
  const portfolioItems = [];
  
  // Add images
  images.forEach((img, idx) => {
    portfolioItems.push({
      title: `Portfolio Image ${idx + 1}`,
      mediaUrl: img.url,
      type: 'IMAGE',
      thumbnail: img.thumbnail,
      description: `Professional work sample - ${img.source} photography`
    });
  });
  
  // Add videos
  videos.forEach((vid, idx) => {
    portfolioItems.push({
      title: `Performance Video ${idx + 1}`,
      mediaUrl: vid.url,
      type: 'VIDEO',
      thumbnail: vid.thumbnail,
      description: `Featured ${subcategory?.name || category.name} performance`
    });
  });
  
  // Add audio demos
  audioDemos.forEach(audio => {
    portfolioItems.push({
      title: audio.title,
      mediaUrl: audio.url,
      type: 'AUDIO',
      description: audio.description
    });
  });
  
  // Calculate metrics
  // ratings removed per platform decision
  const viewCount = getRandomInt(50, 10000);
  const likeCount = Math.floor(viewCount * (Math.random() * 0.1 + 0.02)); // 2-12% of views
  
  // Generate work history
  const workHistoryItems = [];
  const currentYear = new Date().getFullYear();
  
  if (years >= 2) {
    workHistoryItems.push({
      title: `Senior ${subcategory?.name || category.name} Professional`,
      company: getRandomItem(['Creative Studios', 'Media Productions', 'Entertainment Group', 'Arts Collective', 'Studio X', 'Prime Media']),
      startDate: new Date(currentYear - Math.min(years, 3), getRandomInt(0, 11), 1),
      isCurrent: true,
      description: `Lead ${subcategory?.name || category.name} work on major projects.`
    });
  }
  
  if (years >= 4) {
    workHistoryItems.push({
      title: `${subcategory?.name || category.name} Specialist`,
      company: getRandomItem(['Freelance', 'Independent', 'Self-Employed', 'Agency Work']),
      startDate: new Date(currentYear - years, getRandomInt(0, 11), 1),
      endDate: new Date(currentYear - Math.min(years, 3), getRandomInt(0, 11), 1),
      isCurrent: false,
      description: `Built experience in ${subcategory?.name || category.name}.`
    });
  }
  
  // Create user and profile
  const user = await prisma.user.create({
    data: {
      name: fullName,
      email: email,
      password: passwordHash,
      role: 'TALENT',
      emailVerified: new Date()
    }
  });
  
  // Create talent profile
  const talentProfile = await prisma.talentProfile.create({
    data: {
      userId: user.id,
      categoryId: category.id,
      subcategoryId: subcategory?.id,
      performerTitle: subcategory?.name || category.name,
      bio: bio,
      location: location,
      experienceLevel: experienceLevel,
      // rating removed per platform decision
      viewCount: viewCount,
      likeCount: likeCount,
      isBeginner: years <= 2,
      profileComplete: true,
      
      // Personal Details
      age: age,
      dateOfBirth: new Date(currentYear - age, getRandomInt(0, 11), getRandomInt(1, 28)),
      gender: gender,
      ethnicity: ethnicity,
      height: getRandomInt(150, 200),
      bodyType: bodyType,
      eyeColor: eyeColor,
      hairColor: hairColor,
      
      // Disabilities
      disabilities: disabilities,
      
      // Skills
      skills: skills,
      featuredSkills: featuredSkills,
      
      // Media
      avatarUrl: avatarUrl,
      videoUrl: videos[0]?.url || null,
      portfolioImages: images.map(img => img.url),
      videoUrls: videos.map(vid => vid.url),
      
      // Related records
      languages: {
        create: uniqueLanguages.map(lang => ({
          name: lang.name,
          proficiency: lang.proficiency
        }))
      },
      
      workHistory: {
        create: workHistoryItems
      },
      
      portfolio: {
        create: portfolioItems
      }
    }
  });
  
  return { user, talentProfile };
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log('🚀 Starting generation of talent profiles...');
  console.log('📡 Using APIs: Unsplash, SerpApi (images), YouTube (videos)');
  console.log('🎵 Using APIs: Freesound (audio)');
  console.log('');
  
  // Check API keys
  if (UNSPLASH_ACCESS_KEY === 'YOUR_UNSPLASH_KEY') {
    console.log('⚠️  No Unsplash API key - skipping Unsplash');
  } else {
    console.log('✅ Unsplash API key configured');
  }
  if (SERPAPI_KEY === 'YOUR_SERPAPI_KEY') {
    console.log('⚠️  No SerpApi key - skipping Google Images');
  } else {
    console.log('✅ SerpApi key configured');
  }
  if (YOUTUBE_API_KEY === 'YOUR_YOUTUBE_KEY') {
    console.log('⚠️  No YouTube API key - skipping YouTube videos');
  } else {
    console.log('✅ YouTube API key configured');
  }
  if (FREESOUND_API_KEY === 'YOUR_FREESOUND_KEY') {
    console.log('⚠️  No Freesound API key - using fallback audio');
  } else {
    console.log('✅ Freesound API key configured');
  }
  console.log('');
  
  // 1. Cleanup existing talent-related data (keep admins and non-talent users)
  console.log('🧹 Cleaning up existing talent profiles...');

  // Delete in order to respect foreign key constraints
  await prisma.portfolioView.deleteMany({});
  await prisma.profileView.deleteMany({});
  await prisma.searchAppearance.deleteMany({});
  await prisma.profileStats.deleteMany({});
  await prisma.commentLike.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.contentReport.deleteMany({});
  await prisma.profileLike.deleteMany({});
  await prisma.language.deleteMany({});
  await prisma.workHistory.deleteMany({});
  await prisma.portfolioItem.deleteMany({});
  await prisma.profileSettings.deleteMany({});
  await prisma.talentProfile.deleteMany({});

  // Delete all TALENT users; keep ADMINs and any other roles
  await prisma.user.deleteMany({
    where: {
      role: 'TALENT'
    }
  });
  
  console.log('✅ Cleanup complete.');
  
  // 2. Fetch all categories with subcategories
  const categories = await prisma.talentCategory.findMany({
    include: { subcategories: true }
  });
  
  if (categories.length === 0) {
    console.error('❌ No categories found. Please run prisma db seed first.');
    process.exit(1);
  }
  
  console.log(`📂 Found ${categories.length} categories:`, categories.map(c => c.name).join(', '));
  
  // 3. Generate password hash once
  const passwordHash = await bcrypt.hash('password123', 10);

  // 4. Generate talents (configurable, default 150)
  const TOTAL_TALENTS = parseInt(process.env.TOTAL_TALENTS || '150', 10);
  const BATCH_SIZE = 10; // Process in batches for rate limiting
  
  console.log(`\n✨ Generating ${TOTAL_TALENTS} profiles...`);
  console.log('   (This may take a while due to API rate limits)\n');
  
  let created = 0;
  let errors = 0;
  
  // Force distribution to ensure audio categories are included
  // Music & Audio, Acting & Performance
  const forcedCategories = [
    { name: 'Music & Audio', count: Math.floor(TOTAL_TALENTS * 0.3) },
    { name: 'Acting & Performance', count: Math.floor(TOTAL_TALENTS * 0.2) }
  ];
  
  let forcedQueue = [];
  for (const fc of forcedCategories) {
    const category = categories.find(c => c.name === fc.name);
    if (category) {
      for (let i = 0; i < fc.count; i++) {
        forcedQueue.push(category);
      }
    }
  }
  
  // Shuffle the forced queue
  forcedQueue = forcedQueue.sort(() => 0.5 - Math.random());
  
  for (let i = 0; i < TOTAL_TALENTS; i++) {
    try {
      let category;
      
      // Use forced category if available, otherwise random
      if (forcedQueue.length > 0) {
        category = forcedQueue.pop();
      } else {
        category = getRandomItem(categories);
      }
      
      const subcategory = category.subcategories.length > 0 
        ? getRandomItem(category.subcategories) 
        : null;
      
      await generateTalent(i, category, subcategory, passwordHash);
      created++;
      
      // Progress indicator
      if (created % 10 === 0) {
        process.stdout.write(`\r   Progress: ${created}/${TOTAL_TALENTS} (${Math.round(created/TOTAL_TALENTS*100)}%)`);
      }
      
      // Rate limiting: pause every batch to avoid API limits
      if (created % BATCH_SIZE === 0) {
        await sleep(100); // 100ms pause between batches
      }
      
    } catch (error) {
      errors++;
      console.error(`\n❌ Error creating talent ${i}:`, error.message);
      
      // Continue with next talent
      continue;
    }
  }
  
  console.log(`\n\n✅ Generation complete!`);
  console.log(`   - Created: ${created} profiles`);
  console.log(`   - Errors: ${errors}`);
  
  // 5. Update subcategory talent counts
  console.log('\n📊 Updating category counts...');
  
  for (const category of categories) {
    for (const subcategory of category.subcategories) {
      const count = await prisma.talentProfile.count({
        where: { subcategoryId: subcategory.id }
      });
      
      await prisma.talentSubcategory.update({
        where: { id: subcategory.id },
        data: { talentCount: count }
      });
    }
  }
  
  console.log('✅ Category counts updated.');
  
  // 6. Summary
  console.log('\n📋 Summary:');
  
  const totalTalents = await prisma.talentProfile.count();
  const totalPortfolioItems = await prisma.portfolioItem.count();
  const audioItems = await prisma.portfolioItem.count({ where: { type: 'AUDIO' } });
  const videoItems = await prisma.portfolioItem.count({ where: { type: 'VIDEO' } });
  const imageItems = await prisma.portfolioItem.count({ where: { type: 'IMAGE' } });
  
  console.log(`   - Total Talents: ${totalTalents}`);
  console.log(`   - Portfolio Items: ${totalPortfolioItems}`);
  console.log(`     - Images: ${imageItems}`);
  console.log(`     - Videos: ${videoItems}`);
  console.log(`     - Audio: ${audioItems}`);
  
  // Audio source breakdown
  console.log('\n🎵 Audio Sources:');
  console.log(`   - Pixabay Music: Categories used for music-related talents`);
  console.log(`   - Freesound: Sound effects and voice samples`);
  console.log(`   - SoundHelix: Fallback instrumental tracks`);
  
  console.log('\n🎉 All done! You can now browse the talent profiles.');
  console.log('\n💡 Tip: Get API keys for better media variety:');
  console.log('   - Pexels: https://www.pexels.com/api/');
  console.log('   - Unsplash: https://unsplash.com/developers');
  console.log('   - Pixabay: https://pixabay.com/api/docs/');
  console.log('   - Freesound: https://freesound.org/apiv2/apply/');
}

main()
  .catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
