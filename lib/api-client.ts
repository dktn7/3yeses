/**
 * API Client with automatic token refresh
 * Handles expired tokens by attempting refresh before retrying requests
 */

interface ApiResponse<T = any> {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
}

class ApiClient {
  private isRefreshing = false;
  private refreshPromise: Promise<boolean> | null = null;

  /**
   * Refresh the access token using the refresh token
   */
  private async refreshAccessToken(): Promise<boolean> {
    // Prevent multiple simultaneous refresh attempts
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;

    this.refreshPromise = (async () => {
      try {
        const response = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          console.log('[API] Token refreshed successfully');
          return true;
        } else {
          console.error('[API] Token refresh failed with status:', response.status);
          return false;
        }
      } catch (error) {
        console.error('[API] Token refresh error:', error);
        return false;
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  /**
   * Make an API request with automatic token refresh on 401
   */
  async request<T = any>(
    url: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(url, {
        ...options,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      // If unauthorized and we haven't retried yet, try refreshing token
      if (response.status === 401 && retryCount === 0) {
        console.warn('[API] Got 401, attempting token refresh');
        
        const refreshed = await this.refreshAccessToken();
        
        if (refreshed) {
          // Retry the original request after token refresh
          console.log('[API] Retrying request after token refresh');
          return this.request<T>(url, options, retryCount + 1);
        } else {
          // Token refresh failed, redirect to login
          console.error('[API] Token refresh failed, redirecting to login');
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          return {
            ok: false,
            status: 401,
            error: 'Authentication failed. Please log in again.',
          };
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          ok: false,
          status: response.status,
          error: errorData.error || `Request failed with status ${response.status}`,
        };
      }

      const data = await response.json();
      return {
        ok: true,
        status: response.status,
        data,
      };
    } catch (error) {
      console.error('[API] Request error:', error);
      return {
        ok: false,
        status: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * GET request
   */
  get<T = any>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  post<T = any>(url: string, body?: any, options: RequestInit = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * PUT request
   */
  put<T = any>(url: string, body?: any, options: RequestInit = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * DELETE request
   */
  delete<T = any>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: 'DELETE' });
  }

  /**
   * PATCH request
   */
  patch<T = any>(url: string, body?: any, options: RequestInit = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export type for responses
export type { ApiResponse };
