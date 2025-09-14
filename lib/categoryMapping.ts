export const SIGNUP_CATEGORIES = [
  {
    value: 'actors',
    label: 'Actors',
    description: 'Actors and performers',
    skills: ['Acting', 'Improv', 'Voice']
  },
  {
    value: 'musicians',
    label: 'Musicians',
    description: 'Singers and musicians',
    skills: ['Singing', 'Guitar', 'Piano']
  }
];

export function getSuggestedSkills(category: string) {
  const found = SIGNUP_CATEGORIES.find(c => c.value === category);
  return found ? found.skills : [];
}

export function validateSkillsForCategory(_category: string, _skills: string[]) {
  return { isValid: true, suggestions: [], warnings: [] };
}

export function findBestCategoryMatch(_category: string, _skills: string[], _bio: string): CategoryMatch[] {
  return [] as CategoryMatch[];
}

export type CategoryMatch = { categoryName: string; reason: string; confidence: number };
