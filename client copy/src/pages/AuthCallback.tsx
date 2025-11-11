import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase-client';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Processing...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      if (!supabase) {
        console.error('Supabase client not available');
        navigate('/');
        return;
      }

      try {
        setStatus('Verifying authentication...');
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          toast({
            title: "Authentication Error",
            description: "There was an issue completing your authentication. Please try again.",
            variant: "destructive",
          });
          navigate('/');
          return;
        }

        if (data.session?.user) {
          const user = data.session.user;
          console.log('User authenticated:', user.email);
          console.log('User metadata:', user.user_metadata);

          // Check if this user has profile data in metadata (from signup)
          const metadata = user.user_metadata;
          if (metadata?.username) {
            setStatus('Creating your profile...');
            
            try {
              // Create user profile from signup metadata
              const response = await apiRequest('POST', '/api/user-profile', {
                email: user.email,
                username: metadata.username,
                institutionName: metadata.institution_name || null,
                institutionType: metadata.institution_type || null,
              });

              if (response.ok) {
                console.log('User profile created successfully');
                toast({
                  title: "Welcome!",
                  description: `Your account has been created successfully, ${metadata.username}!`,
                });
              } else {
                const errorData = await response.json();
                console.error('Profile creation failed:', errorData);
                
                // If username is taken, we still let them in but they'll need to update it
                if (errorData.message?.includes('already taken')) {
                  toast({
                    title: "Username Issue",
                    description: "Your chosen username was taken. You can update it in your profile settings.",
                    variant: "destructive",
                  });
                } else {
                  toast({
                    title: "Profile Setup Issue",
                    description: "There was an issue setting up your profile. You can complete it later.",
                    variant: "destructive",
                  });
                }
              }
            } catch (profileError) {
              console.error('Profile creation error:', profileError);
              toast({
                title: "Profile Setup Issue",
                description: "There was an issue setting up your profile. You can complete it later.",
                variant: "destructive",
              });
            }
          }

          // Successfully authenticated, redirect to home
          setStatus('Redirecting...');
          setTimeout(() => navigate('/'), 1000);
          
        } else {
          // No session, redirect to home
          console.log('No session found, redirecting to home');
          navigate('/');
        }
      } catch (error) {
        console.error('Unexpected error during auth callback:', error);
        toast({
          title: "Authentication Error",
          description: "An unexpected error occurred. Please try signing in again.",
          variant: "destructive",
        });
        navigate('/');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-lg text-gray-700 font-medium">{status}</p>
        <p className="mt-2 text-sm text-gray-500">Please wait while we complete your setup...</p>
      </div>
    </div>
  );
};

export default AuthCallback; 