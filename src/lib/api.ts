const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';

// Types
export interface User {
  _id: string;  // Changed to match backend response
  name: string;
  email: string;
  dob: string;
  createdAt: string;
}

export interface Note {
  _id: string;  // Changed to match backend response
  title: string;
  content: string;
  userId: string;  // Added userId field from API response
  createdAt: string;
  updatedAt: string;
  __v?: number;  // Added version field from API response
}

export interface NotesResponse {
  notes: Note[];
  userId: string;
  count: number;
}

export interface SignUpData {
  email: string;
  name: string;
  dob: string;
}

export interface SignInData {
  email: string;
}

export interface OTPVerificationData {
  email: string;
  otp: string;
  keepLoggedIn?: boolean;
}

export interface OTPResponse {
  message: string;
  email: string;
  _id: string;  // Changed to match backend response
  otp: string;
  expiresAt: string;
}

export interface GoogleAuthResponse {
  user: User;
  message: string;
  token: string; // JWT token
}

// API Client
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Get JWT token from storage
    const token = localStorage.getItem('jwt_token') || sessionStorage.getItem('jwt_token');
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      credentials: 'include', // Include cookies for session management
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.details) {
            errorMessage = errorData.details;
          }
        } catch (parseError) {
          // If response is not JSON, use status text
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        
        // Create a custom error with more details
        const customError = new Error(errorMessage) as Error & {
          status: number;
          statusText: string;
          url: string;
        };
        customError.status = response.status;
        customError.statusText = response.statusText;
        customError.url = url;
        throw customError;
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Health Check
  async healthCheck(): Promise<{ status: string; message: string }> {
    return this.request('/api/health');
  }

  // Authentication APIs
  async signUp(data: SignUpData): Promise<OTPResponse> {
    return this.request<OTPResponse>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyOTP(data: OTPVerificationData): Promise<{ user: User; message: string }> {
    return this.request('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async signIn(data: SignInData): Promise<OTPResponse> {
    return this.request<OTPResponse>('/api/auth/signin', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifySignInOTP(data: OTPVerificationData): Promise<{ user: User; message: string }> {
    return this.request('/api/auth/verify-signin-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCurrentUser(): Promise<User> {
    return this.request('/api/auth/me');
  }

  async logout(): Promise<{ message: string }> {
    return this.request('/api/auth/logout', {
      method: 'POST',
    });
  }

  // Google OAuth
  async googleAuth(googleToken: string): Promise<GoogleAuthResponse> {
    return this.request<GoogleAuthResponse>('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify({ token: googleToken }),
    });
  }

  // Notes APIs
  async getNotes(): Promise<NotesResponse> {
    return this.request<NotesResponse>('/api/notes');
  }

  async createNote(data: { title: string; content: string }): Promise<Note> {
    return this.request('/api/notes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateNote(id: string, data: { title: string; content: string }): Promise<Note> {
    return this.request(`/api/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteNote(id: string): Promise<{ message: string }> {
    return this.request(`/api/notes/${id}`, {
      method: 'DELETE',
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient(BASE_URL);
