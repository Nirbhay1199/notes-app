import { GoogleAuthResponse } from './api';

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

// GoogleAuthResponse is now defined in api.ts

export interface GoogleCredentialResponse {
  credential: string;
  select_by: string;
}

// Google OAuth Functions
export const initializeGoogleAuth = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!GOOGLE_CLIENT_ID) {
      reject(new Error('Google Client ID not configured'));
      return;
    }

    // Check if Google script is already loaded
    if (window.google) {
      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: false,
        });
        resolve();
        return;
      } catch (error) {
        console.error('Failed to initialize existing Google object:', error);
      }
    }

    // Wait for Google script to load (since it's in index.html)
    const checkGoogle = () => {
      if (window.google) {
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
export const handleGoogleCredentialResponse = (response: GoogleCredentialResponse) => {
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

// New function to initialize Google with renderButton approach
export const initializeGoogleAuthWithButton = (callback: (response: GoogleCredentialResponse) => void): void => {
  if (!window.google || !window.google.accounts) {
    console.error('Google Identity Services not loaded');
    return;
  }

  if (!GOOGLE_CLIENT_ID) {
    console.error('Google Client ID not configured');
    return;
  }

  try {
    console.log('Initializing Google with Client ID:', GOOGLE_CLIENT_ID);
    
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: callback,
    });

    const buttonElement = document.getElementById("google-button");
    if (!buttonElement) {
      console.error('Google button element not found');
      return;
    }

    console.log('Rendering Google button...');
    // Render the Google button
    window.google.accounts.id.renderButton(
      buttonElement,
      {
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "rectangular",
        width: "100%"
      }
    );
    
    console.log('Google button rendered successfully');
  } catch (error) {
    console.error('Failed to initialize Google Auth with button:', error);
  }
};

// Decode JWT token from Google (for debugging)
export const decodeGoogleCredential = (credential: string): Record<string, unknown> | null => {
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
          initialize: (config: { client_id: string; callback: (response: GoogleCredentialResponse) => void; auto_select?: boolean; cancel_on_tap_outside?: boolean }) => void;
          prompt: () => void;
          disableAutoSelect: () => void;
          renderButton: (element: HTMLElement | null, options: { theme?: string; size?: string; text?: string; shape?: string; width?: string }) => void;
        };
      };
    };
  }
}
