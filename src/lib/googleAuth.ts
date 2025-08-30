// Google OAuth Configuration
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

// Google OAuth Types
export interface GoogleUserData {
  id: string;
  email: string;
  name: string;
  picture: string;
  given_name?: string;
  family_name?: string;
}

export interface GoogleAuthResponse {
  user: any; // Will be replaced with your User interface
  message: string;
  token: string; // JWT token
}

// Google OAuth Functions
export const initializeGoogleAuth = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!GOOGLE_CLIENT_ID) {
      reject(new Error('Google Client ID not configured'));
      return;
    }

    // Check if Google script is already loaded
    if (window.google && window.google.accounts) {
      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        resolve();
        return;
      } catch (error) {
        console.error('Failed to initialize existing Google object:', error);
      }
    }

    // Wait for Google script to load (since it's in index.html)
    const checkGoogle = () => {
      if (window.google && window.google.accounts) {
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });
          resolve();
        } catch (error) {
          reject(new Error(`Failed to initialize Google: ${error}`));
        }
      } else {
        // Wait a bit more for the script to load
        setTimeout(checkGoogle, 100);
      }
    };

    // Start checking for Google availability
    checkGoogle();
  });
};

// Handle Google credential response
export const handleGoogleCredentialResponse = (response: any) => {
  // This will be called by Google after successful authentication
  // You can access the credential with response.credential
  console.log('Google credential received:', response);
  
  // Store the credential temporarily or pass it to your auth handler
  localStorage.setItem('google_credential', response.credential);
  
  // Trigger a custom event that your component can listen to
  window.dispatchEvent(new CustomEvent('googleAuthSuccess', {
    detail: { credential: response.credential }
  }));
};

// Get Google credential from storage
export const getGoogleCredential = (): string | null => {
  return localStorage.getItem('google_credential');
};

// Clear Google credential
export const clearGoogleCredential = (): void => {
  localStorage.removeItem('google_credential');
};

// Trigger Google sign-in
export const triggerGoogleSignIn = (): void => {
  if (window.google && window.google.accounts) {
    window.google.accounts.id.prompt();
  } else {
    console.error('Google Identity Services not initialized');
  }
};

// Trigger Google sign-out
export const triggerGoogleSignOut = (): void => {
  if (window.google && window.google.accounts) {
    window.google.accounts.id.disableAutoSelect();
    clearGoogleCredential();
  }
};

// Decode JWT token from Google (for debugging)
export const decodeGoogleCredential = (credential: string): any => {
  try {
    const base64Url = credential.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode Google credential:', error);
    return null;
  }
};

// Extend Window interface for Google types
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: () => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}
