import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

interface GoogleSignInButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  text?: 'signin' | 'signup';
}

// For demo purposes, we'll use a mock Google Client ID
// In production, replace this with your actual Google Client ID
const GOOGLE_CLIENT_ID = "demo-google-client-id.apps.googleusercontent.com";

export default function GoogleSignInButton({
  onSuccess,
  onError,
  disabled = false,
  text = 'signin'
}: GoogleSignInButtonProps) {
  const { googleLogin } = useAuth();
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    // Check if Google script is loaded
    const checkGoogleLoaded = () => {
      if (window.google?.accounts?.id) {
        setIsGoogleLoaded(true);
      } else {
        // After 3 seconds, show fallback button
        setTimeout(() => setShowFallback(true), 3000);
      }
    };

    checkGoogleLoaded();

    // Check periodically for Google script
    const interval = setInterval(checkGoogleLoaded, 500);

    return () => clearInterval(interval);
  }, []);

  const handleGoogleClick = async () => {
    try {
      if (window.google?.accounts?.id) {
        // Real Google Sign-In implementation
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response: { credential: string }) => {
            try {
              await googleLogin(response.credential);
              toast.success('Successfully signed in with Google!');
              onSuccess?.();
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Failed to sign in with Google';
              toast.error(errorMessage);
              onError?.(errorMessage);
            }
          },
        });

        window.google.accounts.id.prompt();
      } else {
        // Demo mode - simulate Google sign-in
        toast.info('Google Sign-In Demo Mode - Set up Google OAuth to enable real authentication');

        // Simulate a successful Google login for demo purposes
        const mockCredential = "mock-google-jwt-token";
        try {
          // This will fail with the current server setup, but shows the flow
          await googleLogin(mockCredential);
          toast.success('Demo: Google Sign-In successful!');
          onSuccess?.();
        } catch (error) {
          toast.info('Demo Mode: To enable real Google Sign-In, follow the setup guide in GOOGLE_OAUTH_SETUP.md');
        }
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      toast.error('Failed to sign in with Google');
      onError?.('Failed to sign in with Google');
    }
  };

  // Always show the Google button (either real or demo)
  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleGoogleClick}
      disabled={disabled}
      className="w-full flex items-center justify-center space-x-3 py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      <span>
        {text === 'signin' ? 'Sign in' : 'Sign up'} with Google
        {!isGoogleLoaded && showFallback && ' (Demo)'}
      </span>
    </Button>
  );
}
