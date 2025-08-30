import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { apiClient, User } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signUp: (email: string, name: string, dob: string) => Promise<string>;
  verifyOTP: (email: string, otp: string) => Promise<void>;
  signIn: (email: string) => Promise<string>;
  verifySignInOTP: (email: string, otp: string, keepLoggedIn?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  googleSignIn: (googleToken: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const { toast } = useToast();

  // Helper functions for persistent authentication
  const saveUserToStorage = (userData: User, keepLoggedIn: boolean = false) => {
    const storage = keepLoggedIn ? localStorage : sessionStorage;
    storage.setItem('user', JSON.stringify(userData));
    storage.setItem('authTimestamp', Date.now().toString());
  };

  const loadUserFromStorage = (): User | null => {
    // Try localStorage first (persistent), then sessionStorage (session-only)
    let userData = localStorage.getItem('user');
    let authTimestamp = localStorage.getItem('authTimestamp');
    
    if (!userData) {
      userData = sessionStorage.getItem('user');
      authTimestamp = sessionStorage.getItem('authTimestamp');
    }

    if (userData && authTimestamp) {
      const user = JSON.parse(userData);
      const timestamp = parseInt(authTimestamp);
      const now = Date.now();
      
      // Check if session is still valid (24 hours for localStorage, 8 hours for sessionStorage)
      const maxAge = localStorage.getItem('user') ? 24 * 60 * 60 * 1000 : 8 * 60 * 60 * 1000;
      
      if (now - timestamp < maxAge) {
        return user;
      } else {
        // Session expired, clear storage
        localStorage.removeItem('user');
        localStorage.removeItem('authTimestamp');
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('authTimestamp');
      }
    }
    
    return null;
  };

  const clearUserFromStorage = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('authTimestamp');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('authTimestamp');
  };

  const checkAuth = async () => {
    // Don't check auth if we're in the middle of signing up
    if (isSigningUp) {
      return;
    }

    try {
      // First try to load from storage
      const storedUser = loadUserFromStorage();
      if (storedUser) {
        setUser(storedUser);
        setIsLoading(false);
        return;
      }

      // Check if we have a JWT token
      const token = localStorage.getItem('jwt_token') || sessionStorage.getItem('jwt_token');
      if (!token) {
        // No token, user is not authenticated
        setUser(null);
        setIsLoading(false);
        return;
      }

      // If we have a token, try to get from API
      const currentUser = await apiClient.getCurrentUser();
      setUser(currentUser);
      // Save to storage (default to session storage for API-fetched users)
      saveUserToStorage(currentUser, false);
    } catch (error) {
      // User is not authenticated, clear token and user
      localStorage.removeItem('jwt_token');
      sessionStorage.removeItem('jwt_token');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);



  const signUp = async (email: string, name: string, dob: string): Promise<string> => {
    try {
      const response = await apiClient.signUp({ email, name, dob });
      toast({
        title: "Success!",
        description: "OTP sent to your email. Please check and verify.",
      });
      return response.otp;
    } catch (error) {
      let errorTitle = "Error";
      let errorDescription = "Sign up failed";
      
      if (error instanceof Error) {
        errorDescription = error.message;
        // Check if it's a 404 or other specific error
        if ((error as any).status === 404) {
          errorTitle = "Not Found";
        } else if ((error as any).status >= 500) {
          errorTitle = "Server Error";
        } else if ((error as any).status >= 400) {
          errorTitle = "Request Error";
        }
      }
      
      toast({
        title: errorTitle,
        description: errorDescription,
        variant: "destructive",
      });
      throw error;
    }
  };

  const verifyOTP = async (email: string, otp: string) => {
    try {
      setIsSigningUp(true);
      const result = await apiClient.verifyOTP({ email, otp });
      
      setUser(result.user);
      
      // Store JWT token
      if (result.token) {
        localStorage.setItem('jwt_token', result.token);
      }
      
      // Save user to storage (default to session storage for signup)
      saveUserToStorage(result.user, false);
      
      toast({
        title: "Success!",
        description: "Account created successfully!",
      });
    } catch (error) {
      let errorTitle = "Error";
      let errorDescription = "OTP verification failed";
      
      if (error instanceof Error) {
        errorDescription = error.message;
        if ((error as any).status === 404) {
          errorTitle = "Not Found";
        } else if ((error as any).status >= 500) {
          errorTitle = "Server Error";
        } else if ((error as any).status >= 400) {
          errorTitle = "Request Error";
        }
      }
      
      toast({
        title: errorTitle,
        description: errorDescription,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSigningUp(false);
    }
  };

  const signIn = async (email: string): Promise<string> => {
    try {
      const response = await apiClient.signIn({ email });
      toast({
        title: "Success!",
        description: "OTP sent to your email. Please check and verify.",
      });
      return response.otp;
    } catch (error) {
      let errorTitle = "Error";
      let errorDescription = "Sign in failed";
      
      if (error instanceof Error) {
        errorDescription = error.message;
        if ((error as any).status === 404) {
          errorTitle = "Not Found";
        } else if ((error as any).status >= 500) {
          errorTitle = "Server Error";
        } else if ((error as any).status >= 400) {
          errorTitle = "Request Error";
        }
      }
      
      toast({
        title: errorTitle,
        description: errorDescription,
        variant: "destructive",
      });
      throw error;
    }
  };

  const verifySignInOTP = async (email: string, otp: string, keepLoggedIn: boolean = false) => {
    try {
      const result = await apiClient.verifySignInOTP({ email, otp });
      setUser(result.user);
      
      // Store JWT token
      if (result.token) {
        if (keepLoggedIn) {
          localStorage.setItem('jwt_token', result.token);
        } else {
          sessionStorage.setItem('jwt_token', result.token);
        }
      }
      
      // Save user to storage based on keepLoggedIn preference
      saveUserToStorage(result.user, keepLoggedIn);
      toast({
        title: "Success!",
        description: "Signed in successfully!",
      });
    } catch (error) {
      let errorTitle = "Error";
      let errorDescription = "OTP verification failed";
      
      if (error instanceof Error) {
        errorDescription = error.message;
        if ((error as any).status === 404) {
          errorTitle = "Not Found";
        } else if ((error as any).status >= 500) {
          errorTitle = "Server Error";
        } else if ((error as any).status >= 400) {
          errorTitle = "Request Error";
        }
      }
      
      toast({
        title: errorTitle,
        description: errorDescription,
        variant: "destructive",
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
      setUser(null);
      
      // Clear JWT token
      localStorage.removeItem('jwt_token');
      sessionStorage.removeItem('jwt_token');
      
      clearUserFromStorage();
      toast({
        title: "Success!",
        description: "Logged out successfully!",
      });
    } catch (error) {
      let errorTitle = "Error";
      let errorDescription = "Logout failed";
      
      if (error instanceof Error) {
        errorDescription = error.message;
        if ((error as any).status === 404) {
          errorTitle = "Not Found";
        } else if ((error as any).status >= 500) {
          errorTitle = "Server Error";
        } else if ((error as any).status >= 400) {
          errorTitle = "Request Error";
        }
      }
      
      toast({
        title: errorTitle,
        description: errorDescription,
        variant: "destructive",
      });
    }
  };

  const googleSignIn = async (googleToken: string) => {
    try {
      const result = await apiClient.googleAuth(googleToken);
      
      setUser(result.user);
      
      // Store JWT token
      if (result.token) {
        localStorage.setItem('jwt_token', result.token);
      }
      
      // Save user to storage (default to localStorage for Google sign-in)
      saveUserToStorage(result.user, true);
      
      toast({
        title: "Success!",
        description: "Signed in with Google successfully!",
      });
    } catch (error) {
      let errorTitle = "Error";
      let errorDescription = "Google sign-in failed";
      
      if (error instanceof Error) {
        errorDescription = error.message;
        if ((error as any).status === 404) {
          errorTitle = "Not Found";
        } else if ((error as any).status >= 500) {
          errorTitle = "Server Error";
        } else if ((error as any).status >= 400) {
          errorTitle = "Request Error";
        }
      }
      
      toast({
        title: errorTitle,
        description: errorDescription,
        variant: "destructive",
      });
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    signUp,
    verifyOTP,
    signIn,
    verifySignInOTP,
    logout,
    checkAuth,
    googleSignIn,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
