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

          const metadata = user.user_metadata || {};
          const email = user.email;

          // Prefer explicit signup username; otherwise derive one for OAuth users
          const derivedUsername = (
            metadata.username ||
            metadata.preferred_username ||
            metadata.full_name ||
            metadata.name ||
            email?.split('@')[0] ||
            ''
          )
            .toString()
            .toLowerCase()
            .replace(/[^a-z0-9_]/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '')
            .slice(0, 30);

          if (email && derivedUsername.length >= 3) {
            setStatus('Setting up your profile...');

            try {
              // Skip create if profile already exists
              let profileExists = false;
              try {
                const existing = await apiRequest(
                  'GET',
                  `/api/user-profile?email=${encodeURIComponent(email)}`
                );
                profileExists = existing.ok;
              } catch {
                profileExists = false;
              }

              if (!profileExists) {
                try {
                  await apiRequest('POST', '/api/user-profile', {
                    email,
                    username: derivedUsername,
                    institutionName: metadata.institution_name || null,
                    institutionType: metadata.institution_type || null,
                  });
                  toast({
                    title: 'Welcome!',
                    description: `Your account is ready, ${derivedUsername}!`,
                  });
                } catch (createErr: any) {
                  console.error('Profile creation failed:', createErr);
                  const message = createErr?.message || createErr?.data?.message || '';

                  if (message.includes('already taken')) {
                    // Retry with a short unique suffix so OAuth users aren't stuck
                    const fallback = `${derivedUsername.slice(0, 24)}_${Math.random()
                      .toString(36)
                      .slice(2, 6)}`;
                    try {
                      await apiRequest('POST', '/api/user-profile', {
                        email,
                        username: fallback,
                        institutionName: metadata.institution_name || null,
                        institutionType: metadata.institution_type || null,
                      });
                      toast({
                        title: 'Welcome!',
                        description: `Your account is ready, ${fallback}!`,
                      });
                    } catch {
                      toast({
                        title: 'Profile Setup Needed',
                        description: 'Please choose a username to finish setup.',
                        variant: 'destructive',
                      });
                    }
                  } else {
                    toast({
                      title: 'Profile Setup Needed',
                      description: 'Please finish setting up your profile.',
                      variant: 'destructive',
                    });
                  }
                }
              }
            } catch (profileError) {
              console.error('Profile creation error:', profileError);
              toast({
                title: 'Profile Setup Needed',
                description: 'Please finish setting up your profile.',
                variant: 'destructive',
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