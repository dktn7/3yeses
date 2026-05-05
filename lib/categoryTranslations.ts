const CATEGORY_KEY_MAP: Record<string, string> = {
  'acting-performance': 'actingPerformance',
  'acting & performance': 'actingPerformance',
  acting: 'actingPerformance',
  performance: 'actingPerformance',
  comedy: 'comedy',
  'dancing-choreography': 'dancingChoreography',
  'dancing & choreography': 'dancingChoreography',
  dancing: 'dancingChoreography',
  choreography: 'dancingChoreography',
  modeling: 'modeling',
  modelling: 'modeling',
  'music-audio': 'musicAudio',
  'music & audio': 'musicAudio',
  music: 'musicAudio',
  audio: 'musicAudio',
  'sports-fitness': 'sportsFitness',
  'sports & fitness': 'sportsFitness',
  sports: 'sportsFitness',
  fitness: 'sportsFitness',
  stunts: 'stunts',
  stunt: 'stunts',
  'video-production': 'videoProduction',
  'video production': 'videoProduction',
  video: 'videoProduction',
  production: 'videoProduction',
  'voice-over-dubbing': 'voiceOverDubbing',
  'voice over & dubbing': 'voiceOverDubbing',
  'voice over': 'voiceOverDubbing',
  dubbing: 'voiceOverDubbing',
};

function normalizeCategoryValue(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getCategoryTranslationKey(...values: Array<string | undefined | null>): string | null {
  for (const value of values) {
    if (!value) continue;

    const normalized = normalizeCategoryValue(value);

    if (CATEGORY_KEY_MAP[normalized]) {
      return CATEGORY_KEY_MAP[normalized];
    }

    const withAmpersand = value.trim().toLowerCase();
    if (CATEGORY_KEY_MAP[withAmpersand]) {
      return CATEGORY_KEY_MAP[withAmpersand];
    }
  }

  return null;
}