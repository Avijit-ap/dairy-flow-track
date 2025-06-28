
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';

type UserRole = Database['public']['Enums']['user_role'] | 'super_admin';

interface AuthContextType {
  user: User | null;
  userRole: UserRole | null;
  profile: any;
  loading: boolean;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData?: any) => Promise<{ error: any }>;
  inviteAgent: (email: string, name: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUserData = async (userId: string) => {
    try {
      // Get user role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      // Get user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select(`
          *,
          areas (name, district),
          assigned_agent:profiles!assigned_agent_id (full_name, phone)
        `)
        .eq('id', userId)
        .single();

      setUserRole(roleData?.role || null);
      setProfile(profileData || null);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchUserData(session.user.id);
      } else {
        setUserRole(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, userData?: any) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    });
    return { error };
  };

  const inviteAgent = async (email: string, name: string) => {
    try {
      // Send magic link invitation
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          data: { 
            full_name: name, 
            role: 'agent' 
          }
        }
      });

      if (error) {
        toast({
          title: "Invitation Failed",
          description: error.message,
          variant: "destructive"
        });
        return { error };
      }

      toast({
        title: "Invitation Sent",
        description: `Magic link sent to ${email}`,
      });

      return { error: null };
    } catch (error) {
      console.error('Invite error:', error);
      return { error };
    }
  };

  const value = {
    user,
    userRole,
    profile,
    loading,
    signOut,
    signIn,
    signUp,
    inviteAgent,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
