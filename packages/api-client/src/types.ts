/**
 * HTTP methods supported by the API client.
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * Standard API response envelope.
 */
export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
  timestamp: string;
}

/**
 * Paginated API response with cursor metadata.
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  status: number;
  message: string;
  timestamp: string;
}

/**
 * Structured API error payload returned by the server.
 */
export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
  details?: Record<string, unknown>;
  requestId?: string;
}

/**
 * Configuration for an individual HTTP request.
 */
export interface RequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  signal?: AbortSignal;
  timeout?: number;
}
