import prisma from '@/lib/prisma';

export interface CategoryWithSubcategories {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  subcategories: Array<{
    id: string;
    name: string;
    description: string | null;
    _count: {
      talentProfiles: number;
    };
  }>;
  _count: {
    talentProfiles: number;
    subcategories: number;
  };
}

// Simple in-memory cache for categories
let categoriesCache: CategoryWithSubcategories[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getCategories(forceRefresh = false): Promise<CategoryWithSubcategories[]> {
  // Return cached data if still valid and not forcing a refresh
  if (!forceRefresh && categoriesCache && Date.now() - cacheTimestamp < CACHE_TTL) {
    return categoriesCache;
  }

  try {
    const categories = await prisma.talentCategory.findMany({
      include: {
        subcategories: {
          include: {
            _count: {
              select: {
                talentProfiles: true,
              },
            },
          },
          orderBy: {
            name: 'asc',
          },
        },
        _count: {
          select: {
            talentProfiles: true,
            subcategories: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
    
    // Update cache
    categoriesCache = categories;
    cacheTimestamp = Date.now();
    
    return categories;
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
}

// Force refresh cache
export function invalidateCategoriesCache() {
  categoriesCache = null;
  cacheTimestamp = 0;
}

/**
 * Maps a category's DB name to its i18n translation key.
 * Usage: t(`names.${getCategoryI18nKey(category.name)}`)
 * Falls back to the raw DB name if no mapping exists.
 */
const CATEGORY_I18N_KEYS: Record<string, string> = {
  // Categories
  'Acting & Performance': 'actingPerformance',
  'Comedy': 'comedy',
  'Dancing & Choreography': 'dancingChoreography',
  'Modeling': 'modeling',
  'Music & Audio': 'musicAudio',
  'Sports & Fitness': 'sportsFitness',
  'Stunts': 'stunts',
  'Video Production': 'videoProduction',
  'Voice Over & Dubbing': 'voiceOverDubbing',

  // Acting & Performance subcategories
  'Acting & Performance - General': 'actingPerformanceGeneral',
  'Commercials': 'commercials',
  'Extras / Background': 'extrasBackground',
  'Film/TV Acting': 'filmTvActing',
  'Theatre': 'theatre',
  'Voice Acting': 'voiceActing',

  // Comedy subcategories
  'Comedy - General': 'comedyGeneral',
  'Comedy Writing': 'comedyWriting',
  'Improv': 'improv',
  'Sketch Comedy': 'sketchComedy',
  'Stand-up': 'standUp',

  // Dancing & Choreography subcategories
  'Ballet / Classical': 'balletClassical',
  'Choreographers': 'choreographers',
  'Commercial / Music Video': 'commercialMusicVideo',
  'Contemporary / Modern': 'contemporaryModern',
  'Dancing & Choreography - General': 'dancingChoreographyGeneral',
  'Hip-Hop / Street': 'hipHopStreet',

  // Modeling subcategories
  'Commercial / Catalogue': 'commercialCatalogue',
  'Fashion / Runway': 'fashionRunway',
  'Fitness / Sports Modeling': 'fitnessSportsModeling',
  'Modeling - General': 'modelingGeneral',
  'Plus Size': 'plusSize',
  'Portrait / Editorial': 'portraitEditorial',

  // Music & Audio subcategories
  'Composers / Arrangers': 'composersArrangers',
  'DJs': 'djs',
  'Music & Audio - General': 'musicAudioGeneral',
  'Musicians (Instrumental)': 'musiciansInstrumental',
  'Music Production': 'musicProduction',
  'Session Musicians': 'sessionMusicians',
  'Vocalists / Singers': 'vocalistsSingers',

  // Sports & Fitness subcategories
  'Dancers (fitness)': 'dancersFitness',
  'Personal Trainers': 'personalTrainers',
  'Sports & Fitness - General': 'sportsFitnessGeneral',
  'Sports Models / Athletes': 'sportsModelsAthletes',

  // Stunts subcategories
  'Driving / Vehicle': 'drivingVehicle',
  'Fight / Combat': 'fightCombat',
  'High-fall / Aerial': 'highFallAerial',
  'Precision / Specialty Stunts': 'precisionSpecialtyStunts',
  'Stunts - General': 'stuntsGeneral',
  'Wirework / Aerial Rigging': 'wireworkAerialRigging',

  // Video Production subcategories
  'Camera / Cinematography': 'cameraCinematography',
  'Directors / Producers': 'directorsProducers',
  'Editors / Post-production': 'editorsPostProduction',
  'Motion Graphics / VFX': 'motionGraphicsVfx',
  'Video Production - General': 'videoProductionGeneral',

  // Voice Over & Dubbing subcategories
  'Character Voices (animation/games)': 'characterVoicesAnimationGames',
  'Commercial VO': 'commercialVo',
  'Dubbing / ADR': 'dubbingAdr',
  'Narration / Audiobooks': 'narrationAudiobooks',
  'Voice Over & Dubbing - General': 'voiceOverDubbingGeneral',
};

export function getCategoryI18nKey(dbName: string): string | null {
  // Prefer explicit mapping for edge cases / legacy names
  const explicit = CATEGORY_I18N_KEYS[dbName];
  if (explicit) return explicit;

  // Fallback: generate a normalized i18n key from the DB name.
  // This covers most category names without having to maintain
  // an exhaustive mapping in `CATEGORY_I18N_KEYS` and avoids
  // confusing fallbacks to raw DB names.
  const normalize = (s: string) => {
    // Replace ampersand with 'and', remove punctuation, split words
    const cleaned = s.replace(/&/g, ' and ').replace(/[()\[\]\.,/\\:'"’`–—]/g, ' ');
    const parts = cleaned
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map(p => p.toLowerCase());
    if (parts.length === 0) return null;
    // camelCase: first word lower, subsequent capitalized
    return parts[0] + parts.slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
  };

  return normalize(dbName);
}
