export type Talent = {
    id: string;
    name: string;
    role: string;
    category: string;
    subcategory: string;
    skills: string[];
    videoUrl?: string;
    avatarUrl?: string;
    location: string;
    experience: number;
    rating: number;
    languages: string[];
    bio: string;
    // Enhanced filtering properties
    gender: 'male' | 'female' | 'non-binary' | 'other';
    ethnicity: string;
    age: number;
    height: number; // in cm
    bodyType: 'slim' | 'athletic' | 'average' | 'curvy' | 'plus-size' | 'muscular';
    eyeColor: string;
    hairColor: string;
    socialMedia: {
        platform: string;
        url: string;
    }[];
    portfolio: {
        title: string;
        url: string;
        type: 'image' | 'video' | 'audio';
    }[];
    reviews: {
        reviewer: string;
        rating: number;
        comment: string;
    }[];
    isBeginner: boolean;
    viewCount: number;
    likeCount: number;
    isLiked?: boolean; // For current user's like status
    profileSettings?: {
        showViewCount: boolean;
        showExperienceLevel: boolean;
        showLocation: boolean;
        showLanguages: boolean;
        showRating: boolean;
        showReviewCount: boolean;
        showWorkHistory: boolean;
        showSocialMedia: boolean;
        showContactInfo: boolean;
        profileVisibility: 'PUBLIC' | 'PRIVATE' | 'CONTACTS_ONLY';
        searchable: boolean;
        allowDirectContact: boolean;
        showOnlineStatus: boolean;
    };
};

export interface TalentFilters {
    gender?: string[];
    ethnicity?: string[];
    ageRange?: { min: number; max: number };
    heightRange?: { min: number; max: number };
    bodyType?: string[];
    experience?: { min: number; max: number };
    availability?: string[];
    location?: string;
    eyeColor?: string[];
    hairColor?: string[];
    skills?: string[];
    languages?: string[];
}

export type AuthenticatedUser = {
    userId: string;
    role: string;
    name: string;
};