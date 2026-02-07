/**
 * React Hook for URL Validation
 * Provides easy-to-use URL validation in React components
 */

import { useState, useCallback } from 'react';
import { validateUrl, UrlValidationResult, UrlValidatorConfig } from '@/lib/url-validator';

export interface UseUrlValidatorOptions {
  validateOnChange?: boolean;
  debounceMs?: number;
  config?: UrlValidatorConfig;
}

export interface UseUrlValidatorReturn {
  url: string;
  setUrl: (url: string) => void;
  validation: UrlValidationResult | null;
  isValid: boolean;
  isValidating: boolean;
  validate: () => UrlValidationResult;
  reset: () => void;
}

export function useUrlValidator(
  initialUrl: string = '',
  options: UseUrlValidatorOptions = {}
): UseUrlValidatorReturn {
  const { validateOnChange = false, debounceMs = 0, config } = options;

  const [url, setUrlState] = useState(initialUrl);
  const [validation, setValidation] = useState<UrlValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const validate = useCallback(() => {
    const result = validateUrl(url, config);
    setValidation(result);
    return result;
  }, [url, config]);

  const setUrl = useCallback(
    (newUrl: string) => {
      setUrlState(newUrl);

      if (validateOnChange) {
        if (debounceMs > 0) {
          setIsValidating(true);
          const timeoutId = setTimeout(() => {
            const result = validateUrl(newUrl, config);
            setValidation(result);
            setIsValidating(false);
          }, debounceMs);

          return () => clearTimeout(timeoutId);
        } else {
          const result = validateUrl(newUrl, config);
          setValidation(result);
        }
      }
    },
    [validateOnChange, debounceMs, config]
  );

  const reset = useCallback(() => {
    setUrlState('');
    setValidation(null);
    setIsValidating(false);
  }, []);

  return {
    url,
    setUrl,
    validation,
    isValid: validation?.isValid ?? false,
    isValidating,
    validate,
    reset,
  };
}

/**
 * Example usage in a component:
 * 
 * const { url, setUrl, validation, isValid, validate } = useUrlValidator('', {
 *   validateOnChange: true,
 *   debounceMs: 300,
 * });
 * 
 * <input 
 *   value={url} 
 *   onChange={(e) => setUrl(e.target.value)}
 * />
 * {validation && !validation.isValid && (
 *   <p className="error">{validation.error}</p>
 * )}
 */
