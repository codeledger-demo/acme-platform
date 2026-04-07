import { AppError } from '@acme/shared-utils';
import type { ApiResponse, HttpMethod, RequestConfig } from './types.js';

/**
 * Interceptor that can modify outgoing requests.
 */
export type RequestInterceptor = (
  url: string,
  init: RequestInit,
) => RequestInit | Promise<RequestInit>;

/**
 * Interceptor that can modify or inspect incoming responses.
 */
export type ResponseInterceptor = (
  response: Response,
) => Response | Promise<Response>;

export interface AcmeClientOptions {
  baseUrl: string;
  authToken?: string;
  defaultHeaders?: Record<string, string>;
}

/**
 * Typed HTTP client for the Acme SaaS platform API.
 * Wraps the native `fetch` API with auth, interceptors, and error handling.
 */
export class AcmeClient {
  private readonly baseUrl: string;
  private authToken: string | undefined;
  private readonly defaultHeaders: Record<string, string>;
  private readonly requestInterceptors: RequestInterceptor[] = [];
  private readonly responseInterceptors: ResponseInterceptor[] = [];

  constructor(options: AcmeClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/+$/, '');
    this.authToken = options.authToken;
    this.defaultHeaders = options.defaultHeaders ?? {};
  }

  /** Update the auth token (e.g. after a token refresh). */
  setAuthToken(token: string): void {
    this.authToken = token;
  }

  /** Clear the auth token (e.g. on logout). */
  clearAuthToken(): void {
    this.authToken = undefined;
  }

  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  async get<T>(path: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('GET', path, undefined, config);
  }

  async post<T>(path: string, body?: unknown, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('POST', path, body, config);
  }

  async put<T>(path: string, body?: unknown, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', path, body, config);
  }

  async delete<T>(path: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', path, undefined, config);
  }

  private buildUrl(path: string, params?: Record<string, string | number | boolean>): string {
    const url = new URL(`${this.baseUrl}${path}`);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, String(value));
      }
    }
    return url.toString();
  }

  private async request<T>(
    method: HttpMethod,
    path: string,
    body?: unknown,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(path, config?.params);

    let init: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...this.defaultHeaders,
        ...(this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {}),
        ...config?.headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: config?.signal,
    };

    for (const interceptor of this.requestInterceptors) {
      init = await interceptor(url, init);
    }

    let response: Response;
    try {
      response = await fetch(url, init);
    } catch (err: unknown) {
      throw new AppError('Network request failed', {
        code: 'NETWORK_ERROR',
        statusCode: 0,
        details: { url, method },
        cause: err,
      });
    }

    for (const interceptor of this.responseInterceptors) {
      response = await interceptor(response);
    }

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({})) as Record<string, unknown>;
      throw new AppError(
        (errorBody['message'] as string) ?? `Request failed with status ${response.status}`,
        {
          code: (errorBody['code'] as string) ?? 'API_ERROR',
          statusCode: response.status,
          details: { url, method, response: errorBody },
        },
      );
    }

    return (await response.json()) as ApiResponse<T>;
  }
}
