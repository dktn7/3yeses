/**
 * API Middleware for URL Validation
 * Server-side validation to prevent malicious URLs from being processed
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateUrl } from '@/lib/url-validator';

export interface UrlValidationMiddlewareOptions {
  /**
   * Request body fields to validate (e.g., ['url', 'mediaUrl', 'link'])
   */
  fields?: string[];
  
  /**
   * Query parameters to validate (e.g., ['redirect', 'callback'])
   */
  queryParams?: string[];
  
  /**
   * Whether to return detailed error messages or generic ones
   */
  detailedErrors?: boolean;
}

/**
 * Middleware to validate URLs in API requests
 */
export async function validateUrlsInRequest(
  request: NextRequest,
  options: UrlValidationMiddlewareOptions = {}
): Promise<NextResponse | null> {
  const {
    fields = ['url', 'mediaUrl', 'link', 'thumbnail'],
    queryParams = ['redirect', 'callback'],
    detailedErrors = false,
  } = options;

  const errors: string[] = [];

  // Validate query parameters
  const url = new URL(request.url);
  for (const param of queryParams) {
    const value = url.searchParams.get(param);
    if (value) {
      const result = validateUrl(value);
      if (!result.isValid) {
        errors.push(
          detailedErrors
            ? `Invalid ${param}: ${result.error}`
            : 'Invalid URL provided'
        );
      }
    }
  }

  // Validate request body fields
  try {
    const body = await request.json();
    
    for (const field of fields) {
      const value = body[field];
      if (value && typeof value === 'string') {
        const result = validateUrl(value);
        if (!result.isValid) {
          errors.push(
            detailedErrors
              ? `Invalid ${field}: ${result.error}`
              : 'Invalid URL provided'
          );
        }
      }
    }
  } catch (e) {
    // Not JSON or no body - skip validation
  }

  // Return error response if validation failed
  if (errors.length > 0) {
    return NextResponse.json(
      {
        error: 'URL validation failed',
        details: detailedErrors ? errors : undefined,
      },
      { status: 400 }
    );
  }

  // Validation passed - continue to next handler
  return null;
}

/**
 * Example usage in API route:
 * 
 * export async function POST(request: NextRequest) {
 *   // Validate URLs in request
 *   const validationError = await validateUrlsInRequest(request, {
 *     fields: ['url', 'thumbnail'],
 *     detailedErrors: true,
 *   });
 *   
 *   if (validationError) {
 *     return validationError; // Return 400 error
 *   }
 *   
 *   // Continue with normal processing
 *   const body = await request.json();
 *   // ... rest of your code
 * }
 */

/**
 * Higher-order function to wrap API handlers with URL validation
 */
export function withUrlValidation(
  handler: (request: NextRequest) => Promise<NextResponse>,
  options?: UrlValidationMiddlewareOptions
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const validationError = await validateUrlsInRequest(request, options);
    
    if (validationError) {
      return validationError;
    }
    
    return handler(request);
  };
}
