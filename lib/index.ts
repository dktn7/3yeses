// Barrel exports: only include client-safe helpers here.
// Server-only modules (Prisma, AuthService) should be imported directly from their files to
// avoid accidentally bundling server code into client bundles.

export { SIGNUP_CATEGORIES, getSuggestedSkills, validateSkillsForCategory, findBestCategoryMatch } from './categoryMapping';
export * from './hooks';

// NOTE: Do NOT re-export Prisma or server-only AuthService here. Import them directly:
// import { getPrisma } from '@/lib/prisma';
// import AuthService from '@/lib/auth/auth-service';
