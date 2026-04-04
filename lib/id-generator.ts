import { getPrisma } from './prisma';

/**
 * Generate the next sequential user ID in format TN1, TN2, TN3, etc.
 * 
 * @returns Promise<string> The next available user ID (e.g., "TN1", "TN100")
 */
export async function generateNextUserId(): Promise<string> {
  const prisma = getPrisma();
  
  try {
    // Find the highest existing TN ID
    const lastUser = await prisma.user.findFirst({
      where: {
        id: {
          startsWith: 'TN'
        }
      },
      orderBy: {
        id: 'desc'
      },
      select: {
        id: true
      }
    });

    if (!lastUser) {
      // No TN IDs exist yet, start with TN1
      return 'TN1';
    }

    // Extract the number from the last ID (e.g., "TN145" -> 145)
    const lastNumber = parseInt(lastUser.id.replace('TN', ''), 10);
    
    if (isNaN(lastNumber)) {
      // Fallback if parsing fails
      console.warn(`Invalid user ID format found: ${lastUser.id}, starting from TN1`);
      return 'TN1';
    }

    // Generate the next ID
    const nextNumber = lastNumber + 1;
    return `TN${nextNumber}`;
  } catch (error) {
    console.error('Error generating user ID:', error);
    // Fallback to timestamp-based ID to avoid collisions
    return `TN${Date.now()}`;
  }
}

/**
 * Validate if a string is a valid TN ID format
 * 
 * @param id The ID to validate
 * @returns boolean True if the ID matches TN format
 */
export function isValidTNId(id: string): boolean {
  return /^TN\d+$/.test(id);
}

/**
 * Get the numeric part of a TN ID
 * 
 * @param id The TN ID (e.g., "TN145")
 * @returns number The numeric part (e.g., 145)
 */
export function getTNNumber(id: string): number | null {
  if (!isValidTNId(id)) {
    return null;
  }
  return parseInt(id.replace('TN', ''), 10);
}
