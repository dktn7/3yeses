// Types for API responses and database models
export interface TalentProfile {
  id: string;
  userId: string;
  name: string;
  performerTitle: string | null;
  bio: string | null;
  location: string | null;
  avatarUrl: string | null;
  videoUrl: string | null;
  experienceLevel: number | null;
  skills: string[];
  availability: string;
  gender: string | null;
  category: {
    id: string;
    name: string;
    icon: string | null;
  } | null;
  subcategory: {
    id: string;
    name: string;
  } | null;
  portfolio: PortfolioItem[];
  viewCount: number;
  isBeginner: boolean;
  joinedAt: Date;
}

export interface PortfolioItem {
  id: string;
  title: string;
  mediaUrl: string;
  type: string;
}

export interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  hasPrev: boolean;
  limit: number;
}

export interface SearchFilters {
  search?: string;
  category?: string;
  subcategory?: string;
  location?: string;
  availability?: string;
  gender?: string;
  sortBy: string;
  sortOrder: string;
}

export interface TalentSearchResponse {
  success: boolean;
  data: {
    talents: TalentProfile[];
    pagination: PaginationData;
    filters: SearchFilters;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: 'TALENT' | 'CLIENT' | 'ADMIN';
  name: string;
}
export {};
