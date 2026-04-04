import { Talent, TalentFilters } from '../types/index.ts';
export type { Talent, TalentFilters } from '../types/index.ts';
// Removed duplicate export

// Lightweight category types used by search/category UIs
export type CategoryItem = {
  id: string;
  name: string;
  description?: string;
};

// CategoryGroup type extended with metadata
export type CategoryGroup = {
  id: string;
  name: string;
  popularity?: number;
  relevance?: number;
  customOrder?: number;
  subcategories: Array<{
    id: string;
    name: string;
    description?: string;
    popularity?: number;
    relevance?: number;
    customOrder?: number;
  }>;
};

// Category type is CategoryGroup
export type SubSubCategory = CategoryItem & { talentCount?: number };

// Inclusive mock talents data
export const mockTalents: Talent[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    role: 'Lead Actress',
    category: 'actors',
    subcategory: 'female-actor',
    skills: ['Method Acting', 'Stage Combat', 'Accent Work'],
    videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
    avatarUrl: 'https://randomuser.me/api/portraits/women/1.jpg',
    location: 'Los Angeles, CA',
    experienceLevel: 8,
    // rating removed per platform decision
    languages: ['English', 'Spanish'],
    bio: 'A passionate and versatile actress with a strong background in classical and contemporary theatre.',
    gender: 'female',
    ethnicity: 'Caucasian',
    age: 28,
    height: 165,
    bodyType: 'slim',
    eyeColor: 'Blue',
    hairColor: 'Blonde',
    socialMedia: [{ platform: 'Instagram', url: 'https://instagram.com/sarahj' }],
    portfolio: [
      { id: 'p1', title: 'Monologue from Hamlet', mediaUrl: 'https://www.youtube.com/watch?v=abc123', type: 'video' },
      { id: 'p2', title: 'Headshot 1', mediaUrl: 'https://randomuser.me/api/portraits/women/1.jpg', type: 'image' },
    ],
    workHistory: [],
    // reviews removed per platform decision
    isBeginner: false,
    viewCount: 2847,
    likeCount: 120,
  },
  {
    id: '2',
    name: 'Alex Kim',
    role: 'Non-binary Actor',
    category: 'actors',
    subcategory: 'nonbinary-actor',
    skills: ['Improv', 'Physical Theatre'],
    videoUrl: '',
    avatarUrl: '',
    location: 'San Francisco, CA',
    experienceLevel: 4,
    // rating removed per platform decision
    languages: ['English'],
    bio: 'Energetic non-binary performer with a love for experimental theatre.',
    gender: 'non-binary',
    ethnicity: 'Asian',
    age: 24,
    height: 170,
    bodyType: 'athletic',
    eyeColor: 'Brown',
    hairColor: 'Black',
    socialMedia: [],
    portfolio: [],
    workHistory: [],
    // reviews removed per platform decision
    isBeginner: true,
    viewCount: 1200,
    likeCount: 45,
  },
  {
    id: '3',
    name: 'Marcus Williams',
    role: 'Male Lead Actor',
    category: 'actors',
    subcategory: 'male-actor',
    skills: ['Stage Combat', 'Comedy'],
    videoUrl: '',
    avatarUrl: '',
    location: 'Atlanta, GA',
    experienceLevel: 6,
    // rating removed per platform decision
    languages: ['English'],
    bio: 'Versatile male actor with experience in both drama and comedy.',
    gender: 'male',
    ethnicity: 'African American',
    age: 31,
    height: 180,
    bodyType: 'average',
    eyeColor: 'Green',
    hairColor: 'Brown',
    socialMedia: [],
    portfolio: [],
    workHistory: [],
    // reviews removed per platform decision
    isBeginner: false,
    viewCount: 2100,
    likeCount: 88,
  },
  {
    id: '4',
    name: 'Taylor Lee',
    role: 'Child Actor',
    category: 'actors',
    subcategory: 'child-actor',
    skills: ['Singing', 'Dance'],
    videoUrl: '',
    avatarUrl: '',
    location: 'Toronto, ON',
    experienceLevel: 2,
    // rating removed per platform decision
    languages: ['English', 'French'],
    bio: 'Young performer with a passion for musicals.',
    gender: 'female',
    ethnicity: 'Mixed Race',
    age: 12,
    height: 145,
    bodyType: 'slim',
    eyeColor: 'Hazel',
    hairColor: 'Brown',
    socialMedia: [],
    portfolio: [],
    workHistory: [],
    // reviews removed per platform decision
    isBeginner: true,
    viewCount: 500,
    likeCount: 12,
  },
];

// Enhanced filtering function
export function filterTalents(talents: Talent[], filters: TalentFilters): Talent[] {
    return talents.filter(talent => {
        const checks: boolean[] = [
            filters.gender && filters.gender.length > 0 ? filters.gender.includes(talent.gender) : true,
            filters.ethnicity && filters.ethnicity.length > 0 ? filters.ethnicity.includes(talent.ethnicity) : true,
            filters.ageRange ? (talent.age >= filters.ageRange.min && talent.age <= filters.ageRange.max) : true,
            filters.heightRange ? (talent.height >= filters.heightRange.min && talent.height <= filters.heightRange.max) : true,
            filters.bodyType && filters.bodyType.length > 0 ? filters.bodyType.includes(talent.bodyType) : true,
            filters.experience ? (talent.experienceLevel >= filters.experience.min && talent.experienceLevel <= filters.experience.max) : true,
            // availability filter removed
            filters.location ? talent.location.toLowerCase().includes(filters.location.toLowerCase()) : true,
        ];
        return checks.every(Boolean);
    });
}

