import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  initializeGoogleAuth, 
  triggerGoogleSignIn, 
  clearGoogleCredential,
  decodeGoogleCredential 
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
    // Initialize Google Auth when component mounts
    const initAuth = async () => {
      try {
        await initializeGoogleAuth();
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize Google Auth:', error);
        toast({
          title: "Error",
          description: "Failed to initialize Google authentication",
          variant: "destructive",
        });
      }
    };

    initAuth();

    // Listen for Google auth success
    const handleGoogleAuthSuccess = async (event: CustomEvent) => {
      const { credential } = event.detail;
      
      if (credential) {
        setIsLoading(true);
        try {
          // Decode the credential to get user info
          const userData = decodeGoogleCredential(credential);
          console.log('Google user data:', userData);
          
          // Call your backend with the credential
          await googleSignIn(credential);
          
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

    window.addEventListener('googleAuthSuccess', handleGoogleAuthSuccess as EventListener);

    return () => {
      window.removeEventListener('googleAuthSuccess', handleGoogleAuthSuccess as EventListener);
    };
  }, [googleSignIn, onSuccess, onError, toast]);

  const handleGoogleSignIn = () => {
    if (!isInitialized) {
      toast({
        title: "Error",
        description: "Google authentication not initialized yet",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      triggerGoogleSignIn();
    } catch (error) {
      console.error('Failed to trigger Google sign-in:', error);
      toast({
        title: "Error",
        description: "Failed to start Google sign-in",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={!isInitialized || isLoading}
      className={`w-full h-12 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border-2 border-gray-300 transition-colors duration-200 flex items-center justify-center space-x-3 ${className}`}
    >
      {isLoading ? (
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-700"></div>
      ) : (
        <>
          {/* Google Icon */}
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span>Continue with Google</span>
        </>
      )}
    </Button>
  );
};
