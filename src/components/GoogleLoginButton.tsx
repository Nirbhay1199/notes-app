import { useState, useEffect } from 'react';
import { 
  initializeGoogleAuthWithButton, 
  clearGoogleCredential,
  decodeGoogleCredential,
  GoogleCredentialResponse
} from '@/lib/googleAuth';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface GoogleLoginButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

export const GoogleLoginButton = ({ 
  onSuccess, 
  onError, 
  className = "" 
}: GoogleLoginButtonProps) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { googleSignIn } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Initialize Google Auth with button when component mounts
    const initAuth = () => {
      try {
        console.log('Initializing Google Auth with button...');
        initializeGoogleAuthWithButton(handleCredentialResponse);
        setIsInitialized(true);
        
        // Check if button was actually rendered
        setTimeout(() => {
          const googleButton = document.getElementById("google-button");
          if (googleButton && googleButton.children.length === 0) {
            console.log('Google button not rendered, retrying...');
            // Retry rendering the button
            if (window.google && window.google.accounts) {
              window.google.accounts.id.renderButton(
                document.getElementById("google-button"),
                {
                  theme: "outline",
                  size: "large",
                  text: "continue_with",
                  shape: "rectangular",
                  width: "100%"
                }
              );
            }
          }
        }, 500);
      } catch (error) {
        console.error('Failed to initialize Google Auth:', error);
        toast({
          title: "Error",
          description: "Failed to initialize Google authentication",
          variant: "destructive",
        });
      }
    };

    // Wait for Google script to load
    if (window.google && window.google.accounts) {
      console.log('Google script already loaded, initializing...');
      initAuth();
    } else {
      console.log('Waiting for Google script to load...');
      // Wait for Google script to load
      const checkGoogle = () => {
        if (window.google && window.google.accounts) {
          console.log('Google script loaded, initializing...');
          initAuth();
        } else {
          setTimeout(checkGoogle, 100);
        }
      };
      checkGoogle();
    }
  }, [googleSignIn, onSuccess, onError, toast]);

  // Handle Google credential response
  const handleCredentialResponse = async (response: GoogleCredentialResponse) => {
    if (response.credential) {
      setIsLoading(true);
      try {
        // Decode the credential to get user info
        const userData = decodeGoogleCredential(response.credential);
        console.log('Google user data:', userData);
        
        // Call your backend with the credential
        await googleSignIn(response.credential);
        
        // Clear the credential from storage
        clearGoogleCredential();
        
        toast({
          title: "Success!",
          description: "Signed in with Google successfully!",
        });
        
        onSuccess?.();
      } catch (error) {
        console.error('Google sign-in failed:', error);
        const errorMessage = error instanceof Error ? error.message : 'Google sign-in failed';
        
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        
        onError?.(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {!isInitialized ? (
        <div className="w-full h-11 sm:h-12 bg-gray-100 text-gray-500 font-medium rounded-lg border-2 border-gray-200 flex items-center justify-center text-sm sm:text-base">
          <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-gray-400"></div>
          <span className="ml-2">Initializing Google...</span>
        </div>
      ) : (
        <>
          <div id="google-button"></div>
          {/* Fallback button in case Google button doesn't render */}
          <div className="mt-2 text-xs text-gray-500 text-center">
       
          </div>
        </>
      )}
    </div>
  );
};
