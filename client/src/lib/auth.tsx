import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../../../lib/supabase-client';
import { apiRequest } from './queryClient';

interface UserProfile {
  id: number;
  email: string;
  username: string;
  institutionName: string | null;
  institutionType: string | null;
  role: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  needsProfileSetup: boolean;
  signUp: (email: string, password: string, metadata?: { username: string; institutionName?: string | null; institutionType?: string | null }) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  createUserProfile: (username: string, institution?: string) => Promise<{ error: Error | null }>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsProfileSetup, setNeedsProfileSetup] = useState(false);

  const fetchUserProfile = async (email: string): Promise<UserProfile | null> => {
    try {
      const response = await apiRequest('GET', `/api/user-profile?email=${encodeURIComponent(email)}`);
      const profile = await response.json();
      return profile;
    } catch (error) {
      console.log('User profile not found, needs setup');
      return null;
    }
  };

  const refreshUserProfile = async () => {
    if (user?.email) {
      const profile = await fetchUserProfile(user.email);
      setUserProfile(profile);
      setNeedsProfileSetup(!profile);
    }
  };

  useEffect(() => {
    if (!supabase) {
      console.warn('Supabase client not available');
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user?.email) {
        const profile = await fetchUserProfile(session.user.email);
        setUserProfile(profile);
        setNeedsProfileSetup(!profile);
      }
      
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user?.email) {
        const profile = await fetchUserProfile(session.user.email);
        setUserProfile(profile);
        setNeedsProfileSetup(!profile);
      } else {
        setUserProfile(null);
        setNeedsProfileSetup(false);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, metadata?: { username: string; institutionName?: string | null; institutionType?: string | null }) => {
    if (!supabase) {
      return { error: new Error('Supabase client not available') as AuthError };
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: metadata ? {
          username: metadata.username,
          institution_name: metadata.institutionName,
          institution_type: metadata.institutionType,
        } : undefined,
      },
    });

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      return { error: new Error('Supabase client not available') as AuthError };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error };
  };

  const signOut = async () => {
    if (!supabase) {
      return { error: new Error('Supabase client not available') as AuthError };
    }

    const { error } = await supabase.auth.signOut();
    
    // Clear profile state on sign out
    setUserProfile(null);
    setNeedsProfileSetup(false);
    
    return { error };
  };

  const signInWithGoogle = async () => {
    if (!supabase) {
      return { error: new Error('Supabase client not available') as AuthError };
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    return { error };
  };

  const createUserProfile = async (username: string, institution?: string) => {
    if (!user?.email) {
      return { error: new Error('No user email available') };
    }

    try {
      const response = await apiRequest('POST', '/api/user-profile', {
        email: user.email,
        username,
        institution,
      });

      const profile = await response.json();
      setUserProfile(profile);
      setNeedsProfileSetup(false);
      
      return { error: null };
    } catch (error) {
      console.error('Failed to create user profile:', error);
      return { error: error as Error };
    }
  };

  const value = {
    user,
    userProfile,
    session,
    loading,
    needsProfileSetup,
    signUp,
    signIn,
    signOut,
    signInWithGoogle,
    createUserProfile,
    refreshUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 