// Enhanced getCategoryData with metadata
export function getCategoryData(): CategoryGroup[] {
  // Canonical current categories (used as a reliable fallback for client-side UIs)
  return [
    { id: 'acting-performance', name: 'Acting & Performance', subcategories: [] },
    { id: 'comedy', name: 'Comedy', subcategories: [] },
    { id: 'dancing-choreography', name: 'Dancing & Choreography', subcategories: [] },
    { id: 'modeling', name: 'Modeling', subcategories: [] },
    { id: 'music-audio', name: 'Music & Audio', subcategories: [] },
    { id: 'sports-fitness', name: 'Sports & Fitness', subcategories: [] },
    { id: 'stunts', name: 'Stunts', subcategories: [] },
    { id: 'video-production', name: 'Video Production', subcategories: [] },
    { id: 'voice-over-dubbing', name: 'Voice Over & Dubbing', subcategories: [] },
  ];
}

// Sorting utility for categories and subcategories
export function sortCategories(
  categories: CategoryGroup[],
  sortBy: 'alphabetical' | 'popularity' | 'relevance' | 'customOrder' = 'alphabetical'
): CategoryGroup[] {
  // Subcategory sort function
  const subSortFn = (a: CategoryGroup['subcategories'][number], b: CategoryGroup['subcategories'][number]) => {
    switch (sortBy) {
      case 'popularity':
        return (b.popularity ?? 0) - (a.popularity ?? 0);
      case 'relevance':
        return (b.relevance ?? 0) - (a.relevance ?? 0);
      case 'customOrder':
        return (a.customOrder ?? 0) - (b.customOrder ?? 0);
      case 'alphabetical':
      default:
        return a.name.localeCompare(b.name);
    }
  };
  // Category sort function
  const catSortFn = (a: CategoryGroup, b: CategoryGroup) => {
    switch (sortBy) {
      case 'popularity':
        return (b.popularity ?? 0) - (a.popularity ?? 0);
      case 'relevance':
        return (b.relevance ?? 0) - (a.relevance ?? 0);
      case 'customOrder':
        return (a.customOrder ?? 0) - (b.customOrder ?? 0);
      case 'alphabetical':
      default:
        return a.name.localeCompare(b.name);
    }
  };
  return categories
    .map(cat => ({
      ...cat,
      subcategories: [...cat.subcategories].sort(subSortFn),
    }))
    .sort(catSortFn);
}

// Filtering utility for categories
export function filterCategories(
  categories: CategoryGroup[],
  searchTerm: string
): CategoryGroup[] {
  const term = searchTerm.toLowerCase();
  return categories
    .map(cat => ({
      ...cat,
      subcategories: cat.subcategories.filter(sub =>
        sub.name.toLowerCase().includes(term) ||
        (sub.description?.toLowerCase().includes(term) ?? false)
      ),
    }))
    .filter(cat =>
      cat.name.toLowerCase().includes(term) ||
      cat.subcategories.length > 0
    );
}

// Search talents by name, role, skills, or category with optional filters
export function searchTalents(query: string, filters?: TalentFilters): Talent[] {
    if (!query.trim()) {
        return [];
    }

    const searchTerm = query.toLowerCase().trim();

    return mockTalents.filter(talent => {
        const matchesQuery = (
            talent.name.toLowerCase().includes(searchTerm) ||
            talent.role.toLowerCase().includes(searchTerm) ||
            talent.category.toLowerCase().includes(searchTerm) ||
            talent.skills.some(skill => skill.toLowerCase().includes(searchTerm)) ||
            talent.bio.toLowerCase().includes(searchTerm) ||
            talent.location.toLowerCase().includes(searchTerm) ||
            talent.gender?.toLowerCase().includes(searchTerm) ||
            talent.ethnicity?.toLowerCase().includes(searchTerm)
        );

        const matchesFilters = (!filters || (
            (!filters.gender?.length || filters.gender?.includes(talent.gender)) &&
            (!filters.ethnicity?.length || filters.ethnicity?.includes(talent.ethnicity)) &&
            (!filters.eyeColor?.length || filters.eyeColor?.includes(talent.eyeColor)) &&
            (!filters.hairColor?.length || filters.hairColor?.includes(talent.hairColor)) &&
            (!filters.skills?.length || filters.skills?.every(skill => talent.skills.includes(skill))) &&
            (!filters.languages?.length || filters.languages?.every(lang => talent.languages.includes(lang))) &&
            (!filters.location || talent.location.toLowerCase().includes(filters.location.toLowerCase()))
        ));

    return matchesQuery && matchesFilters;
  });
}

// Get all talents for global search
export function getAllTalents(): Talent[] {
    return mockTalents;
}

export function getSubSubCategories(subcategoryId?: string): SubSubCategory[] {
  // If a subcategoryId is provided we could compute sub-subcategories; mock data has none.
  if (subcategoryId) {
    // noop - kept to acknowledge the parameter for callers
  }
  return [];
}

export function getTalentsBySubCategory(subcategoryId: string): Talent[] {
  // Return talents where the talent.subcategory or talent.category matches the given id
  return mockTalents.filter((t) => t.subcategory === subcategoryId || t.category === subcategoryId);
}

// Backwards-compatible alias used in some client pages
export function fetchTalentsByCategory(categoryId: string): Talent[] {
  return getTalentsBySubCategory(categoryId);
}