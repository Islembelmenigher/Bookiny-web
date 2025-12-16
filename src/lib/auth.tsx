import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string, role: 'client' | 'business_owner', phone?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Handle Google OAuth callback - update profile with selected account type
      if (event === 'SIGNED_IN' && session?.user) {
        const pendingAccountType = localStorage.getItem('pendingAccountType');
        if (pendingAccountType && (pendingAccountType === 'client' || pendingAccountType === 'business_owner')) {
          // Use setTimeout to avoid Supabase auth deadlock
          setTimeout(async () => {
            try {
              // Check if profile exists and if role needs to be set
              const { data: existingProfile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', session.user.id)
                .single();
              
              // Only update if this is a new user (role is default 'client' from trigger)
              // or if the profile was just created
              if (existingProfile && existingProfile.role === 'client' && pendingAccountType === 'business_owner') {
                await supabase
                  .from('profiles')
                  .update({ 
                    role: pendingAccountType,
                    email: session.user.email,
                    full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || 'User',
                    avatar_url: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture
                  })
                  .eq('id', session.user.id);
              } else if (existingProfile) {
                // Just update email, name, avatar for existing users
                await supabase
                  .from('profiles')
                  .update({ 
                    email: session.user.email,
                    full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || existingProfile.role,
                    avatar_url: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture
                  })
                  .eq('id', session.user.id);
              }
            } catch (error) {
              console.error('Error updating profile after OAuth:', error);
            } finally {
              localStorage.removeItem('pendingAccountType');
            }
          }, 0);
        }
      }
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string, role: 'client' | 'business_owner', phone?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
        },
        emailRedirectTo: `${window.location.origin}/`,
      },
    });
    
    // Update phone and email in profiles if signup successful
    if (!error && data.user) {
      await supabase.from('profiles').update({ 
        phone: phone || null,
        email: email
      }).eq('id', data.user.id);
    }
    
    return { error };
  };

  const signInWithGoogle = async () => {
    // Use the current origin for redirect - works for both localhost and production
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password?type=recovery`,
    });
    return { error };
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut, signInWithGoogle, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}