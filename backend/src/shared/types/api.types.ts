/**
 * API Response Types
 * 
 * Standard response formats for all API endpoints
 */

/**
 * Standard success response
 */
export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  count?: number;
  message?: string;
}

/**
 * Standard error response
 */
export interface ApiErrorResponse {
  success: false;
  message: string;
  error?: string;
  errors?: Record<string, string[]>;
  code?: string;
  stack?: string;
}

/**
 * Standard API response (union type)
 */
export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Sort parameters
 */
export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Filter parameters (generic)
 */
export interface FilterParams {
  [key: string]: any;
}

/**
 * Query parameters (combines pagination, sort, and filters)
 */
export interface QueryParams extends PaginationParams, SortParams, FilterParams {}
