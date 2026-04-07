import type { AcmeClient } from '../client.js';
import type { ApiResponse } from '../types.js';

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  organizationId: string;
  createdAt: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  organizationName?: string;
}

/**
 * Authentication and user identity API methods.
 */
export class AuthApi {
  constructor(private readonly client: AcmeClient) {}

  /** Authenticate with email and password. */
  async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    return this.client.post<LoginResponse>('/auth/login', { email, password });
  }

  /** Register a new user account. */
  async register(input: RegisterInput): Promise<ApiResponse<UserProfile>> {
    return this.client.post<UserProfile>('/auth/register', input);
  }

  /** Invalidate the current session. */
  async logout(): Promise<ApiResponse<{ success: boolean }>> {
    return this.client.post<{ success: boolean }>('/auth/logout');
  }

  /** Exchange a refresh token for a new access token. */
  async refreshToken(refreshToken: string): Promise<ApiResponse<LoginResponse>> {
    return this.client.post<LoginResponse>('/auth/refresh', { refreshToken });
  }

  /** Fetch the authenticated user's profile. */
  async getProfile(): Promise<ApiResponse<UserProfile>> {
    return this.client.get<UserProfile>('/auth/profile');
  }
}
